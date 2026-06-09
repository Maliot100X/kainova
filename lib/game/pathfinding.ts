import type { TilePos, WorldState } from "./types";

// Tiles that block movement
const BLOCKING: Record<string, boolean> = {
  water: true,
};

function passable(world: WorldState, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) return false;
  const idx = ty * world.width + tx;
  const kind = world.tiles[idx];
  if (BLOCKING[kind]) return false;
  // resources block standing on the same tile
  for (const r of world.resources) {
    if (r.tx === tx && r.ty === ty && r.respawnAt === null) return false;
  }
  return true;
}

type Node = { x: number; y: number; g: number; f: number; parent: Node | null };

export function findPath(
  world: WorldState,
  start: TilePos,
  end: TilePos,
): TilePos[] {
  if (start.x === end.x && start.y === end.y) return [];
  const open: Node[] = [];
  const closed = new Set<string>();
  const h = (x: number, y: number) => Math.abs(x - end.x) + Math.abs(y - end.y);

  const startNode: Node = { x: start.x, y: start.y, g: 0, f: h(start.x, start.y), parent: null };
  open.push(startNode);

  const maxIter = 2000;
  let iter = 0;
  while (open.length > 0 && iter++ < maxIter) {
    // pop lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];
    const key = `${current.x},${current.y}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (current.x === end.x && current.y === end.y) {
      const path: TilePos[] = [];
      let n: Node | null = current;
      while (n) {
        path.unshift({ x: n.x, y: n.y });
        n = n.parent;
      }
      // remove start
      path.shift();
      return path;
    }

    // 4-directional neighbors (no diagonals to keep movement crisp)
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];
    for (const nb of neighbors) {
      const nk = `${nb.x},${nb.y}`;
      if (closed.has(nk)) continue;
      if (!passable(world, nb.x, nb.y)) {
        // allow stepping onto end even if a resource is there (so you can attack/gather)
        if (!(nb.x === end.x && nb.y === end.y)) continue;
      }
      const g = current.g + 1;
      const f = g + h(nb.x, nb.y);
      open.push({ x: nb.x, y: nb.y, g, f, parent: current });
    }
  }
  return [];
}

export function isPassable(world: WorldState, x: number, y: number) {
  return passable(world, x, y);
}
