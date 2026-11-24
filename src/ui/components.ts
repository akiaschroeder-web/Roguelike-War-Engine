import { ACCESSORIES, CLASSES, PERMANENT_ITEMS, raceOf, skillDef, WEAPONS, worldDef } from '../data/registry';
import type { LevelUp } from '../engine/combat';
import { effectiveStats, XP_PER_LEVEL } from '../engine/units';
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

export const RARITY_COLORS: Record<string, string> = {
  common: '#b8b4c8', uncommon: '#6fd08a', rare: '#5aa8ff', epic: '#c07aff', legendary: '#ffb84a', mythic: '#ff6a8a',
};

interface TokenLike {
  home: string;
  glyph: string;
  team: 'player' | 'enemy';
  isBoss?: boolean;
  isCommander?: boolean;
  /** Used to look up portraits/<id>.png */
  portraitId?: string;
}

export const portraitIdOf = (u: Pick<Unit, 'templateId' | 'bossId' | 'name'>) => u.bossId ?? u.templateId ?? u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * A unit token. Shows `portraits/<id>.png` if that file exists; otherwise the
 * initials act as a placeholder (the image hides itself when missing).
 */
export function token(u: TokenLike | Unit, size = 40): string {
  const t: TokenLike = 'uid' in u ? { home: u.home, glyph: u.glyph, team: u.team, isBoss: u.isBoss, isCommander: u.isCommander, portraitId: portraitIdOf(u) } : u;
  const w = worldDef(t.home);
  const img = t.portraitId ? `<img src="portraits/${esc(t.portraitId)}.png" alt="" draggable="false" onerror="this.remove()">` : '';
  return `<span class="token ${t.team}" style="--wc:${w.color};--sz:${size}px"><b>${esc(t.glyph)}</b>${img}${
    t.isBoss ? '<i class="crown">♛</i>' : t.isCommander ? '<i class="crown star">★</i>' : ''
  }</span>`;
}

export function worldTag(worldId: string): string {
  const w = worldDef(worldId);
  return `<span class="world-tag" style="--wc:${w.color}">${esc(w.name)}</span>`;
}

export function weaponLine(w: WeaponDef, opts: { equipped?: boolean } = {}): string {
  const range = w.minRange === w.maxRange ? `${w.minRange}` : `${w.minRange}–${w.maxRange}`;
  const mt = w.type === 'staff' ? `Heal ${w.might}` : `Mt ${w.might}`;
  return `<span class="weapon-line"><b style="color:${RARITY_COLORS[w.rarity]}">${WEAPON_ICONS[w.type] ?? ''} ${esc(w.name)}</b>${opts.equipped ? ' <span class="badge eq">E</span>' : ''} <span class="dim">${mt} · Hit ${w.hit} · Crit ${w.crit} · Wt ${w.weight} · Rng ${range}${
    w.effective ? ` · ×2 vs ${w.effective.join('/')}` : ''}${w.pierce ? ` · ignores ${w.pierce * 100}% DEF` : ''}${w.brave ? ' · strikes twice' : ''}</span></span>`;
}

/** One-line description for any item id (weapon, accessory or permanent). */
export function itemLine(id: string): string {
  const w = WEAPONS[id];
  if (w) return weaponLine(w) + (w.desc ? `<div class="dim small">${esc(w.desc)}</div>` : '');
  const a = ACCESSORIES[id];
  if (a) return `<span><b style="color:${RARITY_COLORS[a.rarity]}">◇ ${esc(a.name)}</b> <span class="dim">${esc(a.desc)}</span></span>`;
  const p = PERMANENT_ITEMS[id];
  if (p) return `<span><b>❤ ${esc(p.name)}</b> <span class="dim">${esc(p.desc)}</span></span>`;
  return esc(id);
}

export function itemName(id: string): string {
  return WEAPONS[id]?.name ?? ACCESSORIES[id]?.name ?? PERMANENT_ITEMS[id]?.name ?? id;
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
      <div class="ud-weapons">${u.weapons.map((id, i) => (WEAPONS[id] ? `<div>${weaponLine(WEAPONS[id], { equipped: i === 0 })}</div>` : '')).join('')}</div>
      ${u.accessory ? `<div class="small">${itemLine(u.accessory)}</div>` : ''}
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
