import type { MobEntity, PlayerState, ResourceEntity, TileKind, WorldState } from "./types";

let nextId = 1;
const newId = () => nextId++;

function fillTiles(w: number, h: number): TileKind[] {
  const tiles: TileKind[] = new Array(w * h).fill("grass");

  // stone mountain region in top-right quadrant
  for (let y = 0; y < 14; y++) {
    for (let x = 20; x < w; x++) {
      if (Math.random() < 0.55) tiles[y * w + x] = "stone";
    }
  }
  // dense forest patch top-left
  for (let y = 2; y < 10; y++) {
    for (let x = 2; x < 14; x++) {
      if (Math.random() < 0.3) tiles[y * w + x] = "sand";
    }
  }
  // sand desert bottom-right
  for (let y = 18; y < h; y++) {
    for (let x = 20; x < w; x++) {
      if (Math.random() < 0.7) tiles[y * w + x] = "sand";
    }
  }
  // scattered sand patches
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    const r = 1 + Math.floor(Math.random() * 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (Math.random() < 0.45) tiles[ny * w + nx] = "sand";
      }
    }
  }

  // ponds (water)
  const ponds = [
    { cx: 8,  cy: 8,  r: 2 },
    { cx: 22, cy: 18, r: 2 },
    { cx: 4,  cy: 20, r: 1 },
    { cx: 28, cy: 5,  r: 2 },
  ];
  for (const p of ponds) {
    for (let dy = -p.r; dy <= p.r; dy++) {
      for (let dx = -p.r; dx <= p.r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > p.r) continue;
        const nx = p.cx + dx;
        const ny = p.cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        tiles[ny * w + nx] = "water";
      }
    }
  }

  // main horizontal path through spawn
  for (let x = 0; x < w; x++) {
    if (tiles[15 * w + x] !== "water") tiles[15 * w + x] = "path";
  }
  // vertical path from spawn south
  for (let y = 15; y < h; y++) {
    if (tiles[y * w + 14] !== "water") tiles[y * w + 14] = "path";
  }
  // north path
  for (let y = 0; y < 15; y++) {
    if (tiles[y * w + 14] !== "water") tiles[y * w + 14] = "path";
  }

  return tiles;
}

function defaultPlayer(): PlayerState {
  return {
    tx: 14, ty: 15, px: 14, py: 15,
    facing: "s",
    hp: 100, maxHp: 100,
    gold: 0, kills: 0, resourcesGathered: 0,
    inventory: [
      { kind: "axe",     count: 1 },
      { kind: "pickaxe", count: 1 },
      { kind: "rod",     count: 1 },
      { kind: "sword",   count: 1 },
    ],
    hotbar: ["axe", "pickaxe", "rod", "sword", null, null],
    selectedSlot: 0,
    skills: { gathering: 1, combat: 1, fishing: 1 },
    path: [],
    walkProgress: 0,
    busyUntil: 0,
    busyKind: null,
  };
}

export function generateWorld(): WorldState {
  const W = 40;
  const H = 30;
  const tiles = fillTiles(W, H);

  const resources: ResourceEntity[] = [];
  const mobs: MobEntity[] = [];

  function tryPlace(kind: ResourceEntity["kind"]): ResourceEntity | null {
    for (let attempt = 0; attempt < 60; attempt++) {
      const tx = Math.floor(Math.random() * W);
      const ty = Math.floor(Math.random() * H);
      const tile = tiles[ty * W + tx];
      if (kind === "pond" && tile !== "water") continue;
      if (kind !== "pond" && (tile === "water" || tile === "path")) continue;
      if (resources.some((r) => r.tx === tx && r.ty === ty)) continue;
      if (mobs.some((m) => m.tx === tx && m.ty === ty)) continue;
      if (Math.abs(tx - 14) < 3 && Math.abs(ty - 15) < 3) continue;
      const hp = kind === "tree" ? 3 : kind === "rock" ? 4 : kind === "coal" ? 6 : 1;
      return { id: newId(), type: "resource", kind, tx, ty, hp, maxHp: hp, respawnAt: null };
    }
    return null;
  }

  for (let i = 0; i < 60; i++) { const r = tryPlace("tree");  if (r) resources.push(r); }
  for (let i = 0; i < 40; i++) { const r = tryPlace("rock");  if (r) resources.push(r); }
  for (let i = 0; i < 20; i++) { const r = tryPlace("coal");  if (r) resources.push(r); }
  for (let i = 0; i < 10; i++) { const r = tryPlace("pond");  if (r) resources.push(r); }

  // Tiered mob spawns — placed away from spawn in rough zones
  const mobSpec: Array<{
    kind: MobEntity["kind"]; count: number; hp: number; dmg: number;
    minDist?: number; zone?: "any" | "stone" | "sand" | "desert";
  }> = [
    // Tier 1 — near spawn, easy
    { kind: "goblin",      count: 10, hp: 20,  dmg: 6,  minDist: 3 },
    { kind: "wolf",        count: 10, hp: 30,  dmg: 8,  minDist: 3 },
    { kind: "boar",        count: 8,  hp: 50,  dmg: 10, minDist: 4 },
    // Tier 2 — mid-map
    { kind: "zombie",      count: 8,  hp: 55,  dmg: 12, minDist: 6 },
    { kind: "skeleton",    count: 7,  hp: 60,  dmg: 14, minDist: 6 },
    { kind: "archer",      count: 6,  hp: 45,  dmg: 16, minDist: 5 },
    // Tier 3 — dangerous
    { kind: "bandit",      count: 6,  hp: 90,  dmg: 20, minDist: 8 },
    { kind: "troll",       count: 5,  hp: 130, dmg: 25, minDist: 8 },
    { kind: "orc",         count: 5,  hp: 150, dmg: 28, minDist: 10 },
    // Tier 4 — boss-tier
    { kind: "necromancer", count: 3,  hp: 200, dmg: 35, minDist: 12 },
    { kind: "demon",       count: 2,  hp: 280, dmg: 45, minDist: 14 },
    { kind: "dragon",      count: 1,  hp: 500, dmg: 60, minDist: 16 },
  ];

  for (const spec of mobSpec) {
    const minDist = spec.minDist ?? 4;
    for (let i = 0; i < spec.count; i++) {
      let tx = 0, ty = 0, ok = false;
      for (let attempt = 0; attempt < 80; attempt++) {
        tx = Math.floor(Math.random() * W);
        ty = Math.floor(Math.random() * H);
        const tile = tiles[ty * W + tx];
        if (tile === "water" || tile === "path") continue;
        if (Math.abs(tx - 14) < minDist && Math.abs(ty - 15) < minDist) continue;
        if (resources.some((r) => r.tx === tx && r.ty === ty)) continue;
        if (mobs.some((m) => m.tx === tx && m.ty === ty)) continue;
        ok = true; break;
      }
      if (!ok) continue;
      mobs.push({
        id: newId(), type: "mob", kind: spec.kind,
        tx, ty, hp: spec.hp, maxHp: spec.hp,
        damage: spec.dmg,
        lastHitAt: 0,
        patrolHomeX: tx, patrolHomeY: ty,
        state: "patrol",
        respawnAt: null,
        moveCooldownUntil: 0,
      });
    }
  }

  return {
    width: W, height: H, tiles, resources, mobs,
    player: defaultPlayer(),
    realm: "Verdant Glade",
    toast: null,
  };
}
