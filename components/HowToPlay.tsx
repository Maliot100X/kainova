import { HOLD_REQUIREMENT_UI, SITE } from "@/lib/constants";

const steps = [
  {
    id: "start",
    icon: "🪪",
    title: "Connect & Verify",
    body: `Connect any Solana wallet (Phantom, Solflare, Backpack). The realm checks your wallet for ${HOLD_REQUIREMENT_UI.toLocaleString()} ${SITE.ticker} — once verified, the gates open and you spawn in Verdant Glade.`,
  },
  {
    id: "world",
    icon: "🗺️",
    title: "The Realm at a Glance",
    body: "Verdant Glade is home base — bank, fountain, tutorial NPC. South lies Mistwater Pond for fishing. East are the Stormveil Wilds — dangerous, tombstone if you die. North is the Crimson Arena for PvP.",
  },
  {
    id: "gather",
    icon: "🪓",
    title: "Gather & Craft",
    body: "Axes chop wood from oaks. Pickaxes break stone and coal from cliffs. Rods catch fish from Mistwater. Hammers place firepits and shacks. Stacks merge up to 999 per slot — bank often.",
  },
  {
    id: "combat",
    icon: "⚔️",
    title: "Combat: Spacing, Tempo, Reward",
    body: "Melee only. Train at the armory before stepping into the Wilds. Mobs drop gold and rare mounts. Spacing and healing beat cosmetics every time.",
  },
  {
    id: "quests",
    icon: "📜",
    title: "Quests, Dailies & Arcs",
    body: "Tutorial gets you tools. Daily quests reset every 24h. Long quest arcs unlock skill milestones and cosmetic prizes.",
  },
  {
    id: "wild",
    icon: "💀",
    title: "Wilderness & Tombstones",
    body: "The Stormveil Wilds are PvP-enabled. Die there and your items drop in a Tombstone — anyone can loot it. Bank heavy stacks before entering.",
  },
  {
    id: "life",
    icon: "🎣",
    title: "Life Skills: Fishing & Cooking",
    body: "Fish at Mistwater Pond. Cook your catch at the Roast Pit for HP-restoring food. Levels gate higher-tier fish and recipes.",
  },
  {
    id: "social",
    icon: "👥",
    title: "Friends & Realm Chat",
    body: "Add friends by name, see who's online, hop their server. Realm chat is moderated; slash commands let you whisper, party-up, or trade directly.",
  },
  {
    id: "economy",
    icon: "💰",
    title: "Economy & Trading",
    body: `Gold buys most items in-realm. The Marketplace lets you list items for gold, or list gold for ${SITE.ticker} — sellers get 95%, treasury keeps 5%. You always need ${HOLD_REQUIREMENT_UI.toLocaleString()} ${SITE.ticker} held to keep playing.`,
  },
];

export function HowToPlay() {
  return (
    <section id="how-to-play" className="max-w-7xl mx-auto px-5 py-16 md:py-24">
      <div className="mb-10">
        <div className="chip mb-3">Player guide</div>
        <h2 className="headline text-4xl md:text-5xl font-bold">How to play {SITE.name}</h2>
        <p className="text-[var(--ink-1)] mt-3 max-w-2xl">
          A quick path from your first login to gathering, combat, quests, and trading — written
          for holders, not developers.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.id} className="card p-6">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="headline text-lg font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-[var(--ink-1)] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
