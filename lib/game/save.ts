import type { WorldState } from "./types";

const KEY = "kainova:save:v2";

export function saveWorld(world: WorldState) {
  if (typeof window === "undefined") return;
  try {
    const snapshot = {
      tx: world.player.tx,
      ty: world.player.ty,
      hp: world.player.hp,
      gold: world.player.gold,
      kills: world.player.kills,
      resourcesGathered: world.player.resourcesGathered,
      inventory: world.player.inventory,
      hotbar: world.player.hotbar,
      skills: world.player.skills,
    };
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota / parse errors
  }
}

export type SavedSnapshot = {
  tx: number;
  ty: number;
  hp: number;
  gold: number;
  kills?: number;
  resourcesGathered?: number;
  inventory: WorldState["player"]["inventory"];
  hotbar: WorldState["player"]["hotbar"];
  skills: WorldState["player"]["skills"];
};

export function loadSnapshot(): SavedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSnapshot;
  } catch {
    return null;
  }
}

export function clearSave() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function applySnapshot(world: WorldState, snap: SavedSnapshot) {
  world.player.tx = snap.tx;
  world.player.ty = snap.ty;
  world.player.px = snap.tx;
  world.player.py = snap.ty;
  world.player.hp = snap.hp;
  world.player.gold = snap.gold;
  world.player.kills = snap.kills ?? 0;
  world.player.resourcesGathered = snap.resourcesGathered ?? 0;
  world.player.inventory = snap.inventory;
  world.player.hotbar = snap.hotbar;
  world.player.skills = snap.skills;
}
