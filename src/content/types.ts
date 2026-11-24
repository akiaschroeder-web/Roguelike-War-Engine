import type {
  AccessoryDef, BossDef, ClassDef, CommanderDef, EnemyArchetype, PermanentItemDef, RaceDef, SkillDef, UnitTemplate, WeaponDef, WorldDef,
} from '../engine/types';

/** A content pack: one game's worth of characters, regions and equipment. */
export interface ContentPack {
  id: string;
  name: string;
  races: RaceDef[];
  classes: ClassDef[];
  weapons: WeaponDef[];
  accessories: AccessoryDef[];
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
  /** id -> several art ids; each unit picks one. */
  artVariants?: Record<string, string[]>;
}
