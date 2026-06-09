import { neon } from "@neondatabase/serverless";

let initPromise: Promise<void> | null = null;

async function runInit(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const db = neon(url);
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      wallet        TEXT UNIQUE NOT NULL,
      display_name  TEXT,
      tier          TEXT NOT NULL DEFAULT 'free',
      paid_demo_at  TIMESTAMPTZ,
      paid_life_at  TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS agents (
      id              SERIAL PRIMARY KEY,
      owner_wallet    TEXT NOT NULL,
      agent_id        TEXT UNIQUE NOT NULL,
      api_key_hash    TEXT NOT NULL,
      agent_wallet    TEXT UNIQUE NOT NULL,
      agent_name      TEXT NOT NULL,
      avatar_seed     TEXT NOT NULL,
      registered_via  TEXT NOT NULL DEFAULT 'web',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at    TIMESTAMPTZ
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS scores (
      id            SERIAL PRIMARY KEY,
      actor_kind    TEXT NOT NULL,
      actor_wallet  TEXT UNIQUE NOT NULL,
      display_name  TEXT NOT NULL,
      gold          BIGINT NOT NULL DEFAULT 0,
      kills         INT    NOT NULL DEFAULT 0,
      resources     INT    NOT NULL DEFAULT 0,
      combat_skill  INT    NOT NULL DEFAULT 0,
      gather_skill  INT    NOT NULL DEFAULT 0,
      score_total   BIGINT NOT NULL DEFAULT 0,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS scores_total_idx ON scores (score_total DESC)`;
  await db`
    CREATE TABLE IF NOT EXISTS payments (
      id            SERIAL PRIMARY KEY,
      wallet        TEXT NOT NULL,
      tx_signature  TEXT UNIQUE NOT NULL,
      amount_sol    NUMERIC(18,9) NOT NULL,
      tier          TEXT NOT NULL,
      verified_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS airdrops (
      id            SERIAL PRIMARY KEY,
      wallet        TEXT NOT NULL,
      amount_ui     NUMERIC(20,6) NOT NULL,
      rank          INT NOT NULL,
      reason        TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS airdrops_wallet_idx ON airdrops (wallet)`;
  // credits (in-game currency earned from playing / gifted to owner)
  await db`
    CREATE TABLE IF NOT EXISTS credits (
      id         SERIAL PRIMARY KEY,
      wallet     TEXT UNIQUE NOT NULL,
      amount     BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // shop catalog (seeded from code, admin-managed)
  await db`
    CREATE TABLE IF NOT EXISTS shop_items (
      id          SERIAL PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      rarity      TEXT NOT NULL,
      price       INT  NOT NULL,
      stat_key    TEXT,
      stat_bonus  INT  NOT NULL DEFAULT 0,
      emoji       TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `;
  // items owned by players/agents
  await db`
    CREATE TABLE IF NOT EXISTS player_items (
      id         SERIAL PRIMARY KEY,
      wallet     TEXT NOT NULL,
      item_slug  TEXT NOT NULL,
      equipped   BOOLEAN NOT NULL DEFAULT FALSE,
      bought_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(wallet, item_slug)
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS player_items_wallet_idx ON player_items (wallet)`;
  // agent customization extras
  await db`
    ALTER TABLE agents ADD COLUMN IF NOT EXISTS skin_emoji TEXT NOT NULL DEFAULT '🧙'
  `;
  await db`
    ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_title TEXT NOT NULL DEFAULT 'Adventurer'
  `;
  // Seed shop catalog
  const catalog = [
    // Weapons
    { slug:"sword_steel",   name:"Steel Sword",    cat:"weapon", rarity:"uncommon",  price:500,   stat:"combat",   bonus:8,  emoji:"⚔️",  desc:"A well-forged blade. +8 combat." },
    { slug:"sword_fire",    name:"Fire Blade",     cat:"weapon", rarity:"rare",      price:2500,  stat:"combat",   bonus:20, emoji:"🔥",  desc:"Burns with fury. +20 combat." },
    { slug:"sword_void",    name:"Void Reaper",    cat:"weapon", rarity:"epic",      price:9000,  stat:"combat",   bonus:45, emoji:"🌑",  desc:"Tear reality apart. +45 combat." },
    { slug:"sword_dragon",  name:"Dragon Fang",    cat:"weapon", rarity:"legendary", price:30000, stat:"combat",   bonus:90, emoji:"🐉",  desc:"Forged from a fallen dragon. +90 combat." },
    // Armor
    { slug:"armor_iron",    name:"Iron Mail",      cat:"armor",  rarity:"uncommon",  price:600,   stat:"maxHp",    bonus:15, emoji:"🛡️",  desc:"Solid iron rings. +15 max HP." },
    { slug:"armor_steel",   name:"Steel Plate",    cat:"armor",  rarity:"rare",      price:3000,  stat:"maxHp",    bonus:35, emoji:"🪖",  desc:"Full plate armor. +35 max HP." },
    { slug:"armor_mythril", name:"Mythril Armor",  cat:"armor",  rarity:"epic",      price:11000, stat:"maxHp",    bonus:70, emoji:"💎",  desc:"Mythril weave. +70 max HP." },
    { slug:"armor_dragon",  name:"Dragon Scale",   cat:"armor",  rarity:"legendary", price:35000, stat:"maxHp",    bonus:150,emoji:"🐲",  desc:"Dragon hide. +150 max HP." },
    // Tools
    { slug:"axe_silver",    name:"Silver Axe",     cat:"tool",   rarity:"uncommon",  price:700,   stat:"gathering",bonus:10, emoji:"🪓",  desc:"Sharp silver edge. +10 gathering." },
    { slug:"pick_gold",     name:"Gold Pickaxe",   cat:"tool",   rarity:"rare",      price:2800,  stat:"gathering",bonus:22, emoji:"⛏️",  desc:"Strikes gold veins. +22 gathering." },
    { slug:"tools_runic",   name:"Runic Tools",    cat:"tool",   rarity:"epic",      price:8500,  stat:"gathering",bonus:50, emoji:"✨",  desc:"Runes amplify harvest. +50 gathering." },
    // Skins / cosmetics
    { slug:"skin_crown",    name:"Royal Crown",    cat:"skin",   rarity:"rare",      price:4000,  stat:null,       bonus:0,  emoji:"👑",  desc:"Show your status. Cosmetic." },
    { slug:"skin_cape",     name:"Arcane Cape",    cat:"skin",   rarity:"epic",      price:14000, stat:null,       bonus:0,  emoji:"🧣",  desc:"Swirling purple. Cosmetic." },
    { slug:"skin_wings",    name:"Dragon Wings",   cat:"skin",   rarity:"legendary", price:50000, stat:null,       bonus:0,  emoji:"🦋",  desc:"Ascend the realm. Cosmetic." },
  ];
  for (const item of catalog) {
    await db`
      INSERT INTO shop_items (slug, name, category, rarity, price, stat_key, stat_bonus, emoji, description)
      VALUES (${item.slug}, ${item.name}, ${item.cat}, ${item.rarity}, ${item.price},
              ${item.stat ?? null}, ${item.bonus}, ${item.emoji}, ${item.desc})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  // Seed owner wallet with free credits
  const OWNER = "5deMkBfmVmPTDG5a5qecjMBDqbFqUZz7dw7xFbThmMvR";
  const TEST_AGENT_WALLET = "6iV22b6LECLHWgRCvJ1zVWReKG89M2UK9Aip7wxziS57";
  await db`
    INSERT INTO credits (wallet, amount) VALUES (${OWNER}, 1000000)
    ON CONFLICT (wallet) DO UPDATE SET amount = GREATEST(credits.amount, 1000000)
  `;
  await db`
    INSERT INTO credits (wallet, amount) VALUES (${TEST_AGENT_WALLET}, 1000000)
    ON CONFLICT (wallet) DO UPDATE SET amount = GREATEST(credits.amount, 1000000)
  `;
}

export function ensureSchema(): Promise<void> {
  if (!initPromise) {
    initPromise = runInit().catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}
