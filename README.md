# KAINOVA

An isometric play-to-earn realm gated by holding **10,000 $KAINOVA** on Solana mainnet.

- Token: [`S6HtvuH2tSt7EmdVNPwZdHfEA9Aq8iAKLf3SYbzpump`](https://pump.fun/coin/S6HtvuH2tSt7EmdVNPwZdHfEA9Aq8iAKLf3SYbzpump)
- Admin wallet (bypasses gate): `5deMkBfmVmPTDG5a5qecjMBDqbFqUZz7dw7xFbThmMvR`
- Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + `@solana/web3.js` + `@solana/spl-token`
- Game: HTML5 Canvas isometric renderer, A\* pathfinding, single-player MVP

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

For a real on-chain balance check, supply your own Solana RPC in `.env.local`:

```bash
cp .env.local.example .env.local
# set NEXT_PUBLIC_SOLANA_RPC_URL=https://your-helius-or-quicknode-endpoint
```

## Deploy to Vercel

```bash
vercel link
vercel deploy --prod
```

In the Vercel project settings, set:

- `NEXT_PUBLIC_SOLANA_RPC_URL` — your RPC endpoint

## What's in the game

- 32×24 isometric tile world ("Verdant Glade")
- Resources: trees (axe → wood), rocks (pickaxe → stone), coal (pickaxe → coal), ponds (rod → fish)
- Wolf mobs with chase + attack AI
- Inventory + hotbar (1–6), click-to-move, A\* pathfinding
- Gold drops from mobs
- Save state in `localStorage`
- HP, regen, respawn at home base on death

## File map

- `app/` — Next.js App Router (`/`, `/play`, `/api/site/stats`, `/api/token/balance`)
- `components/` — landing page sections + WalletButton + TokenGate
- `components/game/` — `Game.tsx` (canvas mount) + `HUD.tsx`
- `lib/` — `constants.ts`, `solana.ts` (gate check), `wallet.tsx` (Phantom/Solflare/Backpack hook)
- `lib/game/` — engine, world gen, isometric math, A\* pathfinding, renderer
