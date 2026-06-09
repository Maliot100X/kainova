import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from "@solana/spl-token";
import {
  ADMIN_WALLET,
  HOLD_REQUIREMENT_RAW,
  HOLD_REQUIREMENT_UI,
  KAINOVA_MINT,
  RPC_URL,
  TOKEN_DECIMALS,
} from "./constants";

let conn: Connection | null = null;
export function getConnection() {
  if (!conn) conn = new Connection(RPC_URL, "confirmed");
  return conn;
}

export type GateResult = {
  allowed: boolean;
  reason: "admin" | "sufficient" | "insufficient" | "no_account" | "invalid_wallet" | "rpc_error";
  balanceUi: number;
  balanceRaw: string;
  threshold: number;
};

export function isAdmin(walletString: string): boolean {
  return walletString === ADMIN_WALLET;
}

export async function checkGate(walletString: string): Promise<GateResult> {
  if (isAdmin(walletString)) {
    return {
      allowed: true,
      reason: "admin",
      balanceUi: 0,
      balanceRaw: "0",
      threshold: HOLD_REQUIREMENT_UI,
    };
  }

  let walletPk: PublicKey;
  try {
    walletPk = new PublicKey(walletString);
  } catch {
    return {
      allowed: false,
      reason: "invalid_wallet",
      balanceUi: 0,
      balanceRaw: "0",
      threshold: HOLD_REQUIREMENT_UI,
    };
  }

  const mintPk = new PublicKey(KAINOVA_MINT);

  try {
    const ata = await getAssociatedTokenAddress(mintPk, walletPk);
    const account = await getAccount(getConnection(), ata);
    const balanceRaw = account.amount;
    const balanceUi = Number(balanceRaw) / 10 ** TOKEN_DECIMALS;
    const meets = balanceRaw >= HOLD_REQUIREMENT_RAW;
    return {
      allowed: meets,
      reason: meets ? "sufficient" : "insufficient",
      balanceUi,
      balanceRaw: balanceRaw.toString(),
      threshold: HOLD_REQUIREMENT_UI,
    };
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || e instanceof TokenInvalidAccountOwnerError) {
      return {
        allowed: false,
        reason: "no_account",
        balanceUi: 0,
        balanceRaw: "0",
        threshold: HOLD_REQUIREMENT_UI,
      };
    }
    return {
      allowed: false,
      reason: "rpc_error",
      balanceUi: 0,
      balanceRaw: "0",
      threshold: HOLD_REQUIREMENT_UI,
    };
  }
}
