"use client";

import Link from "next/link";
import { SITE, HOLD_REQUIREMENT_UI } from "@/lib/constants";
import { Stats } from "./Stats";
import { ContractAddress } from "./ContractAddress";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="chip mb-6">
            <span className="live-dot" />
            Hold {HOLD_REQUIREMENT_UI.toLocaleString()} {SITE.ticker} to enter
          </div>
          <h1 className="headline text-5xl md:text-7xl font-bold leading-[1.05] mb-5">
            Enter the realm of <br />
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
              KAINOVA
            </span>
          </h1>
          <p className="text-lg text-[var(--ink-1)] max-w-lg mb-8">
            An isometric play-to-earn world. Gather wood, mine stone, fish the
            mistwater, battle the wilds — and trade for {SITE.ticker}.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href="/play" className="btn btn-primary">
              Play Now →
            </Link>
            <Link href="/play?spectate=1" className="btn btn-ghost">
              Spectate
            </Link>
          </div>
          <div className="mb-6">
            <Stats />
          </div>
          <ContractAddress />
        </div>
        <div className="relative aspect-[4/3] panel overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(124,92,255,0.18) 0%, rgba(255,138,214,0.08) 50%, rgba(105,224,138,0.10) 100%)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center text-9xl select-none">
            <div className="grid grid-cols-3 gap-2 opacity-90 rotate-[-8deg]">
              <span>🌳</span>
              <span>🏰</span>
              <span>⛰️</span>
              <span>🐺</span>
              <span>👑</span>
              <span>🌊</span>
              <span>🪓</span>
              <span>⚔️</span>
              <span>🎣</span>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 chip">Verdant Glade · Server 1</div>
        </div>
      </div>
    </section>
  );
}
