export type TilePos = { x: number; y: number };
export type ScreenPos = { sx: number; sy: number };

export type TileKind = "grass" | "stone" | "water" | "path" | "sand" | "wood";

export type ResourceKind = "tree" | "rock" | "pond" | "coal";

export type MobKind =
  | "wolf" | "boar" | "skeleton" | "bandit" | "orc" | "dragon"
  | "zombie" | "troll" | "goblin" | "archer" | "necromancer" | "demon";

export type ToolKind = "axe" | "pickaxe" | "rod" | "sword" | "hammer";

export type ItemKind =
  | "wood"
  | "stone"
  | "coal"
  | "fish"
  | "gold"
  | "axe"
  | "pickaxe"
  | "rod"
  | "sword"
  | "hammer";

export type ItemStack = { kind: ItemKind; count: number };

export type EntityBase = {
  id: number;
  tx: number;
  ty: number;
};

export type ResourceEntity = EntityBase & {
  type: "resource";
  kind: ResourceKind;
  hp: number;
  maxHp: number;
  respawnAt: number | null;
};

export type MobEntity = EntityBase & {
  type: "mob";
  kind: MobKind;
  hp: number;
  maxHp: number;
  damage: number;
  lastHitAt: number;
  patrolHomeX: number;
  patrolHomeY: number;
  state: "patrol" | "chase" | "attack" | "dead";
  respawnAt: number | null;
  moveCooldownUntil: number;
};

export type PlayerState = {
  tx: number;
  ty: number;
  px: number; // sub-tile interpolation x
  py: number;
  facing: "n" | "s" | "e" | "w";
  hp: number;
  maxHp: number;
  baseMaxHp: number;
  gold: number;
  kills: number;
  resourcesGathered: number;
  inventory: ItemStack[];
  hotbar: (ItemKind | null)[]; // length 6
  selectedSlot: number;
  skills: { gathering: number; combat: number; fishing: number };
  equipBonuses: { combat: number; maxHp: number; gathering: number };
  skin: string;
  path: TilePos[];
  walkProgress: number;
  busyUntil: number;
  busyKind: "chop" | "mine" | "fish" | "attack" | null;
};

export type WorldState = {
  width: number;
  height: number;
  tiles: TileKind[]; // length = w * h
  resources: ResourceEntity[];
  mobs: MobEntity[];
  player: PlayerState;
  realm: string;
  toast: { msg: string; until: number } | null;
};

export type Input = {
  click: { sx: number; sy: number } | null;
  keys: Set<string>;
  mouse: { sx: number; sy: number };
};
