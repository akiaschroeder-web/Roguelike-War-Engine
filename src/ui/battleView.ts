import { ABILITIES, BOSSES, CLASSES, ITEMS, terrainLook, worldDef } from '../data/registry';
import { canRide, effectiveStats, hasEffect, isMounted, mountOf } from '../engine/units';
import { enemyAutoTransform, abilityRadius, abilityTargets, castAbility, castableAbilities, costLabel, knownAbilities, needsTarget, needsTile, unusableReason, abilityTiles } from '../engine/abilities';
import { STATUS_INFO } from '../engine/status';
import { canUse, canUseHere, isTargeted, targetTiles, useItem } from '../engine/items';
import { adjacentMailboxes, environmentPhase, isSeen, openMailbox, pressInversion, revealNearby, triggerTraps, visibleTiles } from '../engine/field';
import { planAction } from '../engine/ai';
import { syncPosition } from '../engine/windwaker';
import { enemyUnload, windLabel } from '../engine/naval';
import { sideQuestText } from '../engine/run';
import { adjacentCaptives, checkResult, freeCaptive, mountToggleBlocked, moveUnit, toggleMount, objectiveText, spawnReinforcements, startPhase, type TurnStartEvent } from '../engine/battle';
import {
  attackMods, attackWeapons, findInterceptor, forecast, healAmount, healWeapons, maxAttackRange, resolveCombat, resolveHeal, weaponDef,
  type Forecast, type LevelUp,
  type Strike,
} from '../engine/combat';
import { computeMoves, footprint, keyOf, posOf, terrainAt, tilesInRange, unitAt, unitDist, type Moves } from '../engine/grid';
import { RNG } from '../engine/rng';
import { audioSettings, setAudio, sfx } from './audio';
import { issueOrder, ORDERS, orderTargets, orderUnusable } from '../engine/army';
import { TERRAIN_BONUS } from '../engine/rules';
import type { RunWithEvent } from '../engine/run';
import type { Battle, OrderId, Pos, Unit } from '../engine/types';
import { animationsEnabled, playCinematic, setAnimationsEnabled, type SideInfo } from './cinematic';
import { ABILITY_ICONS, esc, hpBar, modal, showLevelUps, sleep, token, unitDetails, weaponLine } from './components';

type Mode = 'orders' | 'orderTarget' | 'idle' | 'select' | 'action' | 'attack' | 'heal' | 'items' | 'itemTarget' | 'magic' | 'abilityTarget' | 'abilityTile' | 'canto' | 'busy' | 'over';

const TERRAIN_GLYPH: Record<string, string> = {
  plain: '', forest: '♣', mountain: '▲', water: '≈', wall: '▦', fort: '⌂', lava: '♨',
  cracked: '▤', timeBlock: '⧗', timeGap: '·', bridge: '═',
  dekuFlower: '✿', goldFlower: '❀', owlStatue: '🦉', poisonWater: '≈', frozenMech: '❄', rollingRamp: '◢',
  current: '➶', waterwheel: '⚙', sunBlock: '☀', weightedSwitch: '⊙', inversionSwitch: '⇅', mailbox: '📬',
  whirlpool: '🌀', updraft: '⇡', ropeSwing: '〰', grapplePost: '⚲', hangingVine: '⌇', plantingSoil: '⁘', grownTree: '🌳',
  shipDeck: '▭', boardingPoint: '⚓', cannonEmplacement: '💣', submergedTreasure: '✦', sandVortex: '◎', spikedBarrel: '✸',
  watchtower: '♜', searchlight: '🔦', commandStatue: '🗿',
};

export class BattleView {
  private b: Battle;
  private mode: Mode = 'idle';
  private sel: Unit | null = null;
  private origin: Pos | null = null;
  private moves: Moves | null = null;
  private pending: Unit | null = null;
  private weaponChoice: string | null = null;
  private itemIndex: number | null = null;
  private arrowChoice: string | null = null;
  private abilityId: string | null = null;
  private hover: Pos | null = null;
  private inspect = new Set<string>();
  private showDanger = false;
  private tile = 48;
  private unitEls = new Map<string, HTMLElement>();
  private tileEls: HTMLElement[] = [];
  private log: string[] = [];
  private els!: {
    board: HTMLElement; tiles: HTMLElement; units: HTMLElement; panel: HTMLElement;
    actions: HTMLElement; header: HTMLElement; logEl: HTMLElement; wrap: HTMLElement;
  };
  private onKey = (e: KeyboardEvent) => this.handleKey(e);
  private dungeon?: { floor: number; of: number };
  private tileSig = '';
  private suppressClick = false;
  private orderId: OrderId | null = null;
  private subPhase: 'allied' | 'environment' | null = null;
  private get phaseLabel(): string {
    return this.subPhase === 'allied' ? 'Allied' : this.subPhase === 'environment' ? 'Environment' : this.b.phase === 'player' ? 'Player' : 'Enemy';
  }
  private get phaseCls(): string {
    return this.subPhase ?? this.b.phase;
  }
  private onResize = () => { this.layout(); this.renderUnits(); };

  constructor(
    private root: HTMLElement,
    run: RunWithEvent,
    private save: () => void,
    private onDone: (result: 'won' | 'lost') => void,
  ) {
    this.b = run.battle!;
    this.dungeon = run.dungeon;
  }

  async mount() {
    const w = worldDef(this.b.world);
    this.root.innerHTML = `
      <div class="battle" style="--wc:${w.color}">
        <header class="battle-header"></header>
        <div class="battle-main">
          <div class="board-wrap"><div class="board"><div class="tiles"></div><div class="units"></div></div></div>
          <aside class="side"><div class="actions"></div><div class="panel"></div><div class="log"></div></aside>
        </div>
      </div>`;
    const q = (s: string) => this.root.querySelector(s) as HTMLElement;
    this.els = {
      board: q('.board'), tiles: q('.tiles'), units: q('.units'), panel: q('.panel'),
      actions: q('.actions'), header: q('.battle-header'), logEl: q('.log'), wrap: q('.board-wrap'),
    };
    this.buildTiles();
    this.layout();
    this.bind();
    this.renderAll();
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.onResize);

    if (this.b.nodeType === 'ambush' && !this.b.ambushed && this.b.turn === 1) {
      await this.intro();
      this.b.ambushed = true;
      await this.banner('Ambush! The enemy strikes first', 'enemy');
      await this.enemyPhase(true);
    } else if (this.b.turn === 1 && this.b.phase === 'player' && !this.b.units.some((u) => u.moved || u.acted)) {
      await this.intro();
      await this.banner('Player Phase', 'player');
    } else if (this.b.phase === 'enemy') {
      await this.enemyPhase();
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.onResize);
  }

  // ───────────────────────── Layout & rendering ─────────────────────────

  private buildTiles() {
    const { b } = this;
    this.tileSig = b.tiles.join();
    this.els.tiles.style.gridTemplateColumns = `repeat(${b.width}, var(--t))`;
    this.els.tiles.innerHTML = b.tiles.map((t, i) => {
      const { x, y } = posOf(b, i);
      return `<div class="tile t-${t} ${(x + y) % 2 ? 'odd' : ''}" data-x="${x}" data-y="${y}" style="--tc:${terrainLook(b.world, t).color}"><span class="tg">${TERRAIN_GLYPH[t]}</span></div>`;
    }).join('');
    this.tileEls = [...this.els.tiles.children] as HTMLElement[];
  }

  private layout() {
    const availW = this.els.wrap.clientWidth - 8;
    const availH = Math.max(320, window.innerHeight - 140);
    // Fit the map when possible; big maps keep readable tiles and scroll/drag instead.
    this.tile = Math.max(34, Math.min(60, Math.floor(Math.min(availW / this.b.width, availH / this.b.height))));
    this.els.board.style.setProperty('--t', `${this.tile}px`);
    this.els.board.style.width = `${this.tile * this.b.width}px`;
    this.els.board.style.height = `${this.tile * this.b.height}px`;
  }

  private renderAll() {
    this.renderHeader();
    this.renderUnits();
    this.renderOverlay();
    this.renderPanel();
    this.renderActions();
    this.renderLog();
  }

  private renderHeader() {
    const { b } = this;
    const w = worldDef(b.world);
    const enemies = b.units.filter((u) => u.team === 'enemy').length;
    const o = b.objective;
    const progress = o.type === 'survive' || o.type === 'defend' ? ` (${Math.min(b.turn, o.turns!)}/${o.turns})`
      : o.type === 'capture' ? ` (${o.tiles!.filter((t) => b.units.some((u) => u.team === 'player' && t.x >= u.x && t.x < u.x + u.size && t.y >= u.y && t.y < u.y + u.size)).length}/${o.need})` : '';
    const base = { elite: 'Elite battle', boss: 'Regional boss', ambush: 'Ambush', siege: 'Siege' }[b.nodeType as string] ?? 'Battle';
    const kind = this.dungeon ? `Dungeon floor ${this.dungeon.floor}/${this.dungeon.of}${b.nodeType === 'elite' ? ' (guardian)' : ''}` : base;
    const sq = b.sideQuest ? `<span class="dim small">Side quest: ${esc(sideQuestText(b.sideQuest))} (${esc(sideReward(b.sideQuest))})</span>` : '';
    this.els.header.innerHTML = `
      <div class="bh-world"><b>${esc(w.name)}</b><span class="dim small">${esc(kind)}${b.forceName ? ` · vs ${esc(b.forceName)}` : ''}</span></div>
      <div class="bh-obj"><span class="dim small">Objective</span><b>${esc(objectiveText(b.objective))}${progress}</b>${sq}</div>
      <div class="bh-turn"><span class="dim small">Turn ${b.turn}</span><b class="phase ${this.phaseCls}">${this.phaseLabel} Phase</b></div>
      <div class="bh-count"><span class="dim small">Enemies</span><b>${b.fog || b.units.some((u) => u.hidden) ? `${b.units.filter((u) => u.team === 'enemy' && isSeen(b, u)).length} seen` : enemies}</b></div>
      ${b.weather ? `<div class="weather"><span class="dim small">Weather</span><b>${b.weather.kind === 'rain' ? '🌧 Rain' : '🌪 Sandstorm'} (${b.weather.turns})</b></div>` : ''}
      ${b.fog ? '<div class="weather"><span class="dim small">Visibility</span><b>🌫 Fog</b></div>' : ''}
      ${b.wind ? `<div class="weather" title="Ships sail faster with the wind (+2 MOV) and slower against it (−2)."><span class="dim small">Wind</span><b>${esc(windLabel(b.wind))}</b></div>` : ''}
      ${b.night && b.naval ? '<div class="weather"><span class="dim small">Time</span><b>☾ Night</b></div>' : ''}`;
  }

  private posStyle(el: HTMLElement, x: number, y: number) {
    el.style.setProperty('--x', String(x));
    el.style.setProperty('--y', String(y));
  }

  private renderUnits() {
    const alive = new Set(this.b.units.map((u) => u.uid));
    for (const [uid, el] of this.unitEls) {
      if (!alive.has(uid)) { el.remove(); this.unitEls.delete(uid); }
    }
    for (const u of this.b.units) {
      let el = this.unitEls.get(u.uid);
      if (!el) {
        el = document.createElement('div');
        el.className = 'unit';
        this.els.units.appendChild(el);
        this.unitEls.set(u.uid, el);
      }
      this.posStyle(el, u.x, u.y);
      el.style.setProperty('--s', String(u.size));
      el.classList.toggle('acted', u.team === 'player' && u.acted && this.b.phase === 'player');
      el.classList.toggle('selected', this.sel === u);
      el.classList.toggle('enemy', u.team === 'enemy');
      el.classList.toggle('ally', !!u.npc);
      el.classList.toggle('captive', !!u.captive);
      el.classList.toggle('unseen', !isSeen(this.b, u));
      el.classList.toggle('big', u.size > 1);
      el.innerHTML = `<div class="u-body">${token(u, Math.round(this.tile * u.size * (u.size > 1 ? 0.86 : 0.78)))}</div>${hpBar(u.hp, u.stats.hp)}${u.statuses.length ? `<i class="stun-mark">${u.statuses.map((st) => STATUS_INFO[st.kind].icon).join('')}</i>` : ''}${isMounted(u) && !CLASSES_MOUNTED(u) ? '<i class="mount-mark">🐎</i>' : ''}${u.vip ? '<i class="vip-mark">VIP</i>' : u.captive ? '<i class="vip-mark">⛓</i>' : ''}${u.cargo?.length ? `<i class="vip-mark" title="${esc(u.cargo.map((p) => p.name).join(', '))}">⛵${u.cargo.length}</i>` : ''}${u.damaged && Object.keys(u.damaged).length ? '<i class="mount-mark" title="Damaged">🔧</i>' : ''}`;
      el.classList.toggle('barrier', u.buffs.some((x) => x.barrier));
    }
  }

  private setHpBar(uid: string, hp: number, max: number) {
    const bar = this.unitEls.get(uid)?.querySelector('.hpbar');
    if (bar) bar.outerHTML = hpBar(hp, max);
  }

  /** Footprint tiles the unit can move over, and tiles it could attack/heal. */
  private threatTiles(u: Unit, moves?: Moves, staff = false): { move: Set<number>; hit: Set<number> } {
    const m = moves ?? computeMoves(this.b, u, u.ai === 'stationary' ? 0 : undefined);
    const range = staff
      ? (() => { const ws = healWeapons(u, 1).concat(healWeapons(u, 2), healWeapons(u, 3), healWeapons(u, 4)); return ws.length ? { min: 1, max: Math.max(...ws.map((w) => w.maxRange)) } : null; })()
      : maxAttackRange(u);
    const move = new Set<number>();
    const hit = new Set<number>();
    for (const k of m.reach.keys()) {
      const p = posOf(this.b, k);
      for (const f of footprint(p.x, p.y, u.size)) move.add(keyOf(this.b, f.x, f.y));
      if (range) for (const t of tilesInRange(this.b, p, range.min, range.max, u.size)) hit.add(keyOf(this.b, t.x, t.y));
    }
    for (const k of move) hit.delete(k);
    return { move, hit };
  }

  /** Reachable anchor whose footprint covers the tile (cheapest first). */
  private anchorFor(p: Pos): number | null {
    if (!this.sel || !this.moves) return null;
    let best: number | null = null;
    let bestCost = Infinity;
    for (const [k, info] of this.moves.reach) {
      const a = posOf(this.b, k);
      if (p.x >= a.x && p.y >= a.y && p.x < a.x + this.sel.size && p.y < a.y + this.sel.size && info.cost < bestCost) {
        best = k;
        bestCost = info.cost;
      }
    }
    return best;
  }

  private renderOverlay() {
    const { b } = this;
    if (b.tiles.join() !== this.tileSig) { this.buildTiles(); this.layout(); }
    const cls: string[][] = b.tiles.map(() => []);
    const add = (k: number, c: string) => cls[k].push(c);

    const objCls = { seize: 'obj-seize', defend: 'obj-defend', escape: 'obj-exit', escort: 'obj-exit', capture: 'obj-cap' }[b.objective.type as string];
    const seen = visibleTiles(b);
    if (seen) b.tiles.forEach((_, k) => { if (!seen.has(k)) add(k, 'fog'); });
    for (const f of b.fires ?? []) add(keyOf(b, f.x, f.y), 'fire');
    for (const d of b.dropped ?? []) add(keyOf(b, d.x, d.y), 'dropped');
    for (const sp of b.sprouts ?? []) add(keyOf(b, sp.x, sp.y), 'sprout');
    for (const t of b.traps ?? []) if (!t.hidden) add(keyOf(b, t.x, t.y), 'trap');
    if (b.units.some((u) => u.team === 'player' && u.skills.includes('graveyardShift'))) for (const d of b.digSpots ?? []) add(keyOf(b, d.x, d.y), 'digspot');
    if (objCls) for (const t of b.objective.tiles ?? []) add(keyOf(b, t.x, t.y), objCls);
    if (this.showDanger) {
      for (const e of b.units.filter((u) => u.team === 'enemy' && isSeen(b, u))) {
        const t = this.threatTiles(e);
        for (const k of [...t.move, ...t.hit]) add(k, 'danger');
      }
    }
    for (const uid of this.inspect) {
      const e = b.units.find((u) => u.uid === uid);
      if (!e) { this.inspect.delete(uid); continue; }
      const t = this.threatTiles(e);
      for (const k of t.move) add(k, 'emv');
      for (const k of t.hit) add(k, 'eatk');
    }
    if ((this.mode === 'select' || this.mode === 'canto') && this.sel && this.moves) {
      const staffOnly = !maxAttackRange(this.sel);
      const t = this.mode === 'canto' ? { move: this.threatTiles(this.sel, this.moves).move, hit: new Set<number>() } : this.threatTiles(this.sel, this.moves, staffOnly);
      for (const k of t.move) add(k, 'mv');
      for (const k of t.hit) add(k, staffOnly ? 'hl' : 'atk');
      if (this.hover) {
        const a = this.anchorFor(this.hover);
        if (a !== null) {
          for (const p of this.moves.path(a)) add(keyOf(b, p.x, p.y), 'path');
          const ap = posOf(b, a);
          for (const f of footprint(ap.x, ap.y, this.sel.size)) add(keyOf(b, f.x, f.y), 'ghost');
        }
      }
    }
    if ((this.mode === 'attack' || this.mode === 'heal') && this.sel) {
      for (const t of this.validTargets()) for (const f of footprint(t.x, t.y, t.size)) add(keyOf(b, f.x, f.y), this.mode === 'attack' ? 'tgt' : 'tgt hl');
      if (this.pending) for (const f of footprint(this.pending.x, this.pending.y, this.pending.size)) add(keyOf(b, f.x, f.y), 'pending');
    }
    if (this.mode === 'itemTarget' && this.sel && this.itemIndex !== null) {
      const def = ITEMS[this.sel.pack[this.itemIndex]?.id];
      if (def) {
        const tiles = targetTiles(b, this.sel, def);
        for (const t of tiles) add(keyOf(b, t.x, t.y), def.kind === 'stun' ? 'hl' : 'atk');
        if (this.hover && tiles.some((t) => t.x === this.hover!.x && t.y === this.hover!.y)) {
          for (const t of tilesInRange(b, this.hover, 0, def.radius ?? 0)) add(keyOf(b, t.x, t.y), 'pending');
        }
      }
    }
    if (this.mode === 'orderTarget' && this.orderId) {
      for (const t of orderTargets(b, this.orderId)) if (t.x >= 0) for (const f of footprint(t.x, t.y, t.size)) add(keyOf(b, f.x, f.y), ORDERS[this.orderId].target === 'enemy' ? 'tgt' : 'tgt hl');
    }
    if (this.mode === 'abilityTarget' && this.sel && this.abilityId) {
      for (const t of abilityTargets(b, this.sel, ABILITIES[this.abilityId])) for (const f of footprint(t.x, t.y, t.size)) add(keyOf(b, f.x, f.y), 'tgt hl');
    }
    if (this.mode === 'abilityTile' && this.sel && this.abilityId) {
      for (const t of abilityTiles(b, this.sel, ABILITIES[this.abilityId])) add(keyOf(b, t.x, t.y), 'area');
      if (this.hover) add(keyOf(b, this.hover.x, this.hover.y), 'pending');
    }
    if (this.mode === 'magic' && this.sel && this.abilityId) {
      const r = abilityRadius(ABILITIES[this.abilityId]);
      if (r) for (const t of tilesInRange(b, this.sel, 1, r, this.sel.size)) add(keyOf(b, t.x, t.y), ABILITIES[this.abilityId].id === 'dinsFire' ? 'atk' : 'area');
    }
    if (this.sel?.faroreMark && (this.mode === 'magic' || this.mode === 'action')) add(keyOf(b, this.sel.faroreMark.x, this.sel.faroreMark.y), 'pending');
    if (this.sel) for (const f of footprint(this.sel.x, this.sel.y, this.sel.size)) add(keyOf(b, f.x, f.y), 'sel');
    if (this.hover) add(keyOf(b, this.hover.x, this.hover.y), 'hov');

    this.tileEls.forEach((el, i) => {
      const base = el.className.split(' ').filter((c) => c === 'tile' || c.startsWith('t-') || c === 'odd');
      el.className = [...base, ...cls[i].join(' ').split(' ').filter(Boolean)].join(' ');
    });
  }

  private renderPanel() {
    const { b } = this;
    let html = '';
    if (this.mode === 'attack' && this.sel && this.pending) {
      html = this.forecastHtml(forecast(b, this.sel, this.sel, this.pending, this.weaponChoice ?? undefined, this.arrowChoice ?? undefined));
    } else if (this.mode === 'heal' && this.sel && this.pending) {
      html = this.healHtml(this.sel, this.pending);
    } else if (this.mode === 'orders' || this.mode === 'orderTarget') {
      html = this.ordersHtml();
    } else if ((this.mode === 'items' || this.mode === 'itemTarget') && this.sel) {
      html = this.itemsHtml(this.sel);
    } else if ((this.mode === 'magic' || this.mode === 'abilityTarget' || this.mode === 'abilityTile') && this.sel) {
      html = this.magicHtml(this.sel);
    } else {
      const u = (this.hover ? unitAt(b, this.hover.x, this.hover.y) : undefined) ?? this.sel ?? undefined;
      html = u ? unitDetails(u) : `<div class="dim small help">
        <p><b>Tap a unit</b> to select it. Blue shows where it can move; red shows what it can hit.</p>
        <p>Tap an <b>enemy</b> to see its threat range. Swords beat axes, axes beat lances, lances beat swords.</p>
        <p>Large units fill several squares. Lava burns anyone but Gorons and fliers.</p>
        <p class="kbd">Esc cancel · E end turn · D danger zone</p></div>`;
    }
    if (this.hover) {
      const t = terrainAt(b, this.hover.x, this.hover.y);
      const tb = TERRAIN_BONUS[t];
      const note = t === 'wall' ? 'Impassable'
        : t === 'water' ? `Only ${b.naval ? 'ships, ' : ''}fliers and swimmers can enter`
        : t === 'lava' ? 'Burns 20% max HP per turn (Gorons and fliers are immune)'
        : WW_TERRAIN_NOTES[t] ?? `Avoid +${tb.avoid} · Def +${tb.def}${tb.heal ? ` · Heals ${tb.heal}%` : ''}`;
      html += `<div class="terrain-info"><b>${esc(terrainLook(b.world, t).name)}</b> <span class="dim small">${note}</span></div>`;
    }
    this.els.panel.innerHTML = html;
  }

  private forecastHtml(fc: Forecast): string {
    const a = this.b.units.find((u) => u.uid === fc.attacker.uid)!;
    const d = this.b.units.find((u) => u.uid === fc.defender.uid)!;
    const options = attackWeapons(a, fc.distance);
    const side = (u: Unit, s: Forecast['attacker'], other: Unit) => {
      const after = Math.max(0, other.hp - (s.canAttack ? s.dmg * s.attacks : 0));
      const wName = (weaponDef(s.weaponId)?.name ?? u.weapons.map((id) => weaponDef(id)?.name).find(Boolean) ?? 'Unarmed') + (s.arrowId ? ` + ${ABILITIES[s.arrowId].name}` : '');
      return `
      <div class="fc-side ${u.team}">
        <div class="fc-who">${token(u, 34)}<div><b>${esc(u.name)}</b><div class="dim small">${esc(wName)}${
          s.triangle === 1 ? ' <span class="up">▲</span>' : s.triangle === -1 ? ' <span class="down">▼</span>' : ''}${s.effective ? ' <span class="up">×2</span>' : ''}</div></div></div>
        <div class="fc-hp">HP ${u.hp}</div>
        ${s.canAttack ? `
          <div class="fc-row"><span>Dmg</span><b>${s.dmg}${s.attacks > 1 ? ` ×${s.attacks}` : ''}</b></div>
          <div class="fc-row"><span>Hit</span><b>${s.hit}%</b></div>
          <div class="fc-row"><span>Crit</span><b>${s.crit}%</b></div>
          ${s.block ? `<div class="fc-row dim small"><span>Foe blocks</span><b>${s.block}%</b></div>` : ''}
          <div class="fc-row dim small"><span>Foe HP after</span><b>${after}${after === 0 ? ' ☠' : ''}</b></div>`
        : '<div class="fc-none">Cannot counter</div>'}
      </div>`;
    };
    const arrows = attackMods(a, weaponDef(fc.attacker.weaponId));
    const switcher = (options.length > 1
      ? `<div class="weapon-switch">${options.map((w) => `<button class="btn small ${w.id === fc.attacker.weaponId ? 'on' : ''}" data-act="weapon" data-w="${w.id}">${esc(w.name)}</button>`).join('')}</div>` : '')
      + (arrows.length
        ? `<div class="weapon-switch"><button class="btn small ${!fc.attacker.arrowId ? 'on' : ''}" data-act="arrow" data-a="">Normal</button>${arrows.map((ar) => `<button class="btn small ${ar.id === fc.attacker.arrowId ? 'on' : ''}" data-act="arrow" data-a="${ar.id}" title="${esc(ar.desc)}">${esc(ar.name)} (${ar.sta ? `${ar.sta} STA` : `${ar.mp} MP`})</button>`).join('')}</div>` : '');
    return `<div class="forecast"><div class="fc-title">Combat Forecast</div>${switcher}<div class="fc-cols">${side(a, fc.attacker, d)}${side(d, fc.defender, a)}</div>
      <button class="btn primary wide" data-act="confirm">Attack ${esc(d.name)}</button></div>`;
  }

  private ordersHtml(): string {
    const { b } = this;
    if (this.mode === 'orderTarget' && this.orderId === 'reinforce') {
      return `<div class="forecast"><div class="fc-title">Reinforce: choose a unit</div><div class="item-list">${(b.reserves ?? []).map((u) => `
        <button class="item-row" data-act="ordertarget" data-uid="${u.uid}"><b>${token(u, 24)} ${esc(u.name)}</b><span class="dim small">Lv ${u.level} · HP ${u.hp}/${u.stats.hp}</span></button>`).join('')}</div></div>`;
    }
    const rows = (b.orders ?? []).map((id) => {
      const d = ORDERS[id];
      const why = orderUnusable(b, id);
      return `<button class="item-row ${this.orderId === id ? 'on' : ''}" data-act="order" data-id="${id}" ${why ? 'disabled' : ''}>
        <b>⚑ ${esc(d.name)} <span class="dim">${d.cp} CP</span></b><span class="dim small">${esc(d.desc)}${why ? ` <i>(${esc(why)})</i>` : ''}</span></button>`;
    }).join('');
    const hint = this.mode === 'orderTarget' ? `<p class="small">Tap a highlighted ${ORDERS[this.orderId!].target === 'enemy' ? 'enemy' : 'ally'}.</p>` : '';
    return `<div class="forecast"><div class="fc-title">Orders · ${b.cp ?? 0}/${b.cpMax ?? 0} CP · Morale ${b.morale ?? 50}</div>${hint}<div class="item-list">${rows}</div></div>`;
  }

  private async giveOrder(id: OrderId, targetUid?: string) {
    const text = issueOrder(this.b, id, targetUid);
    if (!text) return;
    this.addLog(`⚑ <b>${esc(ORDERS[id].name)}</b>: ${esc(text)}`);
    await this.banner(ORDERS[id].name, 'player');
    this.mode = 'idle';
    this.orderId = null;
    this.save();
    this.renderAll();
  }

  private magicHtml(u: Unit): string {
    const defs = menuAbilities(u);
    const rows = defs.map((d) => {
      const why = unusableReason(this.b, u, d);
      const on = this.abilityId === d.id;
      const label = d.id === 'faroresWind' && u.faroreMark ? "Farore's Wind (return)" : d.name;
      return `<button class="item-row ${on ? 'on' : ''}" data-act="cast" data-id="${d.id}" ${why ? 'disabled' : ''}>
        <b>${ABILITY_ICONS[d.kind]} ${esc(label)} <span class="dim">${costLabel(u, d)}</span></b>
        <span class="dim small">${esc(d.desc)}${why ? ` <i>(${esc(why)})</i>` : ''}</span></button>`;
    }).join('');
    const hint = this.mode === 'abilityTarget' ? '<p class="small">Tap a highlighted ally.</p>'
      : this.mode === 'abilityTile' ? '<p class="small">Tap a highlighted square.</p>'
      : this.abilityId ? '<p class="small">Tap the highlighted spell again to cast it.</p>' : '';
    return `<div class="forecast"><div class="fc-title">Abilities · MP ${u.mp}/${u.stats.mp} · STA ${u.sta}/${u.stats.sta}</div>${hint}<div class="item-list">${rows}</div></div>`;
  }

  private itemsHtml(u: Unit): string {
    const rows = u.pack.map((p, i) => {
      const def = ITEMS[p.id];
      const usable = canUseHere(this.b, u, i);
      const on = this.mode === 'itemTarget' && this.itemIndex === i;
      return `<button class="item-row ${on ? 'on' : ''}" data-act="useitem" data-i="${i}" ${usable ? '' : 'disabled'}>
        <b>${esc(def?.name ?? p.id)}${p.uses > 1 ? ` ×${p.uses}` : ''}</b><span class="dim small">${esc(def?.desc ?? '')}${
          def?.kind === 'fairy' ? '' : !usable ? (canUse(u, i) ? ' (can’t use it here)' : def?.kind === 'cure' ? ' (nothing to cure)' : ' (not needed right now)') : ''}</span></button>`;
    }).join('');
    const hint = this.mode === 'itemTarget' ? '<p class="small">Tap a highlighted square to throw it. The blast area is shown in gold.</p>' : '';
    return `<div class="forecast"><div class="fc-title">Pack</div>${hint}<div class="item-list">${rows}</div></div>`;
  }

  private healHtml(healer: Unit, t: Unit): string {
    const staff = healWeapons(healer, unitDist(healer, t))[0];
    const amt = staff ? Math.min(healAmount(this.b, healer, staff), t.stats.hp - t.hp) : 0;
    return `<div class="forecast"><div class="fc-title">Heal</div>
      <div class="fc-who">${token(t, 34)}<div><b>${esc(t.name)}</b><div class="dim small">HP ${t.hp} → ${t.hp + amt} / ${t.stats.hp}</div></div></div>
      ${staff ? `<div class="small">${weaponLine(staff)}</div>` : ''}
      <button class="btn primary wide" data-act="confirm">Heal ${esc(t.name)} (+${amt})</button></div>`;
  }

  private renderActions() {
    const m = this.mode;
    let html = '';
    if (m === 'idle') {
      const ready = this.b.units.filter((u) => u.team === 'player' && !u.npc && !u.acted).length;
      html = `<button class="btn primary" data-act="end">End Turn <span class="dim">(${ready} ready)</span></button>
        ${this.b.orders?.length ? `<button class="btn" data-act="orders">⚑ Orders <span class="dim">${this.b.cp ?? 0}/${this.b.cpMax ?? 0} CP</span></button>` : ''}
        <button class="btn ${this.showDanger ? 'on' : ''}" data-act="danger">Danger Zone</button>
        <button class="btn small" data-act="anims" title="Battle animations">🎬 ${animationsEnabled() ? 'On' : 'Off'}</button>
        <button class="btn small" data-act="mute" title="Sound">${audioSettings().muted ? '🔇' : '🔊'}</button>`;
    } else if (m === 'select') {
      const sel = this.sel;
      const mountBtn = sel && mountOf(sel) && canRide(sel)
        ? (() => { const why = mountToggleBlocked(this.b, sel); return `<button class="btn" data-act="mount" ${why ? `disabled title="${esc(why)}"` : ''}>🐎 ${sel.mounted === false ? 'Mount' : 'Dismount'}</button>`; })() : '';
      html = `<button class="btn" data-act="cancel">Cancel</button>${mountBtn}<span class="dim small">Choose a destination, or tap the unit to stay put.</span>`;
    } else if (m === 'action' && this.sel) {
      html = `
        ${this.attackTargets(this.sel).length ? '<button class="btn primary" data-act="attack">Attack</button>' : ''}
        ${this.healTargets(this.sel).length ? '<button class="btn primary" data-act="heal">Heal</button>' : ''}
        ${menuAbilities(this.sel).some((d) => d.implemented) ? `<button class="btn" data-act="magic" ${castableAbilities(this.b, this.sel).filter((d) => !d.contextual).length ? '' : 'disabled'}>Abilities</button>` : ''}
        ${adjacentCaptives(this.b, this.sel).length ? '<button class="btn primary" data-act="free">Free Prisoner</button>' : ''}
        ${knownAbilities(this.sel).filter((d) => d.contextual && !unusableReason(this.b, this.sel!, d)).map((d) => `<button class="btn" data-act="cast" data-id="${d.id}" title="${esc(d.desc)}">${d.icon ?? ''} ${esc(d.id === 'disembark' && this.sel!.cargo?.[0] ? `Disembark ${this.sel!.cargo[0].name}` : d.name)}</button>`).join('')}
        ${adjacentMailboxes(this.b, this.sel).length ? '<button class="btn" data-act="mail">📬 Check Mailbox</button>' : ''}
        ${this.sel.pack.some((_, i) => canUseHere(this.b, this.sel!, i)) ? '<button class="btn" data-act="items">Item</button>' : ''}
        <button class="btn" data-act="wait">Wait</button>
        <button class="btn" data-act="undo">Undo Move</button>`;
    } else if (m === 'attack' || m === 'heal') {
      html = `<button class="btn" data-act="back">Back</button><span class="dim small">Pick a ${m === 'attack' ? 'target' : 'wounded ally'}.</span>`;
    } else if (m === 'magic' || m === 'abilityTarget' || m === 'abilityTile') {
      html = `<button class="btn" data-act="back">Back</button><span class="dim small">Using an ability ends this unit's turn.</span>`;
    } else if (m === 'items' || m === 'itemTarget') {
      html = `<button class="btn" data-act="back">Back</button><span class="dim small">${m === 'items' ? 'Choose an item. Using one ends this unit\'s turn.' : 'Choose where to throw it.'}</span>`;
    } else if (m === 'canto') {
      html = `<button class="btn primary" data-act="stay">Stay</button><span class="dim small">${this.sel && hasEffect(this.sel, 'canto') && !this.sel.skills.includes('vanishingAct') ? 'Epona: use your leftover movement.' : 'Vanishing Act: move up to 3 more spaces.'}</span>`;
    } else if (m === 'orders' || m === 'orderTarget') {
      html = `<button class="btn" data-act="back">Back</button><span class="dim small">${m === 'orders' ? 'Orders don’t use up anyone’s turn.' : 'Pick a target for the order.'}</span>`;
    } else if (m === 'busy') {
      html = `<span class="dim small">${this.b.phase === 'enemy' ? 'Enemy is moving…' : '…'}</span>`;
    }
    this.els.actions.innerHTML = html;
  }

  private renderLog() {
    this.els.logEl.innerHTML = this.log.slice(-6).map((l) => `<div>${l}</div>`).join('');
    this.els.logEl.scrollTop = this.els.logEl.scrollHeight;
  }

  private addLog(line: string) {
    this.log.push(line);
    this.renderLog();
  }

  // ───────────────────────── Input ─────────────────────────

  private bind() {
    // Drag to pan large maps (mouse); touch scrolls natively.
    const wrap = this.els.wrap;
    let drag: { x: number; y: number; sl: number; st: number; moved: boolean } | null = null;
    wrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, sl: wrap.scrollLeft, st: wrap.scrollTop, moved: false };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      drag.moved = true;
      wrap.classList.add('dragging');
      wrap.scrollLeft = drag.sl - dx;
      wrap.scrollTop = drag.st - dy;
    });
    window.addEventListener('pointerup', () => {
      if (drag?.moved) { this.suppressClick = true; setTimeout(() => (this.suppressClick = false), 0); }
      drag = null;
      wrap.classList.remove('dragging');
    });

    const tileFrom = (e: Event): Pos | null => {
      const el = (e.target as HTMLElement).closest('.tile') as HTMLElement | null;
      return el ? { x: Number(el.dataset.x), y: Number(el.dataset.y) } : null;
    };
    this.els.tiles.addEventListener('pointermove', (e) => {
      const p = tileFrom(e);
      if (!p || (this.hover && p.x === this.hover.x && p.y === this.hover.y)) return;
      this.hover = p;
      this.renderOverlay();
      this.renderPanel();
    });
    this.els.tiles.addEventListener('pointerleave', () => {
      this.hover = null;
      this.renderOverlay();
      this.renderPanel();
    });
    this.els.tiles.addEventListener('click', (e) => {
      if (this.suppressClick) return;
      const p = tileFrom(e);
      if (p) void this.clickTile(p);
    });
    this.els.tiles.addEventListener('contextmenu', (e) => { e.preventDefault(); this.cancel(); });
    this.root.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (btn) void this.action(btn.dataset.act!, btn);
    });
  }

  private handleKey(e: KeyboardEvent) {
    if (document.querySelector('.modal-backdrop')) return;
    if (e.key === 'Escape') this.cancel();
    else if ((e.key === 'e' || e.key === 'E') && this.mode === 'idle') void this.action('end');
    else if (e.key === 'd' || e.key === 'D') void this.action('danger');
  }

  private cancel() {
    switch (this.mode) {
      case 'select': this.deselect(); break;
      case 'action': void this.action('undo'); break;
      case 'attack': case 'heal': case 'items': case 'itemTarget': case 'magic': case 'abilityTarget': case 'abilityTile': void this.action('back'); break;
      case 'idle': this.inspect.clear(); this.renderAll(); break;
    }
  }

  private deselect() {
    if (this.sel) sfx('cancel');
    this.sel = null;
    this.moves = null;
    this.origin = null;
    this.pending = null;
    this.weaponChoice = null;
    this.mode = 'idle';
    this.renderAll();
  }

  private selectUnit(u: Unit) {
    sfx('select');
    this.sel = u;
    this.origin = { x: u.x, y: u.y };
    this.moves = computeMoves(this.b, u);
    this.mode = 'select';
  }

  private async clickTile(p: Pos) {
    const { b } = this;
    const u = unitAt(b, p.x, p.y);
    this.hover = p;

    if (this.mode === 'idle') {
      if (u && u.team === 'player' && !u.acted && !u.npc) this.selectUnit(u);
      else if (u && u.team === 'enemy' && isSeen(b, u)) {
        if (this.inspect.has(u.uid)) this.inspect.delete(u.uid);
        else this.inspect.add(u.uid);
      }
      this.renderAll();
      return;
    }

    if ((this.mode === 'select' || this.mode === 'canto') && this.sel && this.moves) {
      const a = this.anchorFor(p);
      if (a !== null && (!u || u === this.sel || this.mode === 'canto')) {
        await this.walk(this.sel, this.moves.path(a));
        this.afterMove(this.sel);
        if (this.mode === 'canto') { await this.finishUnit(this.sel); return; }
        this.mode = 'action';
        this.renderAll();
        return;
      }
      if (this.mode === 'canto') return;
      // Tap an enemy directly: move to the best tile in range and preview.
      if (u && u.team === 'enemy' && isSeen(b, u)) {
        const from = this.bestTileToAttack(this.sel, u);
        if (from) {
          await this.walk(this.sel, this.moves.path(keyOf(b, from.x, from.y)));
          this.afterMove(this.sel);
          this.mode = 'attack';
          this.pending = u;
          this.weaponChoice = null;
          this.renderAll();
          return;
        }
      }
      if (u && u.team === 'player' && !u.npc && !u.acted && u !== this.sel) {
        this.selectUnit(u);
        this.renderAll();
        return;
      }
      this.deselect();
      return;
    }

    if (this.mode === 'abilityTile' && this.sel && this.abilityId) {
      if (abilityTiles(b, this.sel, ABILITIES[this.abilityId]).some((t) => t.x === p.x && t.y === p.y)) await this.doCast(this.sel, this.abilityId, undefined, p);
      return;
    }

    if (this.mode === 'orderTarget' && this.orderId) {
      if (u && orderTargets(b, this.orderId).includes(u)) await this.giveOrder(this.orderId, u.uid);
      return;
    }

    if (this.mode === 'abilityTarget' && this.sel && this.abilityId) {
      if (u && abilityTargets(b, this.sel, ABILITIES[this.abilityId]).includes(u)) await this.doCast(this.sel, this.abilityId, u.uid);
      return;
    }

    if (this.mode === 'itemTarget' && this.sel && this.itemIndex !== null) {
      const def = ITEMS[this.sel.pack[this.itemIndex]?.id];
      if (def && targetTiles(b, this.sel, def).some((t) => t.x === p.x && t.y === p.y)) await this.doItem(this.sel, this.itemIndex, p);
      return;
    }

    if ((this.mode === 'attack' || this.mode === 'heal') && this.sel && u && this.validTargets().includes(u)) {
      if (this.pending === u) await this.action('confirm');
      else {
        this.pending = u;
        this.weaponChoice = null;
        this.renderAll();
      }
    }
  }

  private bestTileToAttack(unit: Unit, target: Unit): Pos | null {
    if (!this.moves) return null;
    let best: { p: Pos; score: number } | null = null;
    for (const [k, info] of this.moves.reach) {
      const p = posOf(this.b, k);
      const ws = attackWeapons(unit, unitDist(unit, target, p));
      if (!ws.length) continue;
      const fc = forecast(this.b, unit, p, target, ws[0].id);
      const tb = TERRAIN_BONUS[this.b.tiles[k]];
      const lava = this.b.tiles[k] === 'lava' ? 10 : 0;
      const score = -fc.defender.dmg * fc.defender.attacks * 2 + fc.attacker.dmg * fc.attacker.attacks + tb.avoid / 5 + tb.def - info.cost * 0.1 - lava;
      if (!best || score > best.score) best = { p, score };
    }
    return best?.p ?? null;
  }

  private attackTargets(u: Unit): Unit[] {
    return this.b.units.filter((t) => t.team !== u.team && isSeen(this.b, t) && attackWeapons(u, unitDist(u, t)).length > 0);
  }

  private healTargets(u: Unit): Unit[] {
    return this.b.units.filter((t) => t.team === u.team && t !== u && t.hp < t.stats.hp && healWeapons(u, unitDist(u, t)).length > 0);
  }

  private validTargets(): Unit[] {
    if (!this.sel) return [];
    return this.mode === 'attack' ? this.attackTargets(this.sel) : this.mode === 'heal' ? this.healTargets(this.sel) : [];
  }

  private async action(act: string, el?: HTMLElement) {
    const { b } = this;
    if (this.mode === 'busy' || this.mode === 'over') return;
    switch (act) {
      case 'end':
        if (this.mode === 'idle') await this.endTurn();
        return;
      case 'orders':
        if (this.mode === 'idle') { this.mode = 'orders'; this.orderId = null; this.renderAll(); }
        return;
      case 'order': {
        const id = el?.dataset.id as OrderId;
        if (!id || orderUnusable(b, id)) return;
        if (ORDERS[id].target) { this.orderId = id; this.mode = 'orderTarget'; this.renderAll(); }
        else await this.giveOrder(id);
        return;
      }
      case 'ordertarget':
        if (this.orderId && el?.dataset.uid) await this.giveOrder(this.orderId, el.dataset.uid);
        return;
      case 'mute':
        setAudio({ muted: !audioSettings().muted });
        this.renderActions();
        return;
      case 'anims':
        setAnimationsEnabled(!animationsEnabled());
        this.renderActions();
        return;
      case 'danger':
        this.showDanger = !this.showDanger;
        this.renderAll();
        return;
      case 'cancel':
        this.deselect();
        return;
      case 'undo':
        if (this.sel && this.origin) {
          this.sel.x = this.origin.x;
          this.sel.y = this.origin.y;
          this.sel.moved = false;
          this.sel.movedDist = 0;
          this.moves = computeMoves(b, this.sel);
          this.mode = 'select';
          this.pending = null;
          this.renderAll();
        }
        return;
      case 'attack':
      case 'heal': {
        this.mode = act;
        const targets = this.validTargets();
        this.pending = targets.length === 1 ? targets[0] : null;
        this.weaponChoice = null;
        this.renderAll();
        return;
      }
      case 'weapon':
        this.weaponChoice = el?.dataset.w ?? null;
        this.arrowChoice = null;
        this.renderPanel();
        return;
      case 'arrow':
        this.arrowChoice = el?.dataset.a || null;
        this.renderPanel();
        return;
      case 'mount':
        if (this.sel && this.mode === 'select' && toggleMount(b, this.sel)) {
          this.origin = { x: this.sel.x, y: this.sel.y };
          this.moves = computeMoves(b, this.sel);
          this.addLog(`${esc(this.sel.name)} ${this.sel.mounted ? 'mounts up' : 'dismounts'}.`);
          this.renderAll();
        }
        return;
      case 'magic':
        this.mode = 'magic';
        this.abilityId = null;
        this.renderAll();
        return;
      case 'cast': {
        const u = this.sel;
        const id = el?.dataset.id;
        const def = id ? ABILITIES[id] : undefined;
        if (!u || !def || unusableReason(b, u, def)) return;
        if (needsTile(def)) {
          this.mode = 'abilityTile';
          this.abilityId = id!;
          this.renderAll();
        } else if (needsTarget(def)) {
          this.mode = 'abilityTarget';
          this.abilityId = id!;
          this.renderAll();
        } else if (this.abilityId === id || !abilityRadius(def)) {
          await this.doCast(u, id!);
        } else {
          // First tap previews the area; second tap casts.
          this.abilityId = id!;
          this.renderAll();
        }
        return;
      }
      case 'back':
        if (this.mode === 'orders') { this.mode = 'idle'; this.renderAll(); return; }
        if (this.mode === 'orderTarget') { this.mode = 'orders'; this.orderId = null; this.renderAll(); return; }
        this.mode = this.mode === 'itemTarget' ? 'items' : this.mode === 'abilityTarget' || this.mode === 'abilityTile' ? 'magic' : 'action';
        this.pending = null;
        this.itemIndex = null;
        this.abilityId = null;
        this.arrowChoice = null;
        this.renderAll();
        return;
      case 'items':
        this.mode = 'items';
        this.itemIndex = null;
        this.renderAll();
        return;
      case 'useitem': {
        const u = this.sel;
        const i = Number(el?.dataset.i);
        const def = u && ITEMS[u.pack[i]?.id];
        if (!u || !def || !canUseHere(b, u, i)) return;
        if (isTargeted(def)) {
          this.mode = 'itemTarget';
          this.itemIndex = i;
          this.renderAll();
        } else await this.doItem(u, i);
        return;
      }
      case 'wait':
        if (this.sel) await this.finishUnit(this.sel);
        return;
      case 'mail': {
        const u = this.sel;
        if (!u) return;
        const rng = new RNG(b.rngState);
        const text = openMailbox(b, u, rng);
        b.rngState = rng.state;
        if (text) { sfx('chest'); this.addLog(`📬 ${esc(text)}`); this.float(u, 'MAIL!', 'heal'); }
        await this.finishUnit(u);
        return;
      }
      case 'free': {
        const u = this.sel;
        const c = u && adjacentCaptives(b, u)[0];
        if (!u || !c) return;
        freeCaptive(b, u, c.uid);
        this.float(c, 'FREED!', 'heal');
        this.addLog(`🔓 <b class="player">${esc(u.name)}</b> frees ${esc(c.name)}! They'll fight with you, and join your army after a victory.`);
        await this.finishUnit(u);
        return;
      }
      case 'stay':
        if (this.sel && this.mode === 'canto') await this.finishUnit(this.sel);
        return;
      case 'confirm': {
        const u = this.sel, t = this.pending;
        if (!u || !t) return;
        const healing = this.mode === 'heal';
        this.mode = 'busy';
        this.renderActions();
        if (healing) {
          await this.doHeal(u, t);
          await this.finishUnit(u);
          return;
        }
        const killed = await this.doCombat(u, t, this.weaponChoice ?? undefined, this.arrowChoice ?? undefined);
        if (killed && u.skills.includes('vanishingAct') && b.units.includes(u) && !checkResult(b)) {
          this.moves = computeMoves(b, u, 3);
          this.pending = null;
          this.mode = 'canto';
          this.renderAll();
          return;
        }
        // Epona: move again with leftover movement after attacking.
        const leftover = effectiveStats(u).mov - u.movedDist;
        if ((hasEffect(u, 'canto') || u.skills.includes('frenziedMovement')) && leftover > 0 && b.units.includes(u) && !checkResult(b)) {
          this.moves = computeMoves(b, u, leftover);
          this.pending = null;
          this.mode = 'canto';
          this.renderAll();
          return;
        }
        await this.finishUnit(u);
        return;
      }
    }
  }

  /** After a player unit moves: traps spring, hidden things are revealed. */
  private afterMove(u: Unit) {
    syncPosition(this.b, u);
    if (pressInversion(this.b, u)) { sfx('secret'); this.addLog('🔄 The Inversion Switch flips the walls and floors!'); }
    const dmg = triggerTraps(this.b, u);
    if (dmg) { sfx('hit'); this.float(u, `TRAP −${dmg}`, 'dmg'); this.addLog(`⚠ <b class="player">${esc(u.name)}</b> stepped on a spike trap (−${dmg} HP, rooted)!`); }
    for (const name of revealNearby(this.b)) {
      sfx('secret');
      this.addLog(`👁 ${esc(name)} is revealed!`);
    }
    this.renderUnits();
  }

  private async finishUnit(u: Unit) {
    u.acted = true;
    u.moved = true;
    this.sel = null;
    this.moves = null;
    this.origin = null;
    this.pending = null;
    this.weaponChoice = null;
    this.itemIndex = null;
    this.abilityId = null;
    this.arrowChoice = null;
    this.mode = 'idle';
    this.renderAll();
    if (await this.checkEnd()) return;
    this.save();
    if (!this.b.units.some((x) => x.team === 'player' && !x.acted)) {
      await sleep(250);
      await this.endTurn();
    }
  }

  // ───────────────────────── Animation ─────────────────────────

  private async walk(u: Unit, path: Pos[]) {
    if (path.length > 1) sfx(u.team === 'player' ? 'move' : 'step');
    const el = this.unitEls.get(u.uid);
    const prev = this.mode;
    this.mode = 'busy';
    for (const p of path.slice(1)) {
      if (el) this.posStyle(el, p.x, p.y);
      await sleep(70);
    }
    const dest = path[path.length - 1] ?? u;
    moveUnit(u, dest.x, dest.y, Math.max(0, path.length - 1));
    this.mode = prev;
  }

  private float(u: Unit, text: string, cls: string) {
    const el = document.createElement('div');
    el.className = `float ${cls}`;
    el.textContent = text;
    this.posStyle(el, u.x, u.y);
    el.style.setProperty('--s', String(u.size));
    this.els.units.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  private unitById(uid: string): Unit | undefined {
    return this.b.units.find((u) => u.uid === uid) ?? this.b.fallen.find((u) => u.uid === uid);
  }

  /** Returns true if the attacker killed the defender. */
  private async doCombat(att: Unit, def: Unit, weaponId?: string, arrowId?: string): Promise<boolean> {
    const fc = forecast(this.b, att, att, def, weaponId, arrowId);
    const startHp = { [att.uid]: att.hp, [def.uid]: def.hp };
    const side = (s: Forecast['attacker'], u: Unit): SideInfo => ({
      weapon: (weaponDef(s.weaponId)?.name ?? weaponDef(u.weapons[0])?.name ?? '') + (s.arrowId ? ` + ${ABILITIES[s.arrowId].name}` : ''),
      dmg: s.canAttack ? s.dmg : null, hit: s.canAttack ? s.hit : null, crit: s.canAttack ? s.crit : null,
    });
    const rng = new RNG(this.b.rngState);
    const res = resolveCombat(this.b, att, def, rng, weaponId, arrowId);
    this.b.rngState = rng.state;

    if (animationsEnabled()) {
      await playCinematic({
        attacker: att, defender: def, startHp, strikes: res.strikes.filter((s) => !s.splash), world: this.b.world,
        info: { [att.uid]: side(fc.attacker, att), [def.uid]: side(fc.defender, def) },
      });
      for (const s of res.strikes) {
        const by = this.unitById(s.by)!, tg = this.unitById(s.target)!;
        this.addLog(`<b class="${by.team}">${esc(by.name)}</b> ${!s.hit ? 'misses' : s.crit ? 'CRITS' : 'hits'} ${esc(tg.name)}${s.hit ? ` for ${s.dmg}` : ''}.`);
        if (s.killed) this.addLog(`☠ ${esc(tg.name)} has fallen.`);
      }
      this.reportBroken(res.broken);
      this.renderAll();
      await this.showSplash(res.strikes);
      await this.levelUps(res.levelUps);
      return res.deaths.includes(def.uid);
    }

    for (const s of res.strikes.filter((x) => !x.splash)) {
      const by = this.unitById(s.by)!;
      const tg = this.unitById(s.target)!;
      const body = this.unitEls.get(s.by)?.querySelector('.u-body') as HTMLElement | null;
      if (body) {
        const cx = (u: Unit) => u.x + u.size / 2, cy = (u: Unit) => u.y + u.size / 2;
        body.style.setProperty('--lx', `${Math.sign(cx(tg) - cx(by)) * this.tile * 0.35}px`);
        body.style.setProperty('--ly', `${Math.sign(cy(tg) - cy(by)) * this.tile * 0.35}px`);
        body.classList.remove('lunge');
        void body.offsetWidth;
        body.classList.add('lunge');
      }
      await sleep(180);
      const tBody = this.unitEls.get(s.target)?.querySelector('.u-body') as HTMLElement | null;
      sfx(!s.hit ? 'miss' : s.blocked ? 'block' : s.crit ? 'crit' : 'hit');
      if (s.hit) {
        tBody?.classList.remove('hurt');
        void tBody?.offsetWidth;
        tBody?.classList.add('hurt');
        this.float(tg, s.crit ? `CRIT ${s.dmg}` : String(s.dmg), s.crit ? 'crit' : 'dmg');
        if (s.crit) this.els.board.classList.add('shake');
      } else this.float(tg, 'MISS', 'miss');
      this.setHpBar(s.target, s.targetHp, tg.stats.hp);
      if (s.heal) { this.float(by, `+${s.heal}`, 'heal'); this.setHpBar(s.by, s.byHp, by.stats.hp); }
      if (s.saved) this.float(tg, s.saved === 'fairy' ? 'FAIRY!' : s.saved === 'revive' ? 'RISES AGAIN!' : 'TRIFORCE!', 'heal');
      if (s.blocked) this.float(tg, 'BLOCK', 'miss');
      if (s.thawed) this.float(tg, 'THAWED', 'heal');
      for (const st of s.statuses ?? []) setTimeout(() => this.float(tg, STATUS_INFO[st].name.toUpperCase(), 'crit'), 300);
      this.addLog(`<b class="${by.team}">${esc(by.name)}</b> ${!s.hit ? 'misses' : s.crit ? 'CRITS' : 'hits'} ${esc(tg.name)}${s.hit ? ` for ${s.dmg}` : ''}.`);
      await sleep(s.crit ? 420 : 320);
      this.els.board.classList.remove('shake');
      if (s.killed) {
        sfx('death');
        this.unitEls.get(s.target)?.classList.add('dying');
        this.addLog(`☠ ${esc(tg.name)} has fallen.`);
        await sleep(450);
      }
    }
    this.reportBroken(res.broken);
    this.renderAll();
    await this.showSplash(res.strikes);
    await this.levelUps(res.levelUps);
    return res.deaths.includes(def.uid);
  }

  /** Collateral hits from sweeping attacks. */
  private async showSplash(strikes: Strike[]) {
    const sp = strikes.filter((s) => s.splash);
    if (!sp.length) return;
    sfx('hit');
    for (const s of sp) {
      const tg = this.unitById(s.target) ?? this.b.fallen.find((u) => u.uid === s.target);
      if (!tg) continue;
      this.float(tg, String(s.dmg), 'dmg');
      this.setHpBar(s.target, s.targetHp, tg.stats.hp);
      this.addLog(`💥 The sweep hits ${esc(tg.name)} for ${s.dmg}.`);
      if (s.killed) { this.unitEls.get(s.target)?.classList.add('dying'); this.addLog(`☠ ${esc(tg.name)} has fallen.`); }
    }
    await sleep(500);
    this.renderAll();
  }

  private reportBroken(broken: { uid: string; weaponId: string; into?: string }[]) {
    for (const x of broken) {
      const u = this.unitById(x.uid);
      if (!u) continue;
      this.float(u, 'BROKE!', 'crit');
      this.addLog(`💥 ${esc(u.name)}'s ${esc(weaponDef(x.weaponId)?.name ?? x.weaponId)} broke${x.into ? `! (now: ${esc(weaponDef(x.into)?.name ?? x.into)})` : '!'}`);
    }
  }

  private async doCast(u: Unit, id: string, targetUid?: string, at?: Pos) {
    this.mode = 'busy';
    this.renderActions();
    const rng = new RNG(this.b.rngState);
    const res = castAbility(this.b, u, id, rng, targetUid, at);
    this.b.rngState = rng.state;
    if (!res) { this.mode = 'action'; this.renderAll(); return; }
    if (res.transformed) sfx('transform'); else if (res.def.kind !== 'song') sfx('spell');
    if (!res.def.contextual) {
      this.addLog(`<b class="${u.team}">${esc(u.name)}</b> ${res.def.kind === 'song' ? 'plays' : res.def.kind === 'technique' ? 'uses' : 'casts'} ${esc(res.def.name)}.`);
      await this.banner(res.def.name, res.def.kind === 'song' ? 'song' : 'player');
    }
    if (res.def.id === 'dinsFire') {
      const blast = document.createElement('div');
      blast.className = 'blast fire';
      this.posStyle(blast, u.x - 2, u.y - 2);
      blast.style.setProperty('--s', String(u.size + 4));
      this.els.units.appendChild(blast);
      setTimeout(() => blast.remove(), 600);
    }
    for (const h of res.hits) {
      const t = this.unitById(h.uid);
      if (!t) continue;
      this.float(t, String(h.dmg), 'dmg');
      this.setHpBar(h.uid, h.hp, t.stats.hp);
      if (h.saved) setTimeout(() => this.float(t, 'FAIRY!', 'heal'), 350);
      for (const st of h.statuses) setTimeout(() => this.float(t, STATUS_INFO[st].name.toUpperCase(), 'crit'), 300);
      if (h.killed) { this.unitEls.get(h.uid)?.classList.add('dying'); this.addLog(`☠ ${esc(t.name)} has fallen.`); }
    }
    for (const h of res.heals) { const t = this.unitById(h.uid); if (t) this.float(t, `+${h.amount}`, 'heal'); }
    for (const st of res.statuses) { const t = this.unitById(st.uid); if (t) this.float(t, STATUS_INFO[st.kind].name.toUpperCase(), 'miss'); }
    for (const id2 of res.cleansed) { const t = this.unitById(id2); if (t) this.float(t, 'CURED', 'heal'); }
    for (const id2 of res.buffed) { const t = this.unitById(id2); if (t) this.float(t, res.def.id === 'nayrusLove' ? 'BARRIER' : res.def.id === 'songOfTime' ? 'REFRESHED' : '+SPD +LCK', 'heal'); }
    for (const line of res.lines) this.addLog(esc(line));
    if (res.marked) this.addLog('A return point is set.');
    if (res.warped && res.def.id === 'faroresWind') this.addLog(`${esc(u.name)} warps back to the return point.`);
    if (res.weather) this.addLog('🌧 Rain begins to fall.');
    if (res.mounted) { this.float(u, 'MOUNTED', 'heal'); this.addLog(`${esc(u.name)}'s mount answers the call!`); }
    if (res.repaired) { const t = this.unitById(res.repaired.uid); if (t) this.float(t, 'REPAIRED', 'heal'); this.addLog(`${esc(u.name)} repairs ${esc(weaponDef(res.repaired.weaponId)?.name ?? '')}.`); }
    if (res.transformed) { this.unitEls.get(u.uid)?.remove(); this.unitEls.delete(u.uid); this.renderUnits(); this.float(u, 'TRANSFORM!', 'crit'); this.addLog(`⚡ ${esc(res.transformed)} becomes <b>${esc(u.name)}</b>!`); }
    await sleep(res.def.contextual ? 250 : 700);
    this.abilityId = null;
    this.renderAll();
    await this.levelUps(res.levelUps);
    // Disembarking from a ship that hasn't sailed yet: hand control back so the passenger can act.
    if (res.def.id === 'disembark' && !u.moved && this.b.units.includes(u)) {
      this.sel = null; this.moves = null; this.origin = null; this.mode = 'idle';
      this.renderAll();
      return;
    }
    if (res.def.id === 'boardVessel' && res.free) { this.sel = null; this.moves = null; this.origin = null; this.mode = 'idle'; this.renderAll(); return; }
    if ((res.def.freeAction || res.free) && this.b.units.includes(u)) {
      this.afterMove(u);
      this.origin = null;
      this.mode = 'action';
      this.renderAll();
      return;
    }
    await this.finishUnit(u);
  }

  private async doItem(u: Unit, index: number, at?: Pos) {
    this.mode = 'busy';
    this.renderActions();
    const rng = new RNG(this.b.rngState);
    const res = useItem(this.b, u, index, rng, at);
    this.b.rngState = rng.state;
    if (!res) { this.mode = 'action'; this.renderAll(); return; }
    sfx(res.item.kind === 'bomb' ? 'bomb' : res.heals.length || res.item.kind === 'cure' ? 'heal' : res.item.kind === 'tool' ? 'secret' : 'confirm');
    this.addLog(`<b class="${u.team}">${esc(u.name)}</b> uses ${esc(res.item.name)}.`);
    if (at && (res.item.kind === 'bomb' || res.item.kind === 'fruit')) {
      const blast = document.createElement('div');
      blast.className = 'blast';
      this.posStyle(blast, at.x - (res.item.radius ?? 0), at.y - (res.item.radius ?? 0));
      blast.style.setProperty('--s', String(1 + 2 * (res.item.radius ?? 0)));
      this.els.units.appendChild(blast);
      this.els.board.classList.add('shake');
      setTimeout(() => { blast.remove(); this.els.board.classList.remove('shake'); }, 500);
    }
    for (const h of res.heals) this.float(u, `+${h.amount}`, 'heal');
    for (const h of res.hits) {
      const t = this.unitById(h.uid);
      if (!t) continue;
      this.float(t, String(h.dmg), 'dmg');
      this.setHpBar(h.uid, h.hp, t.stats.hp);
      if (h.saved) setTimeout(() => this.float(t, 'FAIRY!', 'heal'), 350);
      if (h.killed) { this.unitEls.get(h.uid)?.classList.add('dying'); this.addLog(`☠ ${esc(t.name)} has fallen.`); }
    }
    for (const id of res.stunned) {
      const t = this.unitById(id);
      if (t) this.float(t, 'STUN', 'miss');
    }
    if (res.stunned.length) this.addLog(`${res.stunned.length} enemy${res.stunned.length > 1 ? 'ies' : 'y'} stunned!`.replace('enemyies', 'enemies'));
    for (const st of res.statuses) { const t = this.unitById(st.uid); if (t) this.float(t, STATUS_INFO[st.kind].name.toUpperCase(), 'miss'); }
    for (const line of res.lines) this.addLog(esc(line));
    await sleep(650);
    this.itemIndex = null;
    this.renderAll();
    await this.levelUps(res.levelUps);
    if (res.free) { this.mode = 'action'; this.renderAll(); return; }
    await this.finishUnit(u);
  }

  private async doHeal(healer: Unit, t: Unit, staffId?: string) {
    const rng = new RNG(this.b.rngState);
    const res = resolveHeal(this.b, healer, t, rng, staffId);
    sfx('heal');
    this.b.rngState = rng.state;
    this.float(t, `+${res.amount}`, 'heal');
    this.addLog(`<b class="${healer.team}">${esc(healer.name)}</b> heals ${esc(t.name)} for ${res.amount}.`);
    this.renderUnits();
    await sleep(450);
    await this.levelUps(res.levelUps);
  }

  private async levelUps(ups: LevelUp[]) {
    if (ups.length) sfx('levelUp');
    if (ups.length) await showLevelUps(ups, this.b.units);
  }

  private showStartEvents(events: TurnStartEvent[]) {
    for (const ev of events) {
      const u = this.b.units.find((x) => x.uid === ev.uid);
      if (!u) continue;
      if (ev.source === 'stun' || ev.source === 'freeze') this.float(u, ev.source === 'stun' ? 'STUNNED' : 'FROZEN', 'miss');
      if (ev.damage) this.float(u, `-${ev.damage}`, 'dmg');
      if (ev.heal) setTimeout(() => this.float(u, `+${ev.heal}`, 'heal'), ev.damage ? 400 : 0);
    }
    this.renderUnits();
  }

  private async banner(text: string, cls: string) {
    sfx(cls === 'song' ? 'song' : 'phase');
    const el = document.createElement('div');
    el.className = `phase-banner ${cls}`;
    el.innerHTML = `<span>${esc(text)}</span>`;
    this.els.wrap.appendChild(el);
    await sleep(900);
    el.remove();
  }

  private async intro() {
    const { b } = this;
    const w = worldDef(b.world);
    const boss = b.units.find((u) => u.isBoss);
    const bossDef = boss?.bossId ? BOSSES[boss.bossId] : undefined;
    await new Promise<void>((resolve) => {
      const m = modal(`
        <div class="intro" style="--wc:${w.color}">
          <div class="dim small">${esc(w.genre)}</div>
          <h2>${esc(w.name)}</h2>
          <p class="dim">${esc(w.blurb)}</p>
          ${b.forceName ? `<div class="intro-force">Opponents: <b>${esc(b.forceName)}</b></div>` : ''}
          <div class="intro-obj">Objective: <b>${esc(objectiveText(b.objective))}</b></div>
          ${boss ? `<div class="intro-boss">${token(boss, 48)}<div><b>${esc(boss.name)}</b> <span class="dim small">Lv ${boss.level}${boss.size > 1 ? ` · Size ${boss.size}` : ''}</span><div class="dim small">${esc(boss.title)}</div>${
            bossDef ? `<i>“${esc(bossDef.quote)}”</i>` : ''}</div></div>` : ''}
          <p class="small dim">Your Commander must survive. Fallen allies are lost unless a Great Fairy revives them. HP carries over between battles.</p>
          <button class="btn primary" data-go>Deploy</button>
        </div>`);
      m.el.querySelector('[data-go]')!.addEventListener('click', () => { m.close(); resolve(); });
    });
  }

  // ───────────────────────── Turn flow ─────────────────────────

  private async endTurn() {
    if (this.b.phase !== 'player' || this.mode === 'over') return;
    this.sel = null;
    this.mode = 'busy';
    if (await this.alliedPhase()) return;
    await this.enemyPhase();
  }

  /** Allied NPCs (escorts, friendly squads, freed prisoners) act on their own. Returns true if the battle ended. */
  private async alliedPhase(): Promise<boolean> {
    const { b } = this;
    const movers = b.units.filter((u) => u.npc && !u.captive && !u.acted);
    if (!movers.length) return false;
    this.subPhase = 'allied';
    this.renderAll();
    await this.banner('Allied Phase', 'ally');
    for (const a of movers) {
      if (!b.units.includes(a)) continue;
      const plan = planAction(b, a);
      if (plan.path.length > 1) await this.walk(a, plan.path);
      else moveUnit(a, plan.dest.x, plan.dest.y);
      syncPosition(b, a);
      const target = plan.action ? b.units.find((u) => u.uid === plan.action!.target) : undefined;
      if (target && plan.action!.type === 'attack') {
        const weapon = attackWeapons(a, unitDist(a, target)).find((w) => w.id === plan.action!.weaponId)?.id ?? attackWeapons(a, unitDist(a, target))[0]?.id;
        if (weapon) await this.doCombat(a, target, weapon);
      } else if (target && plan.action!.type === 'heal') {
        await this.doHeal(a, target, plan.action!.weaponId);
      }
      a.acted = true;
      this.renderUnits();
      if (await this.checkEnd()) { this.subPhase = null; return true; }
    }
    this.subPhase = null;
    return false;
  }

  /** Fire spreads, beans grow, weather shifts. */
  private async environmentStep() {
    const events = environmentPhase(this.b);
    if (!events.length) return;
    this.subPhase = 'environment';
    this.renderAll();
    await this.banner('Environment Phase', 'env');
    for (const ev of events) {
      this.addLog(`🌍 ${esc(ev.text)}`);
      const u = ev.uid ? this.unitById(ev.uid) : undefined;
      if (u && ev.damage) { this.float(u, `−${ev.damage}`, 'dmg'); this.setHpBar(u.uid, u.hp, u.stats.hp); }
    }
    this.subPhase = null;
    this.renderAll();
    await sleep(400);
  }

  private async enemyPhase(opening = false) {
    const { b } = this;
    this.mode = 'busy';
    const events = startPhase(b, 'enemy');
    const reinforcements = spawnReinforcements(b);
    this.renderAll();
    await this.banner('Enemy Phase', 'enemy');
    this.showStartEvents(events);
    if (reinforcements.length) this.addLog(`⚠ ${reinforcements.length} enemy reinforcements arrive!`);
    if (await this.checkEnd()) return;

    const players = () => b.units.filter((u) => u.team === 'player');
    const order = b.units
      .filter((u) => u.team === 'enemy' && !u.acted)
      .sort((a, c) => Math.min(...players().map((p) => unitDist(a, p))) - Math.min(...players().map((p) => unitDist(c, p))));

    for (const e of order) {
      if (!b.units.includes(e)) continue;
      // Ganondorf and the witch sisters transform when they can.
      const trng = new RNG(b.rngState);
      const tr = enemyAutoTransform(b, e, trng);
      b.rngState = trng.state;
      if (tr?.transformed) {
        this.unitEls.get(e.uid)?.remove(); this.unitEls.delete(e.uid);
        this.renderAll();
        await this.banner(`${tr.transformed} → ${e.name}!`, 'enemy');
        this.addLog(`⚡ ${esc(tr.transformed)} becomes <b>${esc(e.name)}</b>!`);
      }
      // Enemy ships put their crews ashore near your army.
      const landed = enemyUnload(b, e);
      if (landed.length) { this.renderUnits(); this.addLog(`⚓ ${landed.map((x) => esc(x.name)).join(', ')} land${landed.length === 1 ? 's' : ''} from the ${esc(e.name)}!`); await sleep(250); }
      const plan = planAction(b, e);
      const moved = plan.path.length > 1;
      if (moved) await this.walk(e, plan.path);
      syncPosition(b, e);
      if (moved) {
        const trap = triggerTraps(b, e);
        if (trap) { sfx('bomb'); this.float(e, `TRAP −${trap}`, 'dmg'); this.addLog(`💥 ${esc(e.name)} sets off your Death Armos Core (−${trap})!`); }
      }
      else moveUnit(e, plan.dest.x, plan.dest.y);
      let target = plan.action ? b.units.find((u) => u.uid === plan.action!.target) : undefined;
      if (target && plan.action!.type === 'attack') {
        if (e.hidden) { e.hidden = false; this.renderUnits(); this.addLog(`👁 ${esc(e.name)} appears from nowhere!`); }
        const guard = findInterceptor(b, e, target, plan.action!.weaponId);
        if (guard) {
          b.interceptUsed = true;
          this.addLog(`🛡 <b class="player">${esc(guard.name)}</b> intercepts the attack on ${esc(target.name)}!`);
          this.float(guard, 'INTERCEPT', 'heal');
          await sleep(350);
          target = guard;
        }
        const weapon = attackWeapons(e, unitDist(e, target)).find((w) => w.id === plan.action!.weaponId)?.id ?? attackWeapons(e, unitDist(e, target))[0]?.id;
        if (weapon) await this.doCombat(e, target, weapon);
      } else if (target && plan.action!.type === 'heal') {
        await this.doHeal(e, target, plan.action!.weaponId);
      } else if (moved) await sleep(60);
      e.acted = true;
      this.renderUnits();
      if (await this.checkEnd()) return;
    }

    if (!opening) {
      await this.environmentStep();
      b.turn++;
    }
    if (await this.checkEnd()) return;
    const pEvents = startPhase(b, 'player');
    this.mode = 'idle';
    this.renderAll();
    this.save();
    await this.banner(`Turn ${b.turn} — Player Phase`, 'player');
    this.showStartEvents(pEvents);
  }

  private async checkEnd(): Promise<boolean> {
    const result = checkResult(this.b);
    if (!result) return false;
    this.mode = 'over';
    this.renderAll();
    const el = document.createElement('div');
    el.className = `phase-banner big ${result === 'won' ? 'player' : 'enemy'}`;
    sfx(result === 'won' ? 'victory' : 'defeat');
    el.innerHTML = `<span>${result === 'won' ? 'VICTORY' : this.b.fallen.some((u) => u.isCommander) ? 'COMMANDER LOST' : 'DEFEAT'}</span>`;
    this.els.wrap.appendChild(el);
    await sleep(1600);
    this.destroy();
    this.onDone(result);
    return true;
  }
}

const WW_TERRAIN_NOTES: Record<string, string> = {
  whirlpool: 'Drags ships and swimmers in; hurts anyone caught in it',
  updraft: 'Fliers and gliders starting here gain +2 MOV',
  ropeSwing: 'A gap: only pirates, rope-runners and Grappling Hook users can swing across',
  grapplePost: 'Impassable. A Hookshot and Grappling Hook anchor',
  hangingVine: 'Impassable. Cut it to drop what it holds on everyone next to it',
  plantingSoil: 'Koroks and planters can grow a tree here',
  grownTree: 'Cover: Avoid +30, Def +2, heals 10%. A Hookshot anchor',
  shipDeck: 'Walkable planks over the water',
  boardingPoint: 'Board a ship from here without ending your turn',
  cannonEmplacement: 'Stand here to fire the emplaced cannon (range 3–7)',
  submergedTreasure: 'Sunken treasure: Salvage it from an adjacent space',
  sandVortex: 'Sinking sand: −2 MOV, pulls you in',
  spikedBarrel: 'Explodes when detonated, hurting everyone next to it',
  watchtower: 'Climb up: +3 vision and +1 range for ranged weapons',
  searchlight: 'Spots hidden units within 3 and raises the alarm',
  commandStatue: 'The Command Melody brings it to life',
};

/** Abilities shown in the Abilities menu (forecast-only modifiers are excluded). */
function menuAbilities(u: Unit) {
  return knownAbilities(u).filter((d) => d.kind !== 'arrow' && !(d.kind === 'technique' && !d.area) && !d.contextual);
}

/** Cavalry classes are always mounted; only show the horse badge for gear mounts. */
function CLASSES_MOUNTED(u: Unit): boolean {
  return CLASSES[u.classId]?.moveType === 'cavalry';
}

function sideReward(sq: { rupees: number; item?: string }): string {
  return [`₹${sq.rupees}`, ...(sq.item && ITEMS[sq.item] ? [ITEMS[sq.item].name] : [])].join(' + ');
}
