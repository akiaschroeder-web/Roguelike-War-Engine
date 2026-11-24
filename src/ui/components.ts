import { CLASSES } from '../data/classes';
import { HERO_MAP } from '../data/heroes';
import { RELICS, SKILLS } from '../data/skills';
import { WEAPONS } from '../data/weapons';
import { worldDef } from '../data/worlds';
import type { LevelUp } from '../engine/combat';
import { effectiveStats, XP_PER_LEVEL } from '../engine/units';
import type { HeroDef, RelicId, StatKey, Unit, WeaponDef } from '../engine/types';

export const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const STAT_LABELS: Record<StatKey | 'mov', string> = {
  hp: 'HP', str: 'Str', mag: 'Mag', skl: 'Skl', spd: 'Spd', def: 'Def', res: 'Res', mov: 'Mov',
};

export const WEAPON_ICONS: Record<string, string> = {
  sword: '🗡', lance: '⟋', axe: '🪓', bow: '🏹', magic: '✦', gun: '⌖', staff: '✚',
};

export function worldTag(worldId: Unit['world']): string {
  const w = worldDef(worldId);
  return `<span class="world-tag" style="--wc:${w.color}">${esc(w.name)}</span>`;
}

export function token(
  u: Pick<Unit, 'world' | 'glyph' | 'team'> & { isBoss?: boolean; isCommander?: boolean; portrait?: string },
  size = 40,
): string {
  const w = worldDef(u.world);
  const face = u.portrait ? `<img src="${esc(u.portrait)}" alt="" draggable="false">` : esc(u.glyph);
  return `<span class="token ${u.team}${u.portrait ? ' has-img' : ''}" style="--wc:${w.color};--sz:${size}px">${face}${
    u.isBoss ? '<i class="crown">♛</i>' : u.isCommander ? '<i class="crown star">★</i>' : ''
  }</span>`;
}

export function weaponLine(w: WeaponDef): string {
  const range = w.minRange === w.maxRange ? `${w.minRange}` : `${w.minRange}-${w.maxRange}`;
  const mt = w.type === 'staff' ? `Heal ${w.might}` : `Mt ${w.might}`;
  return `<span class="weapon-line"><b>${WEAPON_ICONS[w.type] ?? ''} ${esc(w.name)}</b> <span class="dim">${mt} · Hit ${w.hit} · Crit ${w.crit} · Rng ${range}${
    w.effective ? ` · ×2 vs ${w.effective.join('/')}` : ''
  }</span></span>`;
}

export function statGrid(u: Unit, relics: RelicId[] = []): string {
  const eff = effectiveStats(u, relics);
  const keys: (StatKey | 'mov')[] = ['str', 'mag', 'skl', 'spd', 'def', 'res', 'mov'];
  return `<div class="stat-grid">${keys
    .map((k) => {
      const base = u.stats[k];
      const e = eff[k];
      const diff = e - base;
      return `<div><span class="dim">${STAT_LABELS[k]}</span><b>${e}</b>${diff ? `<sup class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '+' : ''}${diff}</sup>` : ''}</div>`;
    })
    .join('')}</div>`;
}

export function hpBar(hp: number, max: number): string {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const cls = pct > 50 ? 'good' : pct > 25 ? 'warn' : 'bad';
  return `<div class="hpbar"><div class="fill ${cls}" style="width:${pct}%"></div></div>`;
}

export function unitDetails(u: Unit, relics: RelicId[] = []): string {
  const cls = CLASSES[u.classId];
  const w = WEAPONS[u.weaponId];
  return `
    <div class="unit-details">
      <div class="ud-head">
        ${token(u, 48)}
        <div>
          <div class="ud-name">${esc(u.name)} ${u.isCommander ? '<span class="badge gold">Commander</span>' : ''}${u.isBoss ? '<span class="badge red">Warlord</span>' : ''}</div>
          <div class="dim small">${esc(u.title)}</div>
          <div class="small">${worldTag(u.world)} <span class="dim">${cls.icon} ${esc(cls.name)} · ${cls.moveType}</span></div>
        </div>
      </div>
      <div class="ud-row"><span>Lv <b>${u.level}</b></span>${u.team === 'player' ? `<span class="dim small">XP ${u.xp}/${XP_PER_LEVEL}</span>` : ''}<span class="ud-hp">HP <b>${u.hp}</b>/${u.stats.hp}</span></div>
      ${hpBar(u.hp, u.stats.hp)}
      ${statGrid(u, u.team === 'player' ? relics : [])}
      <div class="ud-weapon">${weaponLine(w)}${w.desc ? `<div class="dim small">${esc(w.desc)}</div>` : ''}</div>
      ${u.skills.map((s) => `<div class="ud-skill"><b>${esc(SKILLS[s].name)}</b> <span class="dim">${esc(SKILLS[s].desc)}</span></div>`).join('')}
    </div>`;
}

export function heroCard(h: HeroDef, extra = ''): string {
  const cls = CLASSES[h.classId];
  const w = WEAPONS[h.weaponId];
  return `
    <div class="hero-card" style="--wc:${worldDef(h.world).color}">
      <div class="hc-top">
        ${token({ world: h.world, glyph: h.glyph, team: 'player', portrait: h.portrait }, 52)}
        <div>
          <div class="hc-name">${esc(h.name)}</div>
          <div class="dim small">${esc(h.title)}</div>
          ${worldTag(h.world)}
        </div>
      </div>
      <div class="small"><span class="dim">Class</span> ${cls.icon} ${esc(cls.name)} <span class="dim">· Weapon</span> ${WEAPON_ICONS[w.type]} ${esc(w.name)}</div>
      <div class="small"><span class="dim">Skill</span> <b>${esc(SKILLS[h.skill].name)}</b> — ${esc(SKILLS[h.skill].desc)}</div>
      <p class="bio">${esc(h.bio)}</p>
      ${extra}
    </div>`;
}

export function relicChip(id: RelicId): string {
  const r = RELICS[id];
  return `<span class="relic" title="${esc(r.name)}: ${esc(r.desc)}">${r.icon}<span class="relic-name">${esc(r.name)}</span></span>`;
}

export function heroDefOf(u: Unit): HeroDef | undefined {
  return u.heroId ? HERO_MAP[u.heroId] : undefined;
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
      const keys: StatKey[] = ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res'];
      m.el.querySelector('.modal')!.innerHTML = `
        <div class="levelup">
          <div class="lu-title">LEVEL UP!</div>
          <div class="lu-who">${u ? token(u, 44) : ''}<div><b>${esc(up.name)}</b><div class="dim">Level ${up.level}</div></div></div>
          <div class="lu-grid">${keys
            .map((k) => {
              const g = up.gains[k];
              const val = u ? u.stats[k] : '';
              return `<div class="${g ? 'gain' : ''}"><span>${STAT_LABELS[k]}</span><b>${val}</b>${g ? `<em>+${g}</em>` : ''}</div>`;
            })
            .join('')}</div>
          <button class="btn primary" data-next>${i < ups.length - 1 ? 'Next' : 'Continue'}</button>
        </div>`;
      (m.el.querySelector('[data-next]') as HTMLButtonElement).focus();
    };
    m.el.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('[data-next]')) return;
      i++;
      if (i >= ups.length) {
        m.close();
        resolve();
      } else render();
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
