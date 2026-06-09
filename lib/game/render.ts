import { TILE_H, TILE_W, tileToScreen } from "./iso";
import type { MobEntity, ResourceEntity, TileKind, WorldState } from "./types";

const TILE_COLORS: Record<TileKind, string> = {
  grass: "#1f5a3a",
  stone: "#3a3a4a",
  water: "#1a3a5a",
  path: "#5a4a3a",
  sand: "#a08a5a",
  wood: "#6a4a2a",
};

const TILE_EDGE: Record<TileKind, string> = {
  grass: "#14422a",
  stone: "#22222e",
  water: "#0e2640",
  path: "#3a2e22",
  sand: "#7a6840",
  wood: "#4a3018",
};

const SPRITE_EMOJI: Record<string, string> = {
  tree: "🌳",
  rock: "🪨",
  coal: "⬛",
  pond: "💧",
  wolf: "🐺",
  boar: "🐗",
  goblin: "👺",
  zombie: "🧟",
  skeleton: "💀",
  bandit: "🥷",
  archer: "🏹",
  troll: "👾",
  orc: "👹",
  necromancer: "🧙‍♂️",
  demon: "😈",
  dragon: "🐉",
  player: "🧙",
};

export type Camera = {
  cx: number;
  cy: number;
  zoom: number;
};

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  fill: string,
  edge: string,
  zoom: number,
) {
  const w = (TILE_W * zoom) / 2;
  const h = (TILE_H * zoom) / 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - h);
  ctx.lineTo(sx + w, sy);
  ctx.lineTo(sx, sy + h);
  ctx.lineTo(sx - w, sy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  emoji: string,
  size: number,
) {
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 2, size * 0.32, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // sprite (lifted up so feet sit on the tile center)
  ctx.fillText(emoji, sx, sy);
}

function drawHpBar(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  cur: number,
  max: number,
  width = 30,
) {
  const ratio = Math.max(0, Math.min(1, cur / max));
  const h = 4;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(sx - width / 2, sy, width, h);
  ctx.fillStyle = ratio > 0.5 ? "#69e08a" : ratio > 0.25 ? "#ffce4f" : "#ff6b6b";
  ctx.fillRect(sx - width / 2, sy, width * ratio, h);
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(sx - width / 2, sy, width, h);
}

type AgentHome = { name: string; skin: string; tx: number; ty: number; score: number };

export function render(
  ctx: CanvasRenderingContext2D,
  world: WorldState,
  camera: Camera,
  hoverTile: { x: number; y: number } | null,
  canvasW: number,
  canvasH: number,
  agentHomes: AgentHome[] = [],
) {
  ctx.clearRect(0, 0, canvasW, canvasH);
  // dark gradient backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, "#070718");
  grad.addColorStop(1, "#15152e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Tile pass — draw all floor tiles first (sorted by y to keep order)
  for (let ty = 0; ty < world.height; ty++) {
    for (let tx = 0; tx < world.width; tx++) {
      const kind = world.tiles[ty * world.width + tx];
      const { sx, sy } = tileToScreen(tx, ty, camera.cx, camera.cy, camera.zoom);
      drawDiamond(ctx, sx, sy, TILE_COLORS[kind], TILE_EDGE[kind], camera.zoom);
    }
  }

  // Agent home bases (rendered as floor markings)
  for (const ah of agentHomes) {
    const { sx, sy } = tileToScreen(ah.tx, ah.ty, camera.cx, camera.cy, camera.zoom);
    drawDiamond(ctx, sx, sy, "rgba(255,206,79,0.12)", "rgba(255,206,79,0.6)", camera.zoom);
  }

  // Hover highlight
  if (hoverTile) {
    const { sx, sy } = tileToScreen(hoverTile.x, hoverTile.y, camera.cx, camera.cy, camera.zoom);
    drawDiamond(ctx, sx, sy, "rgba(124,92,255,0.25)", "rgba(124,92,255,0.85)", camera.zoom);
  }

  // Build a sorted entity list by tile y then x for proper z-order
  type Drawable =
    | { kind: "resource"; e: ResourceEntity; sortY: number }
    | { kind: "mob"; e: MobEntity; sortY: number }
    | { kind: "player"; px: number; py: number; sortY: number };

  const drawables: Drawable[] = [];
  for (const r of world.resources) {
    if (r.respawnAt !== null) continue;
    drawables.push({ kind: "resource", e: r, sortY: r.ty + r.tx * 0.001 });
  }
  for (const m of world.mobs) {
    if (m.state === "dead") continue;
    drawables.push({ kind: "mob", e: m, sortY: m.ty + m.tx * 0.001 });
  }
  drawables.push({
    kind: "player",
    px: world.player.px,
    py: world.player.py,
    sortY: world.player.py + world.player.px * 0.001,
  });

  drawables.sort((a, b) => a.sortY - b.sortY);

  for (const d of drawables) {
    if (d.kind === "resource") {
      const { sx, sy } = tileToScreen(d.e.tx, d.e.ty, camera.cx, camera.cy, camera.zoom);
      const emoji = SPRITE_EMOJI[d.e.kind];
      drawSprite(ctx, sx, sy + 4, emoji, 36 * camera.zoom);
      if (d.e.hp < d.e.maxHp) {
        drawHpBar(ctx, sx, sy - 28 * camera.zoom, d.e.hp, d.e.maxHp);
      }
    } else if (d.kind === "mob") {
      const { sx, sy } = tileToScreen(d.e.tx, d.e.ty, camera.cx, camera.cy, camera.zoom);
      const emoji = SPRITE_EMOJI[d.e.kind];
      drawSprite(ctx, sx, sy + 4, emoji, 36 * camera.zoom);
      drawHpBar(ctx, sx, sy - 28 * camera.zoom, d.e.hp, d.e.maxHp);
    } else {
      const { sx, sy } = tileToScreen(d.px, d.py, camera.cx, camera.cy, camera.zoom);
      drawSprite(ctx, sx, sy + 4, world.player.skin || SPRITE_EMOJI.player, 40 * camera.zoom);
    }
  }

  // Agent home name labels
  ctx.font = `${Math.round(11 * camera.zoom)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (const ah of agentHomes) {
    const { sx, sy } = tileToScreen(ah.tx, ah.ty, camera.cx, camera.cy, camera.zoom);
    // House emoji
    ctx.font = `${Math.round(22 * camera.zoom)}px serif`;
    ctx.fillText("🏠", sx, sy - 2 * camera.zoom);
    // Agent name
    ctx.font = `bold ${Math.round(10 * camera.zoom)}px sans-serif`;
    ctx.fillStyle = "rgba(255,206,79,0.95)";
    ctx.fillText(ah.name.length > 12 ? ah.name.slice(0, 11) + "…" : ah.name, sx, sy - 22 * camera.zoom);
  }

  // Realm label, top center
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "16px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(world.realm, canvasW / 2, 12);

  // Toast
  if (world.toast && Date.now() < world.toast.until) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    const text = world.toast.msg;
    ctx.font = "14px sans-serif";
    const w = ctx.measureText(text).width + 24;
    ctx.fillRect(canvasW / 2 - w / 2, 36, w, 28);
    ctx.fillStyle = "white";
    ctx.fillText(text, canvasW / 2, 42);
  } else if (world.toast) {
    world.toast = null;
  }
}
