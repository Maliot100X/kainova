"use client";

import { useEffect, useRef, useState } from "react";
import { Engine, HUDSnapshot } from "@/lib/game/engine";
import { screenToTile, TILE_H, TILE_W, tileToScreen } from "@/lib/game/iso";
import { render, type Camera } from "@/lib/game/render";
import { clearSave } from "@/lib/game/save";
import { useWallet } from "@/lib/wallet";
import { HUD } from "./HUD";

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HUDSnapshot | null>(null);
  const { address } = useWallet();

  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => {
      const w = engineRef.current?.world;
      if (!w) return;
      fetch("/api/player/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          gold: w.player.gold,
          kills: 0,
          resources: w.player.inventory.reduce((s, it) => s + it.count, 0),
          combat_skill: w.player.skills.combat,
          gather_skill: w.player.skills.gathering,
        }),
      }).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [address]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const camera: Camera = { cx: 0, cy: 0, zoom: 1 };
    let hoverTile: { x: number; y: number } | null = null;

    function resize() {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const engine = new Engine({
      onState: (snap) => setHud(snap),
      onLog: () => {},
    });
    engineRef.current = engine;
    engine.start();

    // center camera on player
    function centerOnPlayer() {
      if (!canvas || !engineRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const px = engineRef.current.world.player.px;
      const py = engineRef.current.world.player.py;
      const { sx, sy } = tileToScreen(px, py, 0, 0, camera.zoom);
      camera.cx = rect.width / 2 - sx;
      camera.cy = rect.height / 2 - sy;
    }
    centerOnPlayer();

    function getCanvasCoords(e: MouseEvent) {
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    const onMove = (e: MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      const { tx, ty } = screenToTile(x, y, camera.cx, camera.cy, camera.zoom);
      const ix = Math.round(tx);
      const iy = Math.round(ty);
      if (
        engineRef.current &&
        ix >= 0 &&
        iy >= 0 &&
        ix < engineRef.current.world.width &&
        iy < engineRef.current.world.height
      ) {
        hoverTile = { x: ix, y: iy };
      } else {
        hoverTile = null;
      }
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      const { tx, ty } = screenToTile(x, y, camera.cx, camera.cy, camera.zoom);
      const ix = Math.round(tx);
      const iy = Math.round(ty);
      engineRef.current?.moveTo(ix, iy);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const prevZoom = camera.zoom;
      camera.zoom = Math.max(0.6, Math.min(1.6, camera.zoom - e.deltaY * 0.001));
      // re-center
      if (engineRef.current) {
        const rect = canvas!.getBoundingClientRect();
        const px = engineRef.current.world.player.px;
        const py = engineRef.current.world.player.py;
        const { sx, sy } = tileToScreen(px, py, 0, 0, camera.zoom);
        camera.cx = rect.width / 2 - sx;
        camera.cy = rect.height / 2 - sy;
      }
      void prevZoom;
    };

    const onKey = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const k = e.key;
      if (k >= "1" && k <= "6") {
        engineRef.current.selectSlot(parseInt(k, 10) - 1);
      }
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    let raf = 0;
    function loop() {
      if (engineRef.current) {
        centerOnPlayer();
        render(
          ctx!,
          engineRef.current.world,
          camera,
          hoverTile,
          canvas!.clientWidth,
          canvas!.clientHeight,
        );
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      engine.stop();
    };
  }, []);

  return (
    <div className="relative flex flex-col h-[calc(100vh-60px)]">
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
        {hud && (
          <HUD
            snap={hud}
            onSelectSlot={(i) => engineRef.current?.selectSlot(i)}
            onReset={() => {
              clearSave();
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}
