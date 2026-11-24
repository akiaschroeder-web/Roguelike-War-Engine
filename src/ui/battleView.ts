import { BOSSES, worldDef } from '../data/registry';
import { planAction } from '../engine/ai';
import { checkResult, moveUnit, objectiveText, spawnReinforcements, startPhase, type TurnStartEvent } from '../engine/battle';
import {
  attackWeapons, findInterceptor, forecast, healAmount, healWeapons, maxAttackRange, resolveCombat, resolveHeal, weaponDef,
  type Forecast, type LevelUp,
} from '../engine/combat';
import { computeMoves, footprint, keyOf, posOf, terrainAt, tilesInRange, unitAt, unitDist, type Moves } from '../engine/grid';
import { RNG } from '../engine/rng';
import { TERRAIN_BONUS } from '../engine/rules';
import type { RunWithEvent } from '../engine/run';
import type { Battle, Pos, Unit } from '../engine/types';
import { esc, hpBar, modal, showLevelUps, sleep, token, unitDetails, weaponLine } from './components';

type Mode = 'idle' | 'select' | 'action' | 'attack' | 'heal' | 'canto' | 'busy' | 'over';

const TERRAIN_GLYPH: Record<string, string> = {
  plain: '', forest: '♣', mountain: '▲', water: '≈', wall: '▦', fort: '⌂', lava: '♨',
};

export class BattleView {
  private b: Battle;
  private mode: Mode = 'idle';
  private sel: Unit | null = null;
  private origin: Pos | null = null;
  private moves: Moves | null = null;
  private pending: Unit | null = null;
  private weaponChoice: string | null = null;
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
  private onResize = () => { this.layout(); this.renderUnits(); };

  constructor(
    private root: HTMLElement,
    run: RunWithEvent,
    private save: () => void,
    private onDone: (result: 'won' | 'lost') => void,
  ) {
    this.b = run.battle!;
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

    if (this.b.turn === 1 && this.b.phase === 'player' && !this.b.units.some((u) => u.moved || u.acted)) {
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
    const world = worldDef(b.world);
    this.els.tiles.style.gridTemplateColumns = `repeat(${b.width}, var(--t))`;
    this.els.tiles.innerHTML = b.tiles.map((t, i) => {
      const { x, y } = posOf(b, i);
      return `<div class="tile t-${t} ${(x + y) % 2 ? 'odd' : ''}" data-x="${x}" data-y="${y}" style="--tc:${world.terrainColors[t]}"><span class="tg">${TERRAIN_GLYPH[t]}</span></div>`;
    }).join('');
    this.tileEls = [...this.els.tiles.children] as HTMLElement[];
  }

  private layout() {
    const availW = this.els.wrap.clientWidth - 8;
    const availH = Math.max(320, window.innerHeight - 140);
    this.tile = Math.max(22, Math.min(60, Math.floor(Math.min(availW / this.b.width, availH / this.b.height))));
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
    const progress = b.objective.type === 'survive' ? ` (${Math.min(b.turn, b.objective.turns!)}/${b.objective.turns})` : '';
    const kind = b.nodeType === 'elite' ? 'Elite battle' : b.nodeType === 'boss' ? 'Regional boss' : 'Battle';
    this.els.header.innerHTML = `
      <div class="bh-world"><b>${esc(w.name)}</b><span class="dim small">${esc(kind)}</span></div>
      <div class="bh-obj"><span class="dim small">Objective</span><b>${esc(objectiveText(b.objective))}${progress}</b></div>
      <div class="bh-turn"><span class="dim small">Turn ${b.turn}</span><b class="phase ${b.phase}">${b.phase === 'player' ? 'Player' : 'Enemy'} Phase</b></div>
      <div class="bh-count"><span class="dim small">Enemies</span><b>${enemies}</b></div>`;
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
      el.classList.toggle('big', u.size > 1);
      el.innerHTML = `<div class="u-body">${token(u, Math.round(this.tile * u.size * (u.size > 1 ? 0.86 : 0.78)))}</div>${hpBar(u.hp, u.stats.hp)}`;
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
    const cls: string[][] = b.tiles.map(() => []);
    const add = (k: number, c: string) => cls[k].push(c);

    if (this.showDanger) {
      for (const e of b.units.filter((u) => u.team === 'enemy')) {
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
      html = this.forecastHtml(forecast(b, this.sel, this.sel, this.pending, this.weaponChoice ?? undefined));
    } else if (this.mode === 'heal' && this.sel && this.pending) {
      html = this.healHtml(this.sel, this.pending);
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
        : t === 'water' ? 'Only fliers and swimmers (Zora) can enter'
        : t === 'lava' ? 'Burns 20% max HP per turn (Gorons and fliers are immune)'
        : `Avoid +${tb.avoid} · Def +${tb.def}${tb.heal ? ` · Heals ${tb.heal}%` : ''}`;
      html += `<div class="terrain-info"><b>${esc(worldDef(b.world).terrainNames[t])}</b> <span class="dim small">${note}</span></div>`;
    }
    this.els.panel.innerHTML = html;
  }

  private forecastHtml(fc: Forecast): string {
    const a = this.b.units.find((u) => u.uid === fc.attacker.uid)!;
    const d = this.b.units.find((u) => u.uid === fc.defender.uid)!;
    const options = attackWeapons(a, fc.distance);
    const side = (u: Unit, s: Forecast['attacker'], other: Unit) => {
      const after = Math.max(0, other.hp - (s.canAttack ? s.dmg * s.attacks : 0));
      const wName = weaponDef(s.weaponId)?.name ?? u.weapons.map((id) => weaponDef(id)?.name).find(Boolean) ?? 'Unarmed';
      return `
      <div class="fc-side ${u.team}">
        <div class="fc-who">${token(u, 34)}<div><b>${esc(u.name)}</b><div class="dim small">${esc(wName)}${
          s.triangle === 1 ? ' <span class="up">▲</span>' : s.triangle === -1 ? ' <span class="down">▼</span>' : ''}${s.effective ? ' <span class="up">×2</span>' : ''}</div></div></div>
        <div class="fc-hp">HP ${u.hp}</div>
        ${s.canAttack ? `
          <div class="fc-row"><span>Dmg</span><b>${s.dmg}${s.attacks > 1 ? ` ×${s.attacks}` : ''}</b></div>
          <div class="fc-row"><span>Hit</span><b>${s.hit}%</b></div>
          <div class="fc-row"><span>Crit</span><b>${s.crit}%</b></div>
          <div class="fc-row dim small"><span>Foe HP after</span><b>${after}${after === 0 ? ' ☠' : ''}</b></div>`
        : '<div class="fc-none">Cannot counter</div>'}
      </div>`;
    };
    const switcher = options.length > 1
      ? `<div class="weapon-switch">${options.map((w) => `<button class="btn small ${w.id === fc.attacker.weaponId ? 'on' : ''}" data-act="weapon" data-w="${w.id}">${esc(w.name)}</button>`).join('')}</div>` : '';
    return `<div class="forecast"><div class="fc-title">Combat Forecast</div>${switcher}<div class="fc-cols">${side(a, fc.attacker, d)}${side(d, fc.defender, a)}</div>
      <button class="btn primary wide" data-act="confirm">Attack ${esc(d.name)}</button></div>`;
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
      const ready = this.b.units.filter((u) => u.team === 'player' && !u.acted).length;
      html = `<button class="btn primary" data-act="end">End Turn <span class="dim">(${ready} ready)</span></button>
        <button class="btn ${this.showDanger ? 'on' : ''}" data-act="danger">Danger Zone</button>`;
    } else if (m === 'select') {
      html = `<button class="btn" data-act="cancel">Cancel</button><span class="dim small">Choose a destination, or tap the unit to stay put.</span>`;
    } else if (m === 'action' && this.sel) {
      html = `
        ${this.attackTargets(this.sel).length ? '<button class="btn primary" data-act="attack">Attack</button>' : ''}
        ${this.healTargets(this.sel).length ? '<button class="btn primary" data-act="heal">Heal</button>' : ''}
        <button class="btn" data-act="wait">Wait</button>
        <button class="btn" data-act="undo">Undo Move</button>`;
    } else if (m === 'attack' || m === 'heal') {
      html = `<button class="btn" data-act="back">Back</button><span class="dim small">Pick a ${m === 'attack' ? 'target' : 'wounded ally'}.</span>`;
    } else if (m === 'canto') {
      html = `<button class="btn primary" data-act="stay">Stay</button><span class="dim small">Vanishing Act: move up to 3 more spaces.</span>`;
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
      case 'attack': case 'heal': void this.action('back'); break;
      case 'idle': this.inspect.clear(); this.renderAll(); break;
    }
  }

  private deselect() {
    this.sel = null;
    this.moves = null;
    this.origin = null;
    this.pending = null;
    this.weaponChoice = null;
    this.mode = 'idle';
    this.renderAll();
  }

  private selectUnit(u: Unit) {
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
      if (u && u.team === 'player' && !u.acted) this.selectUnit(u);
      else if (u && u.team === 'enemy') {
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
        if (this.mode === 'canto') { await this.finishUnit(this.sel); return; }
        this.mode = 'action';
        this.renderAll();
        return;
      }
      if (this.mode === 'canto') return;
      // Tap an enemy directly: move to the best tile in range and preview.
      if (u && u.team === 'enemy') {
        const from = this.bestTileToAttack(this.sel, u);
        if (from) {
          await this.walk(this.sel, this.moves.path(keyOf(b, from.x, from.y)));
          this.mode = 'attack';
          this.pending = u;
          this.weaponChoice = null;
          this.renderAll();
          return;
        }
      }
      if (u && u.team === 'player' && !u.acted && u !== this.sel) {
        this.selectUnit(u);
        this.renderAll();
        return;
      }
      this.deselect();
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
    return this.b.units.filter((t) => t.team !== u.team && attackWeapons(u, unitDist(u, t)).length > 0);
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
        this.renderPanel();
        return;
      case 'back':
        this.mode = 'action';
        this.pending = null;
        this.renderAll();
        return;
      case 'wait':
        if (this.sel) await this.finishUnit(this.sel);
        return;
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
        const killed = await this.doCombat(u, t, this.weaponChoice ?? undefined);
        if (killed && u.skills.includes('vanishingAct') && b.units.includes(u) && !checkResult(b)) {
          this.moves = computeMoves(b, u, 3);
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

  private async finishUnit(u: Unit) {
    u.acted = true;
    u.moved = true;
    this.sel = null;
    this.moves = null;
    this.origin = null;
    this.pending = null;
    this.weaponChoice = null;
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
  private async doCombat(att: Unit, def: Unit, weaponId?: string): Promise<boolean> {
    const rng = new RNG(this.b.rngState);
    const res = resolveCombat(this.b, att, def, rng, weaponId);
    this.b.rngState = rng.state;
    for (const s of res.strikes) {
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
      if (s.hit) {
        tBody?.classList.remove('hurt');
        void tBody?.offsetWidth;
        tBody?.classList.add('hurt');
        this.float(tg, s.crit ? `CRIT ${s.dmg}` : String(s.dmg), s.crit ? 'crit' : 'dmg');
        if (s.crit) this.els.board.classList.add('shake');
      } else this.float(tg, 'MISS', 'miss');
      this.setHpBar(s.target, s.targetHp, tg.stats.hp);
      if (s.heal) { this.float(by, `+${s.heal}`, 'heal'); this.setHpBar(s.by, s.byHp, by.stats.hp); }
      if (s.saved) this.float(tg, 'TRIFORCE!', 'heal');
      this.addLog(`<b class="${by.team}">${esc(by.name)}</b> ${!s.hit ? 'misses' : s.crit ? 'CRITS' : 'hits'} ${esc(tg.name)}${s.hit ? ` for ${s.dmg}` : ''}.`);
      await sleep(s.crit ? 420 : 320);
      this.els.board.classList.remove('shake');
      if (s.killed) {
        this.unitEls.get(s.target)?.classList.add('dying');
        this.addLog(`☠ ${esc(tg.name)} has fallen.`);
        await sleep(450);
      }
    }
    this.renderAll();
    await this.levelUps(res.levelUps);
    return res.deaths.includes(def.uid);
  }

  private async doHeal(healer: Unit, t: Unit, staffId?: string) {
    const rng = new RNG(this.b.rngState);
    const res = resolveHeal(this.b, healer, t, rng, staffId);
    this.b.rngState = rng.state;
    this.float(t, `+${res.amount}`, 'heal');
    this.addLog(`<b class="${healer.team}">${esc(healer.name)}</b> heals ${esc(t.name)} for ${res.amount}.`);
    this.renderUnits();
    await sleep(450);
    await this.levelUps(res.levelUps);
  }

  private async levelUps(ups: LevelUp[]) {
    if (ups.length) await showLevelUps(ups, this.b.units);
  }

  private showStartEvents(events: TurnStartEvent[]) {
    for (const ev of events) {
      const u = this.b.units.find((x) => x.uid === ev.uid);
      if (!u) continue;
      if (ev.damage) this.float(u, `-${ev.damage}`, 'dmg');
      if (ev.heal) setTimeout(() => this.float(u, `+${ev.heal}`, 'heal'), ev.damage ? 400 : 0);
    }
    this.renderUnits();
  }

  private async banner(text: string, cls: string) {
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
    await this.enemyPhase();
  }

  private async enemyPhase() {
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
      const plan = planAction(b, e);
      const moved = plan.path.length > 1;
      if (moved) await this.walk(e, plan.path);
      else moveUnit(e, plan.dest.x, plan.dest.y);
      let target = plan.action ? b.units.find((u) => u.uid === plan.action!.target) : undefined;
      if (target && plan.action!.type === 'attack') {
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

    b.turn++;
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
    el.innerHTML = `<span>${result === 'won' ? 'VICTORY' : this.b.fallen.some((u) => u.isCommander) ? 'COMMANDER LOST' : 'DEFEAT'}</span>`;
    this.els.wrap.appendChild(el);
    await sleep(1600);
    this.destroy();
    this.onDone(result);
    return true;
  }
}
