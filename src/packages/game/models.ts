export type ID = string | number;

export const enum Rarity {
  Common = "common",
  Free = "free",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
}

export const enum MinionType {
  Murloc = "murloc",
  Demon = "demon",
  Mech = "mech",
  Elemental = "elemental",
  Beast = "beast",
  Totem = "totem",
  Pirate = "pirate",
  Dragon = "dragon",
  All = "all",
}

export interface Class {
  slug: string;
  name: string;
}

interface Card {
  id: ID;
  rarity: Rarity;
}
