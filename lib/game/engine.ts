import { chebyshev, lerp } from "./iso";
import { findPath, isPassable } from "./pathfinding";
import { applySnapshot, loadSnapshot, saveWorld } from "./save";
import { generateWorld } from "./world";
import type {
  ItemKind,
  MobEntity,
  ResourceEntity,
  WorldState,
} from "./types";

const TICK_MS = 1000 / 60;
const WALK_TILES_PER_SEC = 3;
const RESOURCE_RESPAWN_MS = 25_000;
const MOB_RESPAWN_MS = 30_000;
const MOB_CHASE_RANGE = 4;
const MOB_ATTACK_RANGE = 1;
const MOB_ATTACK_COOLDOWN_MS = 1200;
const PLAYER_ATTACK_COOLDOWN_MS = 600;
const GATHER_BUSY_MS = 1200;
const SAVE_INTERVAL_MS = 5_000;

export type EngineEvents = {
  onState: (snapshot: HUDSnapshot) => void;
  onLog: (msg: string) => void;
};

export type HUDSnapshot = {
  hp: number;
  maxHp: number;
  gold: number;
  kills: number;
  resources: number;
  inventory: { kind: ItemKind; count: number }[];
  hotbar: (ItemKind | null)[];
  selectedSlot: number;
  realm: string;
  online: number;
  agentMode: boolean;
  skills: { gathering: number; combat: number; fishing: number };
};

function addItem(world: WorldState, kind: ItemKind, count: number) {
  const slot = world.player.inventory.find((s) => s.kind === kind);
  if (slot) slot.count += count;
  else world.player.inventory.push({ kind, count });
}

function toast(world: WorldState, msg: string) {
  world.toast = { msg, until: Date.now() + 2500 };
}

function tryAttackResource(world: WorldState, r: ResourceEntity, now: number) {
  const tool = world.player.hotbar[world.player.selectedSlot];
  const valid =
    (r.kind === "tree" && tool === "axe") ||
    (r.kind === "rock" && tool === "pickaxe") ||
    (r.kind === "coal" && tool === "pickaxe") ||
    (r.kind === "pond" && tool === "rod");
  if (!valid) {
    toast(world, `Equip the right tool to harvest ${r.kind}`);
    return;
  }
  world.player.busyKind =
    r.kind === "pond" ? "fish" : r.kind === "tree" ? "chop" : "mine";
  world.player.busyUntil = now + GATHER_BUSY_MS;
  r.hp -= 1;
  if (r.hp <= 0) {
    if (r.kind === "tree") addItem(world, "wood", 1);
    if (r.kind === "rock") addItem(world, "stone", 1);
    if (r.kind === "coal") addItem(world, "coal", 1);
    if (r.kind === "pond") addItem(world, "fish", 1);
    world.player.skills.gathering += r.kind === "coal" ? 2 : 1;
    world.player.resourcesGathered += 1;
    if (r.kind !== "pond") {
      r.respawnAt = now + RESOURCE_RESPAWN_MS;
      r.hp = r.maxHp;
    } else {
      // ponds don't deplete; just give a fish
      r.hp = r.maxHp;
    }
    toast(world, `+1 ${r.kind === "pond" ? "fish" : r.kind}`);
  }
}

function tryAttackMob(world: WorldState, m: MobEntity, now: number) {
  const tool = world.player.hotbar[world.player.selectedSlot];
  if (tool !== "sword") {
    toast(world, "Equip a sword to fight");
    return;
  }
  if (now - m.lastHitAt < PLAYER_ATTACK_COOLDOWN_MS) return;
  m.lastHitAt = now;
  const damage = 10 + Math.floor((world.player.skills.combat + world.player.equipBonuses.combat) * 1.5);
  m.hp -= damage;
  world.player.busyKind = "attack";
  world.player.busyUntil = now + PLAYER_ATTACK_COOLDOWN_MS;
  if (m.hp <= 0) {
    m.state = "dead";
    m.respawnAt = now + MOB_RESPAWN_MS;
    const tier = m.maxHp >= 200 ? 8 : m.maxHp >= 100 ? 4 : m.maxHp >= 50 ? 2 : 1;
    const drop = (5 + Math.floor(Math.random() * 11)) * tier;
    world.player.gold += drop;
    world.player.skills.combat += tier;
    world.player.kills += 1;
    toast(world, `+${drop} gold · ${m.kind} slain`);
  }
}

function stepResources(world: WorldState, now: number) {
  for (const r of world.resources) {
    if (r.respawnAt !== null && now >= r.respawnAt) {
      r.respawnAt = null;
      r.hp = r.maxHp;
    }
  }
}

function stepMobs(world: WorldState, now: number, dt: number) {
  for (const m of world.mobs) {
    if (m.state === "dead") {
      if (m.respawnAt !== null && now >= m.respawnAt) {
        m.tx = m.patrolHomeX;
        m.ty = m.patrolHomeY;
        m.hp = m.maxHp;
        m.state = "patrol";
        m.respawnAt = null;
      }
      continue;
    }

    const distToPlayer = chebyshev(m.tx, m.ty, world.player.tx, world.player.ty);
    if (distToPlayer <= MOB_ATTACK_RANGE) {
      m.state = "attack";
      if (now - m.lastHitAt >= MOB_ATTACK_COOLDOWN_MS) {
        m.lastHitAt = now;
        world.player.hp = Math.max(0, world.player.hp - m.damage);
        if (world.player.hp === 0) {
          // respawn at base
          world.player.hp = world.player.maxHp;
          world.player.tx = 14;
          world.player.ty = 15;
          world.player.px = 14;
          world.player.py = 15;
          world.player.path = [];
          toast(world, "You died — respawn at Verdant Glade.");
        }
      }
    } else if (distToPlayer <= MOB_CHASE_RANGE) {
      m.state = "chase";
      if (now >= m.moveCooldownUntil) {
        const dx = world.player.tx - m.tx;
        const dy = world.player.ty - m.ty;
        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);
        const tryStep = (nx: number, ny: number) => {
          if (!isPassable(world, nx, ny)) return false;
          if (nx === world.player.tx && ny === world.player.ty) return false;
          m.tx = nx;
          m.ty = ny;
          m.moveCooldownUntil = now + 500;
          return true;
        };
        if (Math.abs(dx) > Math.abs(dy)) {
          if (!tryStep(m.tx + stepX, m.ty)) tryStep(m.tx, m.ty + stepY);
        } else {
          if (!tryStep(m.tx, m.ty + stepY)) tryStep(m.tx + stepX, m.ty);
        }
      }
    } else {
      m.state = "patrol";
      if (now >= m.moveCooldownUntil && Math.random() < 0.02 * (dt / TICK_MS)) {
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
        const nx = m.tx + dx;
        const ny = m.ty + dy;
        if (
          isPassable(world, nx, ny) &&
          chebyshev(nx, ny, m.patrolHomeX, m.patrolHomeY) <= 4 &&
          !(nx === world.player.tx && ny === world.player.ty)
        ) {
          m.tx = nx;
          m.ty = ny;
          m.moveCooldownUntil = now + 1200;
        }
      }
    }
  }
}

function stepPlayer(world: WorldState, now: number, dt: number) {
  if (world.player.busyUntil > now) return;
  world.player.busyKind = null;
  // HP regen out of combat
  const inCombat = world.mobs.some(
    (m) => m.state !== "dead" && chebyshev(m.tx, m.ty, world.player.tx, world.player.ty) <= 2,
  );
  if (!inCombat && world.player.hp < world.player.maxHp) {
    world.player.hp = Math.min(world.player.maxHp, world.player.hp + dt * 0.005);
  }
  if (world.player.path.length === 0) {
    // snap interpolation
    world.player.px = world.player.tx;
    world.player.py = world.player.ty;
    world.player.walkProgress = 0;
    return;
  }
  const next = world.player.path[0];
  world.player.walkProgress += (dt / 1000) * WALK_TILES_PER_SEC;
  if (world.player.walkProgress >= 1) {
    world.player.tx = next.x;
    world.player.ty = next.y;
    world.player.px = next.x;
    world.player.py = next.y;
    world.player.walkProgress = 0;
    world.player.path.shift();
  } else {
    world.player.px = lerp(world.player.tx, next.x, world.player.walkProgress);
    world.player.py = lerp(world.player.ty, next.y, world.player.walkProgress);
  }
}

export class Engine {
  world: WorldState;
  events: EngineEvents;
  private lastTime = performance.now();
  private rafId: number | null = null;
  private hudInterval: number | null = null;
  private saveTimer = 0;
  private fakeOnline = 40 + Math.floor(Math.random() * 60);

  constructor(events: EngineEvents) {
    this.events = events;
    this.world = generateWorld();
    const snap = loadSnapshot();
    if (snap) applySnapshot(this.world, snap);
  }

  selectSlot(i: number) {
    if (i < 0 || i > 5) return;
    this.world.player.selectedSlot = i;
    this.emitHud();
  }

  // tx, ty are world tile coords (can be fractional from screenToTile — caller rounds)
  moveTo(tx: number, ty: number) {
    const target = { x: tx, y: ty };
    // Click on a resource: pathfind adjacent + queue gather
    const resource = this.world.resources.find(
      (r) => r.tx === target.x && r.ty === target.y && r.respawnAt === null,
    );
    const mob = this.world.mobs.find(
      (m) => m.tx === target.x && m.ty === target.y && m.state !== "dead",
    );
    if (resource || mob) {
      // find adjacent passable tile to stand on
      const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      let standX = this.world.player.tx;
      let standY = this.world.player.ty;
      let best = Infinity;
      for (const [dx, dy] of dirs) {
        const nx = target.x + dx;
        const ny = target.y + dy;
        if (!isPassable(this.world, nx, ny)) continue;
        const d = chebyshev(nx, ny, this.world.player.tx, this.world.player.ty);
        if (d < best) {
          best = d;
          standX = nx;
          standY = ny;
        }
      }
      const path = findPath(
        this.world,
        { x: this.world.player.tx, y: this.world.player.ty },
        { x: standX, y: standY },
      );
      this.world.player.path = path;
      this.pendingAction = { type: resource ? "gather" : "attack", targetId: (resource ?? mob)!.id };
      return;
    }
    // empty tile click: just walk
    if (!isPassable(this.world, target.x, target.y)) return;
    this.world.player.path = findPath(
      this.world,
      { x: this.world.player.tx, y: this.world.player.ty },
      target,
    );
    this.pendingAction = null;
  }

  private pendingAction: { type: "gather" | "attack"; targetId: number } | null = null;
  agentMode = false;
  private agentCooldown = 0;

  private maybeRunPendingAction(now: number) {
    if (!this.pendingAction) return;
    if (this.world.player.path.length > 0) return; // still walking
    const target =
      this.pendingAction.type === "gather"
        ? this.world.resources.find((r) => r.id === this.pendingAction!.targetId)
        : this.world.mobs.find((m) => m.id === this.pendingAction!.targetId);
    if (!target) {
      this.pendingAction = null;
      return;
    }
    const dist = chebyshev(target.tx, target.ty, this.world.player.tx, this.world.player.ty);
    if (dist > 1) {
      this.pendingAction = null;
      return;
    }
    if (this.pendingAction.type === "gather") {
      const r = target as ResourceEntity;
      if (r.respawnAt !== null) {
        this.pendingAction = null;
        return;
      }
      tryAttackResource(this.world, r, now);
      // keep pending until the resource is fully harvested
      if (r.respawnAt !== null) this.pendingAction = null;
    } else {
      const m = target as MobEntity;
      if (m.state === "dead") {
        this.pendingAction = null;
        return;
      }
      tryAttackMob(this.world, m, now);
      if ((m.state as MobEntity["state"]) === "dead") this.pendingAction = null;
    }
  }

  setPlayerSkin(emoji: string) {
    this.world.player.skin = emoji;
  }

  setEquipmentBonuses(bonuses: { combat: number; maxHp: number; gathering: number }) {
    this.world.player.equipBonuses = { ...bonuses };
    this.world.player.maxHp = this.world.player.baseMaxHp + bonuses.maxHp;
    this.world.player.hp = Math.min(this.world.player.hp, this.world.player.maxHp);
    this.emitHud();
  }

  toggleAgentMode() {
    this.agentMode = !this.agentMode;
    toast(this.world, this.agentMode ? "Agent AI enabled — auto-farming!" : "Agent AI disabled");
    this.emitHud();
  }

  private stepAgent(now: number) {
    // Don't interrupt an ongoing action
    if (this.world.player.busyUntil > now) return;
    if (this.world.player.path.length > 0) return;
    if (this.pendingAction) return;

    const px = this.world.player.tx;
    const py = this.world.player.ty;

    // Equip sword if mobs are nearby, otherwise prefer gathering
    const nearMob = this.world.mobs
      .filter((m) => m.state !== "dead")
      .map((m) => ({ m, d: chebyshev(m.tx, m.ty, px, py) }))
      .filter(({ d }) => d <= 8)
      .sort((a, b) => a.d - b.d)[0];

    if (nearMob && nearMob.d <= 6) {
      // equip sword
      const swordSlot = this.world.player.hotbar.indexOf("sword");
      if (swordSlot >= 0) this.world.player.selectedSlot = swordSlot;
      this.moveTo(nearMob.m.tx, nearMob.m.ty);
      return;
    }

    // Find nearest harvestable resource and equip correct tool
    const nearRes = this.world.resources
      .filter((r) => r.respawnAt === null)
      .map((r) => ({ r, d: chebyshev(r.tx, r.ty, px, py) }))
      .sort((a, b) => a.d - b.d)[0];

    if (nearRes) {
      const toolMap: Record<string, ItemKind> = {
        tree: "axe", rock: "pickaxe", coal: "pickaxe", pond: "rod",
      };
      const tool = toolMap[nearRes.r.kind];
      const slot = this.world.player.hotbar.indexOf(tool);
      if (slot >= 0) this.world.player.selectedSlot = slot;
      this.moveTo(nearRes.r.tx, nearRes.r.ty);
    }
  }

  start() {
    const tick = (t: number) => {
      const dt = Math.min(64, t - this.lastTime);
      this.lastTime = t;
      const now = Date.now();
      stepResources(this.world, now);
      stepMobs(this.world, now, dt);
      stepPlayer(this.world, now, dt);
      if (this.agentMode) this.stepAgent(now);
      this.maybeRunPendingAction(now);
      this.saveTimer += dt;
      if (this.saveTimer > SAVE_INTERVAL_MS) {
        saveWorld(this.world);
        this.saveTimer = 0;
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame((t) => {
      this.lastTime = t;
      tick(t);
    });
    this.hudInterval = window.setInterval(() => this.emitHud(), 250);
  }

  stop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.hudInterval !== null) clearInterval(this.hudInterval);
  }

  emitHud() {
    this.events.onState({
      hp: Math.round(this.world.player.hp),
      maxHp: this.world.player.maxHp,
      gold: this.world.player.gold,
      kills: this.world.player.kills,
      resources: this.world.player.resourcesGathered,
      inventory: [...this.world.player.inventory],
      hotbar: [...this.world.player.hotbar],
      selectedSlot: this.world.player.selectedSlot,
      realm: this.world.realm,
      online: this.fakeOnline,
      agentMode: this.agentMode,
      skills: { ...this.world.player.skills },
    });
  }
}
