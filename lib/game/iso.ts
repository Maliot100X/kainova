// Isometric projection math
// 2:1 tiles (TILE_W = 2 * TILE_H is the diamond ratio)

export const TILE_W = 64;
export const TILE_H = 32;

export function tileToScreen(
  tx: number,
  ty: number,
  cameraX: number,
  cameraY: number,
  zoom = 1,
) {
  const sx = ((tx - ty) * (TILE_W / 2)) * zoom + cameraX;
  const sy = ((tx + ty) * (TILE_H / 2)) * zoom + cameraY;
  return { sx, sy };
}

export function screenToTile(
  sx: number,
  sy: number,
  cameraX: number,
  cameraY: number,
  zoom = 1,
) {
  const x = (sx - cameraX) / zoom;
  const y = (sy - cameraY) / zoom;
  const tx = (x / (TILE_W / 2) + y / (TILE_H / 2)) / 2;
  const ty = (y / (TILE_H / 2) - x / (TILE_W / 2)) / 2;
  return { tx, ty };
}

export function manhattan(ax: number, ay: number, bx: number, by: number) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function chebyshev(ax: number, ay: number, bx: number, by: number) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
