// KAINOVA project constants
// pump.fun tokens use 6 decimals by default

export const KAINOVA_MINT = "S6HtvuH2tSt7EmdVNPwZdHfEA9Aq8iAKLf3SYbzpump";
export const ADMIN_WALLET = "5deMkBfmVmPTDG5a5qecjMBDqbFqUZz7dw7xFbThmMvR";

export const TOKEN_DECIMALS = 6;
export const HOLD_REQUIREMENT_UI = 10_000;
export const HOLD_REQUIREMENT_RAW =
  BigInt(HOLD_REQUIREMENT_UI) * BigInt(10) ** BigInt(TOKEN_DECIMALS);

export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

export const SITE = {
  name: "KAINOVA",
  tagline:
    "An isometric realm where holders gather, fight, and trade for $KAINOVA.",
  ticker: "$KAINOVA",
  ca: KAINOVA_MINT,
  twitter: "",
  telegram: "",
  pumpUrl: `https://pump.fun/coin/${KAINOVA_MINT}`,
};
