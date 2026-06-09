"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SolanaProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type WindowWithWallets = Window & {
  solana?: SolanaProvider;
  solflare?: SolanaProvider;
  backpack?: { solana?: SolanaProvider };
};

type WalletState = {
  address: string | null;
  connecting: boolean;
  provider: "phantom" | "solflare" | "backpack" | null;
  connect: (provider: "phantom" | "solflare" | "backpack") => Promise<void>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletState>({
  address: null,
  connecting: false,
  provider: null,
  connect: async () => {},
  disconnect: async () => {},
});

function getProvider(name: "phantom" | "solflare" | "backpack"): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithWallets;
  if (name === "phantom") return w.solana?.isPhantom ? w.solana : null;
  if (name === "solflare") return w.solflare?.isSolflare ? w.solflare : null;
  if (name === "backpack") return w.backpack?.solana ?? null;
  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<"phantom" | "solflare" | "backpack" | null>(null);

  const connect = useCallback(async (name: "phantom" | "solflare" | "backpack") => {
    setConnecting(true);
    try {
      const p = getProvider(name);
      if (!p) {
        const installUrl =
          name === "phantom"
            ? "https://phantom.app/"
            : name === "solflare"
              ? "https://solflare.com/"
              : "https://backpack.app/";
        if (typeof window !== "undefined") window.open(installUrl, "_blank");
        throw new Error(`${name} wallet not detected`);
      }
      const res = await p.connect();
      setAddress(res.publicKey.toBase58());
      setProvider(name);
      if (typeof window !== "undefined") {
        localStorage.setItem("kainova:lastProvider", name);
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (provider) {
      const p = getProvider(provider);
      try {
        await p?.disconnect();
      } catch {
        // ignore
      }
    }
    setAddress(null);
    setProvider(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kainova:lastProvider");
    }
  }, [provider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const last = localStorage.getItem("kainova:lastProvider") as
      | "phantom"
      | "solflare"
      | "backpack"
      | null;
    if (!last) return;
    const p = getProvider(last);
    if (!p) return;
    p.connect({ onlyIfTrusted: true })
      .then((res) => {
        setAddress(res.publicKey.toBase58());
        setProvider(last);
      })
      .catch(() => {
        // user dismissed, ignore
      });
  }, []);

  const value = useMemo(
    () => ({ address, connecting, provider, connect, disconnect }),
    [address, connecting, provider, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  return useContext(WalletContext);
}
