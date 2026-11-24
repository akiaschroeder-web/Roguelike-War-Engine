// A short side-view battle scene shown when two units fight, in the style of
// classic tactics games: enemy on the left, player on the right, HP bars,
// lunges, hit flashes, damage numbers and a KO. Click to skip.

import { artFor, worldDef } from '../data/registry';
import type { Strike } from '../engine/combat';
import type { Unit } from '../engine/types';
import { esc, portraitIdOf, token } from './components';

export interface SideInfo {
  weapon: string;
  dmg: number | null;
  hit: number | null;
  crit: number | null;
}

export interface CinematicOptions {
  attacker: Unit;
  defender: Unit;
  startHp: Record<string, number>;
  strikes: Strike[];
  info: Record<string, SideInfo>;
  world: string;
}

const PREF_KEY = 'hyrule.battleAnims';

export function animationsEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAnimationsEnabled(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
  } catch { /* ignore */ }
}

export function playCinematic(opts: CinematicOptions): Promise<void> {
  const { attacker, defender, strikes, info, startHp } = opts;
  const left = attacker.team === 'enemy' ? attacker : defender;
  const right = left === attacker ? defender : attacker;
  const w = worldDef(opts.world);

  const fighter = (u: Unit, side: 'left' | 'right') => {
    const art = artFor(portraitIdOf(u), u.uid);
    const body = art
      ? `<img class="cine-art" src="art/${esc(art)}.png" alt="" draggable="false">`
      : `<div class="cine-token">${token(u, 170)}</div>`;
    const i = info[u.uid];
    const max = u.stats.hp;
    const hp = startHp[u.uid] ?? u.hp;
    return `
      <div class="cine-fighter ${side} ${u.team}${u.size > 1 ? ' big' : ''}" data-uid="${u.uid}">
        <div class="cine-body">${body}</div>
        <div class="cine-plate">
          <div class="cine-name"><b>${esc(u.name)}</b> <span>Lv ${u.level}</span></div>
          <div class="cine-weapon">${esc(i?.weapon ?? '')}</div>
          <div class="cine-hp"><span class="cine-hpnum">${hp}</span><div class="cine-hpbar"><div class="cine-hpfill" style="width:${(hp / max) * 100}%"></div></div></div>
          <div class="cine-stats"><span>HIT <b>${i?.hit ?? '–'}</b></span><span>DMG <b>${i?.dmg ?? '–'}</b></span><span>CRT <b>${i?.crit ?? '–'}</b></span></div>
        </div>
      </div>`;
  };

  const el = document.createElement('div');
  el.className = 'cine';
  el.style.setProperty('--wc', w.color);
  el.style.setProperty('--ground', w.terrainColors.plain);
  el.innerHTML = `
    <div class="cine-stage">
      <div class="cine-sky"></div>
      <div class="cine-ground"></div>
      ${fighter(left, 'left')}
      ${fighter(right, 'right')}
      <div class="cine-flash"></div>
      <div class="cine-banner"></div>
    </div>
    <div class="cine-skip">Click to skip</div>`;
  document.body.appendChild(el);

  let skipping = false;
  el.addEventListener('click', () => { skipping = true; el.classList.add('skipping'); });
  const wait = (ms: number) => (skipping ? Promise.resolve() : new Promise<void>((r) => setTimeout(r, ms)));
  const anim = (node: Element | null, frames: Keyframe[], ms: number, easing = 'ease-out') =>
    node && !skipping ? node.animate(frames, { duration: ms, easing }).finished.then(() => undefined) : Promise.resolve();

  const f = (uid: string) => el.querySelector(`.cine-fighter[data-uid="${uid}"]`) as HTMLElement | null;
  const setHp = (uid: string, hp: number, max: number) => {
    const fe = f(uid);
    if (!fe) return;
    (fe.querySelector('.cine-hpnum') as HTMLElement).textContent = String(Math.max(0, hp));
    (fe.querySelector('.cine-hpfill') as HTMLElement).style.width = `${Math.max(0, (hp / max) * 100)}%`;
  };
  const pop = (uid: string, text: string, cls: string) => {
    const fe = f(uid);
    if (!fe || skipping) return;
    const n = document.createElement('div');
    n.className = `cine-pop ${cls}`;
    n.textContent = text;
    fe.appendChild(n);
    setTimeout(() => n.remove(), 900);
  };
  const banner = (text: string) => {
    const b = el.querySelector('.cine-banner') as HTMLElement;
    b.textContent = text;
    void anim(b, [{ opacity: 0, transform: 'scale(1.6)' }, { opacity: 1, transform: 'scale(1)', offset: 0.25 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], 700);
  };

  const run = async () => {
    await anim(el, [{ opacity: 0 }, { opacity: 1 }], 180);
    await wait(250);
    for (const s of strikes) {
      const by = f(s.by);
      const target = f(s.target);
      const fromLeft = by?.classList.contains('left');
      const dir = fromLeft ? 1 : -1;
      const byUnit = s.by === left.uid ? left : right;
      const tUnit = s.target === left.uid ? left : right;

      if (s.crit) {
        banner('CRITICAL!');
        await anim(by?.querySelector('.cine-body') ?? null, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)', filter: 'brightness(1.6)' }, { transform: 'scale(1)' }], 300);
      }
      // Lunge toward the opponent.
      const lunge = anim(by?.querySelector('.cine-body') ?? null, [
        { transform: 'translateX(0)' },
        { transform: `translateX(${dir * 38}vw)`, offset: 0.45 },
        { transform: `translateX(${dir * 38}vw)`, offset: 0.6 },
        { transform: 'translateX(0)' },
      ], 560, 'ease-in-out');
      await wait(250);

      if (s.hit) {
        const flash = el.querySelector('.cine-flash') as HTMLElement;
        void anim(flash, [{ opacity: s.crit ? 0.9 : 0.45 }, { opacity: 0 }], s.crit ? 320 : 180);
        void anim(target?.querySelector('.cine-body') ?? null, [
          { transform: 'translateX(0)', filter: 'brightness(3)' },
          { transform: `translateX(${dir * 14}px)` },
          { transform: `translateX(${-dir * 10}px)` },
          { transform: 'translateX(0)', filter: 'brightness(1)' },
        ], 260);
        if (s.crit) void anim(el.querySelector('.cine-stage'), [{ transform: 'translate(0,0)' }, { transform: 'translate(-8px,4px)' }, { transform: 'translate(6px,-4px)' }, { transform: 'translate(0,0)' }], 260);
        pop(s.target, String(s.dmg), s.crit ? 'crit' : 'dmg');
        setHp(s.target, s.targetHp, tUnit.stats.hp);
      } else {
        void anim(target?.querySelector('.cine-body') ?? null, [
          { transform: 'translateX(0)' },
          { transform: `translateX(${dir * 60}px)`, offset: 0.4 },
          { transform: 'translateX(0)' },
        ], 380);
        pop(s.target, 'MISS', 'miss');
      }
      if (s.heal) {
        pop(s.by, `+${s.heal}`, 'heal');
        setHp(s.by, s.byHp, byUnit.stats.hp);
      }
      if (s.blocked) setTimeout(() => pop(s.target, 'BLOCK', 'miss'), 120);
      if (s.saved) banner(s.saved === 'fairy' ? 'A FAIRY REVIVES THEM!' : 'TRIFORCE OF COURAGE!');
      await lunge;
      if (s.killed) {
        await anim(target, [{ opacity: 1, filter: 'brightness(1)' }, { opacity: 1, filter: 'brightness(4)', offset: 0.2 }, { opacity: 0, transform: 'translateY(30px)', filter: 'brightness(1)' }], 650, 'ease-in');
        if (target) target.style.opacity = '0';
      }
      await wait(220);
    }
    await wait(450);
    await anim(el, [{ opacity: 1 }, { opacity: 0 }], 200);
  };

  return run().finally(() => el.remove());
}
