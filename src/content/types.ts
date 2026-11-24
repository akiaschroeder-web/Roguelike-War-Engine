import type {
  AbilityDef, GearDef, ItemDef, BossDef, ClassDef, CommanderDef, EnemyArchetype, PermanentItemDef, RaceDef, SkillDef, UnitTemplate, WeaponDef, WorldDef,
} from '../engine/types';

/** A content pack: one game's worth of characters, regions and equipment. */
export interface ContentPack {
  id: string;
  name: string;
  races: RaceDef[];
  classes: ClassDef[];
  weapons: WeaponDef[];
  gear: GearDef[];
  items: ItemDef[];
  abilities: AbilityDef[];
  permanentItems: PermanentItemDef[];
  skills: SkillDef[];
  regions: WorldDef[];
  templates: UnitTemplate[];
  enemies: EnemyArchetype[];
  rosters: Record<string, string[]>;
  bosses: BossDef[];
  regionBosses: Record<string, string[]>;
  commanders: (CommanderDef & { pendingGear?: string[] })[];
  /** Ids with files in public/art and public/portraits. */
  artIds: string[];
  /** id -> id whose art it reuses. */
  artAliases: Record<string, string>;
  /** Boss ids that are another form of an existing template (not recruited separately). */
  bossAsTemplate?: Record<string, string>;
  /** Template ids that can't serve in the same army (forms of the same person). */
  exclusivePairs?: [string, string][];
  /** id -> several art ids; each unit picks one. */
  artVariants?: Record<string, string[]>;
}
