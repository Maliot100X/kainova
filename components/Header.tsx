"use client";

import Link from "next/link";
import { SITE } from "@/lib/constants";
import { WalletButton } from "./WalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgba(6,6,17,0.7)] border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl headline font-bold tracking-tight">
            {SITE.name}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--ink-2)] border border-[var(--line)] rounded-full px-2 py-[2px]">
            Beta
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[var(--ink-1)]">
          <a href="/#how-to-play" className="hover:text-white">
            How to Play
          </a>
          <a href="/#docs" className="hover:text-white">
            Docs
          </a>
          <a href="/#token" className="hover:text-white">
            Token
          </a>
          <Link href="/play" className="hover:text-white">
            Play
          </Link>
          <Link href="/leaderboard" className="hover:text-white">
            Leaderboard
          </Link>
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/agents" className="hover:text-white">
            Agents
          </Link>
        </nav>
        <div className="flex-1" />
        <WalletButton />
      </div>
    </header>
  );
}
