import { HOLD_REQUIREMENT_UI, SITE } from "@/lib/constants";

type DocSection = {
  id: string;
  title: string;
  body: string;
  subsections?: { title: string; body: string }[];
};

const sections: { group: string; items: DocSection[] }[] = [
  {
    group: "Getting Started",
    items: [
      {
        id: "intro",
        title: "Introduction",
        body: `KAINOVA is an isometric play-to-earn realm. You connect a Solana wallet, prove you hold ${HOLD_REQUIREMENT_UI.toLocaleString()} ${SITE.ticker}, and spawn into Verdant Glade. From there: gather, fight, fish, build, and trade.`,
      },
      {
        id: "account",
        title: "Account & Identity",
        body: "Your wallet is your identity. Your display name is local to KAINOVA — pick one at first sign-in. Profile, leaderboard rank, and saved inventory are tied to your wallet.",
        subsections: [
          { title: "What saves automatically", body: "Inventory, gold, skills, completed quests, bank contents, and friends." },
          { title: "Stay safe", body: "We will never ask for your seed phrase. The realm only asks you to sign a connection handshake." },
        ],
      },
      {
        id: "first-session",
        title: "Your First Session",
        body: "After verification, you spawn on the Mainland with no tools. The tutorial NPC nearby shows where to pick up your axe, pickaxe, rod, and hammer.",
        subsections: [
          { title: "Recommended first steps", body: "Pick up tools → chop 10 wood near spawn → mine 5 stone → talk to tutorial NPC → claim daily." },
          { title: "What to avoid early", body: "Don't enter the Stormveil Wilds before skill 5. Don't bank ratio matters — keep a slot free." },
        ],
      },
    ],
  },
  {
    group: "World",
    items: [
      { id: "world", title: "Realms & Maps", body: "There are five realms connected by stone portals in Verdant Glade plaza." },
      { id: "mainland", title: "Verdant Glade (Mainland)", body: "Bank, fountain, tutorial NPC, marketplace, armory, and the portal hub." },
      { id: "wild", title: "Stormveil Wilds", body: "PvP zone east. Mobs, tombstones, rare drops." },
      { id: "pond", title: "Mistwater Pond", body: "Fishing pond and Roast Pit cooking station to the south." },
      { id: "eldergrove", title: "Whisperwood", body: "Peaceful southern woods. Shacks, second fishing pond, building zone." },
      { id: "arena", title: "Crimson Arena", body: "Structured PvP. Boxing rules — no item loss." },
      { id: "portals", title: "Portals & Travel", body: "Stand on a portal pad and press F to travel. Friends on another server appear in their world." },
      { id: "tombstones", title: "Tombstones / Death Bags", body: "Die in the Wilds and your items drop in a tombstone for ~5 minutes. Anyone can loot it." },
    ],
  },
  {
    group: "Core Systems",
    items: [
      { id: "loop", title: "Core Gameplay Loop", body: "Gather resources → craft & bank → take a quest → engage combat → claim rewards → repeat with better gear." },
      { id: "movement", title: "Movement & Camera", body: "Click ground to move. Scroll-wheel to zoom. Right-drag to pan." },
      { id: "inventory", title: "Inventory & Hotbar", body: "Drag tools from inventory to hotbar slots 1–6. Stacks merge to 999." },
      { id: "resources", title: "Resources & Gathering", body: "Wood, stone, coal, fish, gold. Most resources regenerate after 30s." },
      { id: "build", title: "Building & Pickup", body: "Hammer + wood: firepits and shacks. Hammer alone: pick up your own builds." },
      { id: "skills", title: "Skills & Progression", body: "Gathering, Combat, Fishing, Cooking — each tier unlocks better gear and more spinner-wheel access." },
    ],
  },
  {
    group: "Combat",
    items: [
      { id: "combat", title: "Combat Overview", body: "Melee only. Click to attack. Stay one tile away from the mob's hit-range; close to deal damage; back off when HP drops." },
      { id: "pve", title: "PvE & Mobs", body: "Wolves, skeletons, bandits. Drop gold and rare cosmetics. Bosses spawn at intervals in the Wilds." },
      { id: "pvp", title: "PvP & Safe Zones", body: "Verdant Glade and Whisperwood are safe. The Stormveil Wilds are open PvP." },
      { id: "arena-rules", title: "Arena Rules", body: "Crimson Arena is boxing-rules: no items lost, no tombstones, ranked ladder rewards." },
    ],
  },
  {
    group: "Activities",
    items: [
      { id: "quests", title: "Quests, Tutorial, Dailies", body: "Tutorial unlocks tools. Dailies reset every 24h. Long arcs unlock cosmetics." },
      { id: "fishing", title: "Fishing", body: "Cast rod, wait, snag. Higher tier fish at higher skill levels." },
      { id: "cooking", title: "Cooking", body: "Roast Pit converts raw fish to HP-restoring food." },
      { id: "cosmetics", title: "Cosmetics & Shop", body: "Buy with gold or $KAINOVA. Mounts, pets, hats, banners." },
    ],
  },
  {
    group: "Economy",
    items: [
      { id: "economy", title: "Economy Overview", body: "Gold is the in-realm currency. $KAINOVA is the on-chain currency. The two meet in the Marketplace." },
      { id: "market", title: "Marketplace", body: "List items for gold. Or list gold for $KAINOVA — 95% to seller, 5% to treasury." },
      { id: "spinner", title: "Spinner Wheel", body: "Free spin every 12 hours (skill 5 required). Paid extras burn 50% of $KAINOVA spent, treasury keeps the rest." },
      { id: "token", title: `${SITE.ticker} Token`, body: `${SITE.ticker} is the on-chain reserve. You must hold at least ${HOLD_REQUIREMENT_UI.toLocaleString()} to play. Buy on pump.fun.` },
      { id: "bank", title: "Banking & Storage", body: "Bank chests in Verdant Glade and Whisperwood. Storage is per-wallet across servers." },
    ],
  },
  {
    group: "Social",
    items: [
      { id: "chat", title: "World Chat & Moderation", body: "Global, local, and party chats. Slow-mode kicks in when realm chat heats up." },
      { id: "friends", title: "Friends", body: "Add by name, see online status, hop their server with one click." },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "controls", title: "Keybindings", body: "Move: click. Attack: spacebar or click mob. Hotbar: 1–6. Inventory: I. Bank: B at chest. Travel portal: F. Zoom: scroll." },
      { id: "commands", title: "Slash Commands", body: "/who, /w <name> <msg>, /trade <name>, /party invite <name>, /spectate <name>, /stuck." },
      { id: "faq", title: "Troubleshooting & FAQ", body: "Disconnected? Refresh — your character is server-side. Balance not detected? Check your KAINOVA ATA exists and is funded. Stuck? Type /stuck." },
    ],
  },
];

export function Docs() {
  return (
    <section id="docs" className="max-w-7xl mx-auto px-5 py-16 md:py-24">
      <div className="mb-10">
        <div className="chip mb-3">Game guide</div>
        <h2 className="headline text-4xl md:text-5xl font-bold">{SITE.name} Documentation</h2>
        <p className="text-[var(--ink-1)] mt-3 max-w-2xl">
          The full rule-book — every realm, every skill, every command.
        </p>
      </div>
      <div className="grid md:grid-cols-[260px,1fr] gap-8">
        <aside className="hidden md:block">
          <nav className="sticky top-24 panel p-4 text-sm space-y-4">
            {sections.map((g) => (
              <div key={g.group}>
                <div className="text-[var(--ink-2)] text-[11px] uppercase tracking-widest mb-1">
                  {g.group}
                </div>
                <ul className="space-y-1">
                  {g.items.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#docs-${s.id}`}
                        className="block px-2 py-1 rounded hover:bg-white/5 text-[var(--ink-1)] hover:text-white"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <div className="space-y-10">
          {sections.map((g) => (
            <div key={g.group}>
              <h3 className="text-[var(--ink-2)] text-[11px] uppercase tracking-widest mb-3">
                {g.group}
              </h3>
              <div className="space-y-6">
                {g.items.map((s) => (
                  <article
                    key={s.id}
                    id={`docs-${s.id}`}
                    className="card p-6 scroll-mt-24"
                  >
                    <h4 className="headline text-xl font-semibold mb-2">{s.title}</h4>
                    <p className="text-[var(--ink-1)] leading-relaxed">{s.body}</p>
                    {s.subsections && (
                      <div className="mt-4 space-y-3">
                        {s.subsections.map((sub) => (
                          <div key={sub.title}>
                            <div className="text-sm font-semibold text-white mb-1">
                              {sub.title}
                            </div>
                            <div className="text-sm text-[var(--ink-1)]">{sub.body}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
