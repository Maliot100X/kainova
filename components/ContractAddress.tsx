"use client";

import { useState } from "react";
import { SITE } from "@/lib/constants";

export function ContractAddress() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 panel px-3 py-2 text-xs font-mono">
      <span className="text-[var(--ink-2)]">CA:</span>
      <span className="break-all">{SITE.ca}</span>
      <button
        className="ml-1 chip cursor-pointer hover:text-white"
        onClick={async () => {
          await navigator.clipboard.writeText(SITE.ca);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={SITE.pumpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chip hover:text-white"
      >
        pump.fun ↗
      </a>
    </div>
  );
}
