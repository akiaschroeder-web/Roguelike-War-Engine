import { imgUrl } from './media';
import { ABILITIES, GEAR, ITEMS, artFor, CLASSES, PERMANENT_ITEMS, raceOf, skillDef, unitArt, WEAPONS, worldDef } from '../data/registry';
import { STATUS_INFO } from '../engine/status';
import { GEAR_SLOTS } from '../engine/types';
import { packSize } from '../engine/units';
import type { LevelUp } from '../engine/combat';
import { effectiveStats, forgeLevel, maxUses, usesLeft, XP_PER_LEVEL } from '../engine/units';
import type { StatKey, Unit, UnitTemplate, WeaponDef } from '../engine/types';

export const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP', str: 'STR', mag: 'MAG', skl: 'SKL', spd: 'SPD', def: 'DEF', res: 'RES', lck: 'LCK', con: 'CON', mov: 'MOV', sta: 'STA', mp: 'MP',
};

export const WEAPON_ICONS: Record<string, string> = {
  sword: '🗡', lance: '⟋', axe: '🪓', hammer: '🔨', dagger: '🔪', gauntlet: '✊', bow: '🏹', sling: '•',
  boomerang: '🪃', hookshot: '⛓', magic: '✦', staff: '✚', natural: '✶',
};

export const SLOT_LABELS: Record<string, string> = {
  shield: 'Shield', head: 'Head', body: 'Body', hands: 'Hands', feet: 'Feet', accessory: 'Accessory', acc1: 'Accessory', acc2: 'Accessory', tool: 'Tool (Slate / Arm)', mount: 'Mount',
  hull: 'Hull', sail: 'Sail', utility: 'Utility', flag: 'Flag',
  cannonMount: 'Cannon', prow: 'Prow', anchor: 'Anchor', handrail: 'Handrail', bridge: 'Bridge', chimney: 'Chimney', wheel: 'Wheel',
  trainEngine: 'Engine', trainCannon: 'Train Cannon', passengerCar: 'Passenger Car', freightCar: 'Freight Car',
};
export const SLOT_ICONS: Record<string, string> = {
  shield: '🛡', head: '⛑', body: '👕', hands: '🧤', feet: '👢', accessory: '◇', acc1: '◇', acc2: '◇', tool: '📱', mount: '🐎',
  hull: '🪵', sail: '⛵', utility: '⚙', flag: '🚩',
  cannonMount: '💣', prow: '🔺', anchor: '⚓', handrail: '🛤', bridge: '🧭', chimney: '🏭', wheel: '☸',
  trainEngine: '🚂', trainCannon: '💥', passengerCar: '🚃', freightCar: '📦',
};
export const ITEM_ICONS: Record<string, string> = {
  heal: '🧪', fullHeal: '🧪', mp: '🧪', sta: '🧪', fairy: '🧚', bomb: '💣', stun: '🌰', learn: '📜',
  cure: '💧', buff: '⚗', fruit: '🍎', cloud: '🍄', muddle: '🌸', bean: '🫘', tool: '🔧',
};

export function packLine(u: Unit): string {
  if (!u.pack.length) return '';
  return `<div class="pack-line small"><span class="dim">Pack ${u.pack.length}/${packSize(u)}:</span> ${u.pack
    .map((p) => `${ITEM_ICONS[ITEMS[p.id]?.kind] ?? ''} ${esc(ITEMS[p.id]?.name ?? p.id)}${p.uses > 1 ? ` ×${p.uses}` : ''}`).join(' · ')}</div>`;
}

export const ABILITY_ICONS: Record<string, string> = { spell: '✦', song: '♪', arrow: '➶', technique: '⚔', personal: '★' };

export function abilitiesLine(u: Unit): string {
  const defs = u.abilities.map((id) => ABILITIES[id]).filter((d) => d && d.kind !== 'personal');
  if (!defs.length) return '';
  return `<div class="pack-line small"><span class="dim">Magic:</span> ${defs
    .map((d) => `<span title="${esc(d.desc)}">${ABILITY_ICONS[d.kind]} ${esc(d.name)}${d.implemented ? '' : ' <span class="badge soon">coming</span>'}</span>`).join(' · ')}</div>`;
}

export function gearLine(u: Unit): string {
  const worn = GEAR_SLOTS.filter((s) => u.gear[s]);
  if (!worn.length) return '';
  return `<div class="gear-line small">${worn.map((s) => `<span title="${esc(GEAR[u.gear[s]!]?.desc ?? '')}">${SLOT_ICONS[s]} ${esc(GEAR[u.gear[s]!]?.name ?? '')}</span>`).join(' ')}</div>`;
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#b8b4c8', uncommon: '#6fd08a', rare: '#5aa8ff', epic: '#c07aff', legendary: '#ffb84a', mythic: '#ff6a8a',
};

interface TokenLike {
  home: string;
  glyph: string;
  team: 'player' | 'enemy';
  isBoss?: boolean;
  isCommander?: boolean;
  /** Unit/boss/template id; resolved to portraits/<id>.png through the art registry. */
  portraitId?: string;
  /** Picks a stable art variant (unit uid). */
  seed?: string;
  /** The player's chosen art variant. */
  artPick?: string;
}

export const portraitIdOf = (u: Pick<Unit, 'templateId' | 'bossId' | 'artId'>) => u.bossId ?? u.templateId ?? u.artId;

/**
 * A unit token. Shows `portraits/<id>.png` if that file exists; otherwise the
 * initials act as a placeholder (the image hides itself when missing).
 */
export function token(u: TokenLike | Unit, size = 40): string {
  const t: TokenLike = 'uid' in u ? { home: u.home, glyph: u.glyph, team: u.team, isBoss: u.isBoss, isCommander: u.isCommander, portraitId: portraitIdOf(u), seed: u.uid, artPick: u.artPick } : u;
  const w = worldDef(t.home);
  // Units: battle forms and equipment-dependent art (Link with the Rod of Seasons) come first.
  const art = 'uid' in u ? unitArt(u) : artFor(t.portraitId, t.seed, t.artPick);
  const img = art ? `<img src="${imgUrl('portraits', art)}" alt="" draggable="false" onerror="this.parentNode.classList.remove('has-img');this.remove()">` : '';
  return `<span class="token ${t.team}${art ? ' has-img' : ''}" style="--wc:${w.color};--sz:${size}px"><b>${esc(t.glyph)}</b>${img}${
    t.isBoss ? '<i class="crown">♛</i>' : t.isCommander ? '<i class="crown star">★</i>' : ''
  }</span>`;
}

export function worldTag(worldId: string): string {
  const w = worldDef(worldId);
  return `<span class="world-tag" style="--wc:${w.color}">${esc(w.name)}</span>`;
}

export function weaponLine(w: WeaponDef, opts: { equipped?: boolean; owner?: Unit } = {}): string {
  const range = w.minRange === w.maxRange ? `${w.minRange}` : `${w.minRange}–${w.maxRange}`;
  const plus = opts.owner ? forgeLevel(opts.owner, w.id) : 0;
  const mt = w.type === 'staff' ? `Heal ${w.might}` : `Mt ${w.might + plus}`;
  const left = opts.owner ? usesLeft(opts.owner, w.id) : null;
  const max = maxUses(w);
  const uses = !max ? (w.type === 'natural' || w.type === 'instrument' ? '' : ' · Unbreakable') : left !== null ? ` · <span class="${left <= 3 ? 'down' : ''}">Uses ${left}/${max}</span>` : ` · Uses ${max}`;
  return `<span class="weapon-line"><b style="color:${RARITY_COLORS[w.rarity]}">${WEAPON_ICONS[w.type] ?? ''} ${esc(w.name)}${plus ? ` +${plus}` : ''}</b>${opts.equipped ? ' <span class="badge eq">E</span>' : ''} <span class="dim">${mt} · Hit ${w.hit} · Crit ${w.crit} · Wt ${w.weight} · Rng ${range}${uses}${
    w.effective ? ` · ×2 vs ${w.effective.join('/')}` : ''}${w.pierce ? ` · ignores ${w.pierce * 100}% DEF` : ''}${w.brave ? ' · strikes twice' : ''}</span></span>`;
}

/** One-line description for any item id (weapon, accessory or permanent). */
export function itemLine(id: string): string {
  const w = WEAPONS[id];
  if (w) return weaponLine(w) + (w.desc ? `<div class="dim small">${esc(w.desc)}</div>` : '');
  const a = GEAR[id];
  if (a) return `<span><b style="color:${RARITY_COLORS[a.rarity]}">${SLOT_ICONS[a.slot]} ${esc(a.name)}</b> <span class="badge">${SLOT_LABELS[a.slot]}</span> <span class="dim">${esc(a.desc)}</span></span>`;
  const it = ITEMS[id];
  if (it) return `<span><b style="color:${RARITY_COLORS[it.rarity]}">${ITEM_ICONS[it.kind]} ${esc(it.name)}</b> <span class="badge">Item${it.uses > 1 ? ` ×${it.uses}` : ''}</span> <span class="dim">${esc(it.desc)}</span></span>`;
  const p = PERMANENT_ITEMS[id];
  if (p) return `<span><b>❤ ${esc(p.name)}</b> <span class="dim">${esc(p.desc)}</span></span>`;
  return esc(id);
}

export function itemName(id: string): string {
  return WEAPONS[id]?.name ?? GEAR[id]?.name ?? ITEMS[id]?.name ?? PERMANENT_ITEMS[id]?.name ?? id;
}

export function statGrid(u: Unit): string {
  const eff = effectiveStats(u);
  const keys = ['str', 'mag', 'skl', 'spd', 'def', 'res', 'lck', 'con', 'mov'] as const;
  return `<div class="stat-grid">${keys
    .map((k) => {
      const diff = eff[k] - u.stats[k];
      return `<div><span class="dim">${STAT_LABELS[k]}</span><b>${eff[k]}</b>${diff ? `<sup class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '+' : ''}${diff}</sup>` : ''}</div>`;
    })
    .join('')}</div>`;
}

export function hpBar(hp: number, max: number): string {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const cls = pct > 50 ? 'good' : pct > 25 ? 'warn' : 'bad';
  return `<div class="hpbar"><div class="fill ${cls}" style="width:${pct}%"></div></div>`;
}

export function skillLine(id: string): string {
  const s = skillDef(id);
  return `<div class="ud-skill"><b>${esc(s.name)}</b>${s.implemented ? '' : ' <span class="badge soon">coming</span>'} <span class="dim">${esc(s.desc)}</span></div>`;
}

export function unitDetails(u: Unit): string {
  const cls = CLASSES[u.classId];
  const race = raceOf(u.race);
  return `
    <div class="unit-details">
      <div class="ud-head">
        ${token(u, 48)}
        <div>
          <div class="ud-name">${esc(u.name)} ${u.isCommander ? '<span class="badge gold">Commander</span>' : ''}${u.isBoss ? '<span class="badge red">Boss</span>' : ''}</div>
          <div class="dim small">${esc(u.title)}</div>
          <div class="small">${esc(race.name)} · ${cls?.icon ?? ''} ${esc(cls?.name ?? u.classId)}${u.size > 1 ? ` · <b>Size ${u.size}</b>` : ''}</div>
        </div>
      </div>
      <div class="ud-row"><span>Lv <b>${u.level}</b></span>${u.team === 'player' ? `<span class="dim small">XP ${u.xp}/${XP_PER_LEVEL}</span>` : ''}<span class="ud-hp">HP <b>${u.hp}</b>/${u.stats.hp}</span></div>
      ${hpBar(u.hp, u.stats.hp)}
      ${statGrid(u)}
      <div class="ud-weapons">${u.weapons.map((id, i) => (WEAPONS[id] ? `<div>${weaponLine(WEAPONS[id], { equipped: i === 0, owner: u })}</div>` : '')).join('')}</div>
      ${gearLine(u)}
      ${packLine(u)}
      ${u.cargo?.length ? `<div class="small cargo-list">⛵ <b>Aboard:</b> ${u.cargo.map((p) => `${esc(p.name)} <span class="dim">(${p.hp}/${p.stats.hp})</span>`).join(', ')}</div>` : ''}
      ${u.damaged && Object.keys(u.damaged).length ? `<div class="small"><span class="badge red">🔧 Damaged</span> <span class="dim">${Object.keys(u.damaged).map((k) => ({ sail: 'sail torn (−50% MOV)', mast: 'mast broken (no wind bonus)', rudder: 'rudder jammed (−1 MOV)', cannon: 'cannons out' } as Record<string, string>)[k]).join(', ')}</span></div>` : ''}
      ${u.armorBroken ? '<div class="small"><span class="badge">Armor broken</span></div>' : ''}
      ${u.stats.mp > 0 || u.stats.sta > 0 ? `<div class="ud-row small">${u.stats.mp > 0 ? `<span>MP <b>${u.mp}</b>/${u.stats.mp}</span>` : '<span></span>'}<span>STA <b>${u.sta ?? u.stats.sta}</b>/${u.stats.sta}</span></div>` : ''}
      ${u.stats.mp > 0 ? `<div class="mpbar"><div class="fill" style="width:${Math.max(0, Math.min(100, (u.mp / u.stats.mp) * 100))}%"></div></div>` : ''}
      ${u.statuses.map((st) => `<div class="small"><span class="badge red">${STATUS_INFO[st.kind].icon} ${STATUS_INFO[st.kind].name}</span> <span class="dim">${STATUS_INFO[st.kind].desc} (${st.turns} turn${st.turns > 1 ? 's' : ''})</span></div>`).join('')}
      ${u.buffs.map((bf) => `<div class="small"><span class="badge eq">✦ ${esc(bf.name)}</span> <span class="dim">${bf.barrier ? 'Negates all damage' : Object.entries(bf.stats ?? {}).map(([k, v]) => `${v >= 0 ? '+' : ''}${v} ${STAT_LABELS[k]}`).join(', ')} (${bf.turns} turn${bf.turns > 1 ? 's' : ''})</span></div>`).join('')}
      ${abilitiesLine(u)}
      ${u.skills.map(skillLine).join('')}
    </div>`;
}

export function templateCard(t: UnitTemplate, extra = ''): string {
  const cls = CLASSES[t.classId];
  const race = raceOf(t.race);
  return `
    <div class="hero-card" style="--wc:${worldDef(t.home).color}">
      <div class="hc-top">
        ${token({ home: t.home, glyph: t.glyph, team: 'player', portraitId: t.id }, 52)}
        <div>
          <div class="hc-name">${esc(t.name)}</div>
          <div class="dim small">${esc(t.title)}</div>
          <div class="small">${esc(race.name)} · ${cls?.icon ?? ''} ${esc(cls?.name ?? '')}${t.size > 1 ? ` · Size ${t.size}` : ''}</div>
        </div>
      </div>
      <div class="mini-stats">${(['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res', 'mov'] as const).map((k) => `<span><i>${STAT_LABELS[k]}</i>${t.stats[k]}</span>`).join('')}</div>
      <div class="small">${t.weapons.map((id) => `${WEAPON_ICONS[WEAPONS[id]?.type] ?? ''} ${esc(WEAPONS[id]?.name ?? id)}`).join(' · ')}</div>
      ${t.skill ? skillLine(t.skill) : ''}
      <p class="bio">${esc(t.bio)}</p>
      ${extra}
    </div>`;
}

// ───────── Modals ─────────

export function modal(inner: string, opts: { dismissable?: boolean } = {}): { el: HTMLElement; close: () => void } {
  const el = document.createElement('div');
  el.className = 'modal-backdrop';
  el.innerHTML = `<div class="modal">${inner}</div>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  if (opts.dismissable) {
    el.addEventListener('click', (e) => {
      if (e.target === el || (e.target as HTMLElement).closest('[data-close]')) close();
    });
  }
  return { el, close };
}

export function showLevelUps(ups: LevelUp[], units: Unit[]): Promise<void> {
  if (!ups.length) return Promise.resolve();
  return new Promise((resolve) => {
    let i = 0;
    const m = modal('');
    const render = () => {
      const up = ups[i];
      const u = units.find((x) => x.uid === up.uid);
      const keys: StatKey[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res', 'lck'];
      m.el.querySelector('.modal')!.innerHTML = `
        <div class="levelup">
          <div class="lu-title">LEVEL UP!</div>
          <div class="lu-who">${u ? token(u, 44) : ''}<div><b>${esc(up.name)}</b><div class="dim">Level ${up.level}</div></div></div>
          <div class="lu-grid">${keys.map((k) => {
            const g = up.gains[k];
            return `<div class="${g ? 'gain' : ''}"><span>${STAT_LABELS[k]}</span><b>${u ? u.stats[k] : ''}</b>${g ? `<em>+${g}</em>` : ''}</div>`;
          }).join('')}</div>
          <button class="btn primary" data-next>${i < ups.length - 1 ? 'Next' : 'Continue'}</button>
        </div>`;
      (m.el.querySelector('[data-next]') as HTMLButtonElement).focus();
    };
    m.el.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('[data-next]')) return;
      i++;
      if (i >= ups.length) { m.close(); resolve(); } else render();
    });
    render();
  });
}

export function confirmDialog(text: string, yes = 'Confirm', no = 'Cancel'): Promise<boolean> {
  return new Promise((resolve) => {
    const m = modal(`<p>${text}</p><div class="row end"><button class="btn" data-no>${esc(no)}</button><button class="btn primary" data-yes>${esc(yes)}</button></div>`);
    m.el.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-yes]')) { m.close(); resolve(true); }
      else if (t.closest('[data-no]')) { m.close(); resolve(false); }
    });
  });
}
