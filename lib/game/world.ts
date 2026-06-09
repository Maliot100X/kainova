import type { MobEntity, PlayerState, ResourceEntity, TileKind, WorldState } from "./types";

let nextId = 1;
const newId = () => nextId++;

function fillTiles(w: number, h: number): TileKind[] {
  const tiles: TileKind[] = new Array(w * h).fill("grass");
  // some sand patches
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    const r = 1 + Math.floor(Math.random() * 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (Math.random() < 0.5) tiles[ny * w + nx] = "sand";
      }
    }
  }
  // a couple of small ponds (water tiles)
  const ponds = [
    { cx: 8, cy: 8, r: 2 },
    { cx: 22, cy: 18, r: 2 },
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
  // a path that goes through the spawn area
  for (let x = 0; x < w; x++) {
    const cy = 15;
    if (tiles[cy * w + x] !== "water") tiles[cy * w + x] = "path";
  }
  return tiles;
}

function defaultPlayer(): PlayerState {
  return {
    tx: 14,
    ty: 15,
    px: 14,
    py: 15,
    facing: "s",
    hp: 100,
    maxHp: 100,
    gold: 0,
    inventory: [
      { kind: "axe", count: 1 },
      { kind: "pickaxe", count: 1 },
      { kind: "rod", count: 1 },
      { kind: "sword", count: 1 },
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
  const W = 32;
  const H = 24;
  const tiles = fillTiles(W, H);

  const resources: ResourceEntity[] = [];
  const mobs: MobEntity[] = [];

  // Helper to place an entity on a non-water, non-path tile
  function tryPlace(kind: ResourceEntity["kind"]): ResourceEntity | null {
    for (let attempt = 0; attempt < 40; attempt++) {
      const tx = Math.floor(Math.random() * W);
      const ty = Math.floor(Math.random() * H);
      const tile = tiles[ty * W + tx];
      // ponds need water
      if (kind === "pond" && tile !== "water") continue;
      // resources need solid ground
      if (kind !== "pond" && (tile === "water" || tile === "path")) continue;
      // don't stack on existing entity
      if (resources.some((r) => r.tx === tx && r.ty === ty)) continue;
      if (mobs.some((m) => m.tx === tx && m.ty === ty)) continue;
      // don't spawn on player spawn
      if (Math.abs(tx - 14) < 2 && Math.abs(ty - 15) < 2) continue;
      const hp =
        kind === "tree" ? 3 : kind === "rock" ? 4 : kind === "coal" ? 5 : 1;
      return {
        id: newId(),
        type: "resource",
        kind,
        tx,
        ty,
        hp,
        maxHp: hp,
        respawnAt: null,
      };
    }
    return null;
  }

  for (let i = 0; i < 22; i++) {
    const r = tryPlace("tree");
    if (r) resources.push(r);
  }
  for (let i = 0; i < 14; i++) {
    const r = tryPlace("rock");
    if (r) resources.push(r);
  }
  for (let i = 0; i < 6; i++) {
    const r = tryPlace("coal");
    if (r) resources.push(r);
  }
  for (let i = 0; i < 4; i++) {
    const r = tryPlace("pond");
    if (r) resources.push(r);
  }

  // mobs
  for (let i = 0; i < 5; i++) {
    let tx = 0, ty = 0, ok = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      tx = Math.floor(Math.random() * W);
      ty = Math.floor(Math.random() * H);
      const tile = tiles[ty * W + tx];
      if (tile === "water" || tile === "path") continue;
      if (Math.abs(tx - 14) < 4 && Math.abs(ty - 15) < 4) continue;
      if (resources.some((r) => r.tx === tx && r.ty === ty)) continue;
      ok = true;
      break;
    }
    if (!ok) continue;
    mobs.push({
      id: newId(),
      type: "mob",
      kind: "wolf",
      tx,
      ty,
      hp: 30,
      maxHp: 30,
      damage: 8,
      lastHitAt: 0,
      patrolHomeX: tx,
      patrolHomeY: ty,
      state: "patrol",
      respawnAt: null,
      moveCooldownUntil: 0,
    });
  }

  return {
    width: W,
    height: H,
    tiles,
    resources,
    mobs,
    player: defaultPlayer(),
    realm: "Verdant Glade",
    toast: null,
  };
}
