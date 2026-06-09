import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import crypto from "node:crypto";

export function generateAgentKeypair() {
  const kp = Keypair.generate();
  return {
    publicKey: kp.publicKey.toBase58(),
    secretKeyBase58: bs58.encode(kp.secretKey),
  };
}

export function newAgentId() {
  return `ag_${crypto.randomBytes(8).toString("hex")}`;
}

export function newApiKey() {
  return `kna_${crypto.randomBytes(24).toString("base64url")}`;
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function avatarSeed() {
  return crypto.randomBytes(6).toString("hex");
}

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}`;
}
