import { CLASSES } from '../data/classes';
import { HEROES, HERO_MAP } from '../data/heroes';
import { RELICS } from '../data/skills';
import { WEAPONS } from '../data/weapons';
import { PLAYABLE_WORLDS, WORLDS } from '../data/worlds';
import type { LevelUp } from '../engine/combat';
import { randomSeed } from '../engine/rng';
import {
  ACTS, advanceAct, availableNodes, buyRelic, buyTonic, buyWeapon, canEquip, currentNode, enterNode, finishBattle,
  isActComplete, isRunWon, loadMeta, loadRun, MAX_ROSTER, newRun, recruit, restDrill, restTrain, REVIVE_PRICE, revive,
  saveMeta, saveRun, takeTreasure, TONIC_PRICE, averageLevel, type Meta, type RunWithEvent,
} from '../engine/run';
import type { MapNode, NodeType, RelicId, StatKey } from '../engine/types';
import { BattleView } from './battleView';
import {
  confirmDialog, esc, heroCard, hpBar, modal, relicChip, showLevelUps, STAT_LABELS, token, unitDetails, weaponLine, worldTag,
} from './components';

const NODE_INFO: Record<NodeType, { icon: string; label: string; desc: string }> = {
  battle: { icon: '⚔', label: 'Skirmish', desc: 'A standard battle. Earn gold and experience.' },
  elite: { icon: '☠', label: 'Elite', desc: 'A warlord and their guard. Dangerous, but well rewarded.' },
  recruit: { icon: '✧', label: 'Rift Tear', desc: 'A hero from another world falls through. Recruit one.' },
  shop: { icon: '¤', label: 'Merchant', desc: 'Buy weapons, tonics and relics. Revive the fallen.' },
  rest: { icon: '☾', label: 'Campfire', desc: 'Train one unit, or drill the whole army.' },
  treasure: { icon: '◈', label: 'Cache', desc: 'Claim a relic that empowers your whole army.' },
  boss: { icon: '♛', label: 'Warlord', desc: 'The act boss. Defeat them to push deeper into the Rift.' },
};

export class App {
  private run: RunWithEvent | null = loadRun();
  private meta: Meta = loadMeta();
  private battleView: BattleView | null = null;

  constructor(private root: HTMLElement) {
    this.root.addEventListener('click', (e) => this.onClick(e));
    this.title();
  }

  private save() {
    saveRun(this.run);
  }

  private setScreen(html: string, cls = '') {
    this.battleView?.destroy();
    this.battleView = null;
    this.root.innerHTML = `<div class="screen ${cls}">${html}</div>`;
    window.scrollTo(0, 0);
  }

  // Simple event delegation: elements with data-nav call the matching method.
  private handlers: Record<string, (el: HTMLElement) => void> = {};

  private onClick(e: Event) {
    const el = (e.target as HTMLElement).closest('[data-nav]') as HTMLElement | null;
    if (!el || el.hasAttribute('disabled')) return;
    const fn = this.handlers[el.dataset.nav!];
    if (fn) fn(el);
  }

  private on(handlers: Record<string, (el: HTMLElement) => void>) {
    this.handlers = handlers;
  }

  // ───────────────────────── Title ─────────────────────────

  title() {
    const hasRun = !!this.run;
    const worlds = PLAYABLE_WORLDS.map((id) => `<span class="world-dot" style="--wc:${WORLDS[id].color}" title="${esc(WORLDS[id].name)}"></span>`).join('');
    this.setScreen(`
      <div class="title-screen">
        <div class="logo"><span>RIFTBOUND</span><small>TACTICS</small></div>
        <div class="worlds-row">${worlds}</div>
        <p class="tagline">Six worlds are bleeding into one. Gather heroes from every reality, command them on the grid, and fight your way to the heart of the Rift. Every run is different. Every death is permanent.</p>
        <div class="menu">
          ${hasRun ? '<button class="btn primary big" data-nav="continue">Continue Run</button>' : ''}
          <button class="btn ${hasRun ? '' : 'primary'} big" data-nav="new">New Run</button>
          <button class="btn" data-nav="howto">How to Play</button>
          <button class="btn" data-nav="codex">Hero Codex</button>
        </div>
        <div class="records dim small">Runs ${this.meta.runs} · Victories ${this.meta.wins} · Heroes met ${this.meta.discovered.length}/${HEROES.length}</div>
      </div>`, 'center');
    this.on({
      continue: () => this.resume(),
      new: async () => {
        if (this.run && !(await confirmDialog('Abandon your current run?', 'Abandon', 'Keep it'))) return;
        this.chooseCommander();
      },
      howto: () => this.howTo(),
      codex: () => this.codex(),
    });
  }

  private howTo() {
    const m = modal(`
      <h2>How to Play</h2>
      <h3>The run</h3>
      <p>Each act is a branching map. Pick a path through skirmishes, elite fights, merchants, campfires, treasure caches and <b>Rift Tears</b> where heroes from other worlds join you. Beat the warlord at the end of each act. Clear all ${ACTS} acts to win.</p>
      <h3>Battles</h3>
      <ul>
        <li>Tap a unit to see where it can move (blue) and what it can hit (red). Tap a tile to move, then choose an action.</li>
        <li>Tap an enemy directly while a unit is selected to auto-move into range and preview the fight.</li>
        <li>Tap enemies on your turn to see their threat range, or toggle the <b>Danger Zone</b>.</li>
        <li>The <b>weapon triangle</b>: Swords beat Axes, Axes beat Lances, Lances beat Swords (+1 damage, +15 hit).</li>
        <li>Bows hit at range 2 and are deadly to fliers. Guns hit at 2–3 but can't counter up close. Magic targets Resistance.</li>
        <li>If your Speed is 4+ higher than the enemy's, you strike twice.</li>
        <li>Forests and mountains grant avoid and defense. Forts heal 20% per turn.</li>
      </ul>
      <h3>Permadeath</h3>
      <p>Fallen units are gone (unless a merchant can revive them). If your <b>Commander</b> falls, the run ends. Units fully heal between battles.</p>
      <button class="btn primary" data-close>Got it</button>`, { dismissable: true });
    void m;
  }

  private codex() {
    const met = new Set(this.meta.discovered);
    const m = modal(`
      <h2>Hero Codex</h2>
      <p class="dim small">Heroes you've commanded or met through the Rift.</p>
      <div class="codex">${PLAYABLE_WORLDS.map((wid) => `
        <div class="codex-world"><h3 style="color:${WORLDS[wid].color}">${esc(WORLDS[wid].name)} <span class="dim small">${esc(WORLDS[wid].genre)}</span></h3>
        <div class="codex-row">${HEROES.filter((h) => h.world === wid).map((h) => met.has(h.id)
          ? `<div class="codex-hero">${token({ world: h.world, glyph: h.glyph, team: 'player' }, 36)}<div><b>${esc(h.name)}</b><div class="dim small">${esc(h.title)}</div></div></div>`
          : `<div class="codex-hero locked"><span class="token" style="--sz:36px">?</span><div class="dim">Unknown</div></div>`).join('')}</div></div>`).join('')}
      </div>
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
    void m;
  }

  // ───────────────────────── New run ─────────────────────────

  private chooseCommander() {
    let chosen: string | null = null;
    const render = () => {
      this.setScreen(`
        <div class="page">
          <div class="page-head"><button class="btn" data-nav="back">← Back</button><h1>Choose your Commander</h1><span></span></div>
          <p class="dim center-text">Your Commander leads the army across the worlds. If they fall, the run is over. Two random allies from other worlds will join them.</p>
          ${PLAYABLE_WORLDS.map((wid) => `
            <section class="world-section">
              <h2 style="color:${WORLDS[wid].color}">${esc(WORLDS[wid].name)} <span class="dim small">${esc(WORLDS[wid].genre)}</span></h2>
              <p class="dim small">${esc(WORLDS[wid].blurb)}</p>
              <div class="card-grid">${HEROES.filter((h) => h.world === wid).map((h) => `
                <div class="pick ${chosen === h.id ? 'chosen' : ''}" data-nav="pick" data-id="${h.id}">${heroCard(h)}</div>`).join('')}
              </div>
            </section>`).join('')}
          <div class="sticky-bar">${chosen
            ? `<span>Commander: <b>${esc(HERO_MAP[chosen].name)}</b>, ${esc(HERO_MAP[chosen].title)}</span><button class="btn primary big" data-nav="start">Begin Run →</button>`
            : '<span class="dim">Select a hero above.</span>'}</div>
        </div>`);
      this.on({
        back: () => this.title(),
        pick: (el) => {
          chosen = el.dataset.id!;
          const y = window.scrollY;
          render();
          window.scrollTo(0, y);
        },
        start: () => {
          if (!chosen) return;
          this.run = newRun(randomSeed(), chosen);
          this.meta.runs++;
          this.discover(this.run.roster.map((u) => u.heroId!));
          this.save();
          this.mapScreen();
        },
      });
    };
    render();
  }

  private discover(ids: string[]) {
    for (const id of ids) if (!this.meta.discovered.includes(id)) this.meta.discovered.push(id);
    saveMeta(this.meta);
  }

  private resume() {
    const run = this.run;
    if (!run) return this.title();
    if (run.battle) return this.battle();
    if (run.event) return this.eventScreen();
    this.mapScreen();
  }

  // ───────────────────────── Map ─────────────────────────

  private topBar(): string {
    const run = this.run!;
    return `
      <div class="topbar">
        <div><span class="dim small">Act</span> <b>${run.act}/${ACTS}</b></div>
        <div><span class="dim small">Gold</span> <b class="gold">${run.gold}g</b></div>
        <div class="relics">${run.relics.length ? run.relics.map(relicChip).join('') : '<span class="dim small">No relics yet</span>'}</div>
        <button class="btn small" data-nav="menu">☰</button>
      </div>`;
  }

  private partyHtml(): string {
    const run = this.run!;
    return `
      <div class="party">
        <h3>Army <span class="dim small">${run.roster.length}/${MAX_ROSTER}</span></h3>
        ${run.roster.map((u) => `
          <div class="party-row" data-nav="unit" data-uid="${u.uid}">
            ${token(u, 34)}
            <div class="pr-main"><b>${esc(u.name)}</b> <span class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId].name)}</span>
              <div class="dim small">${esc(WEAPONS[u.weaponId].name)}</div></div>
          </div>`).join('')}
        ${run.fallen.length ? `<h4 class="dim">Fallen</h4>${run.fallen.map((u) => `<div class="party-row fallen">${token(u, 26)}<span class="dim small">${esc(u.name)}</span></div>`).join('')}` : ''}
      </div>`;
  }

  private commonHandlers() {
    return {
      menu: async () => {
        const m = modal(`<h2>Paused</h2><div class="menu"><button class="btn" data-close>Resume</button><button class="btn" data-k="title">Save & Quit to Title</button><button class="btn danger" data-k="abandon">Abandon Run</button></div>`, { dismissable: true });
        m.el.addEventListener('click', async (e) => {
          const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
          if (!k) return;
          m.close();
          if (k.dataset.k === 'title') this.title();
          if (k.dataset.k === 'abandon' && (await confirmDialog('Abandon this run? It will count as a loss.', 'Abandon'))) {
            this.run = null;
            this.save();
            this.title();
          }
        });
      },
      unit: (el: HTMLElement) => {
        const u = this.run!.roster.find((x) => x.uid === el.dataset.uid);
        if (!u) return;
        const hero = u.heroId ? HERO_MAP[u.heroId] : undefined;
        modal(`${unitDetails(u, this.run!.relics)}${hero ? `<p class="bio">${esc(hero.bio)}</p>` : ''}<button class="btn primary" data-close>Close</button>`, { dismissable: true });
      },
    };
  }

  mapScreen() {
    const run = this.run!;
    const avail = new Set(availableNodes(run).map((n) => n.id));
    const rows: MapNode[][] = [];
    for (const n of run.map.nodes) (rows[n.row] ??= []).push(n);
    const colW = 120, rowH = 110, padY = 50;
    const height = 420;
    const width = rows.length * colW + 40;
    const pos = (n: MapNode) => ({ x: 40 + n.row * colW + colW / 2 - 20, y: padY + n.col * (height - padY * 2) });
    const lines: string[] = [];
    for (const n of run.map.nodes) {
      for (const id of n.next) {
        const m = run.map.nodes.find((x) => x.id === id)!;
        const a = pos(n), c = pos(m);
        const taken = n.visited && m.visited;
        const open = n.id === run.currentNodeId && avail.has(m.id);
        lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}" class="${taken ? 'taken' : open ? 'open' : ''}" />`);
      }
    }
    void rowH;
    const nodes = run.map.nodes.map((n) => {
      const p = pos(n);
      const info = NODE_INFO[n.type];
      const w = WORLDS[n.world];
      const isCur = n.id === run.currentNodeId;
      const cls = ['n-' + n.type, avail.has(n.id) ? 'avail' : '', n.visited ? 'visited' : '', isCur ? 'current' : ''].join(' ');
      return `<button class="map-node ${cls}" style="left:${p.x}px;top:${p.y}px;--wc:${w.color}" data-nav="${avail.has(n.id) ? 'node' : 'peek'}" data-id="${n.id}" title="${esc(info.label)} — ${esc(w.name)}">
        <span>${info.icon}</span></button>`;
    }).join('');

    const actName = ['', 'The Fraying', 'The Convergence', 'The Heart of the Rift'][run.act] ?? '';
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="map-main">
          <h2>Act ${run.act}: ${actName}</h2>
          <p class="dim small">Choose your next destination. Node rings show which world the Rift has pulled in.</p>
          <div class="map-scroll"><div class="map" style="width:${width}px;height:${height}px">
            <svg width="${width}" height="${height}">${lines.join('')}</svg>${nodes}
          </div></div>
          <div class="legend">${(Object.keys(NODE_INFO) as NodeType[]).map((t) => `<span><b>${NODE_INFO[t].icon}</b> ${NODE_INFO[t].label}</span>`).join('')}</div>
          <div class="node-info dim small">Tap a highlighted node to travel there.</div>
        </div>
        ${this.partyHtml()}
      </div>`);
    const showInfo = (id: string, go: boolean) => {
      const n = run.map.nodes.find((x) => x.id === id)!;
      const info = NODE_INFO[n.type];
      const w = WORLDS[n.world];
      const el = this.root.querySelector('.node-info') as HTMLElement;
      el.innerHTML = `<b>${info.icon} ${esc(info.label)}</b> in ${worldTag(n.world)} — ${esc(info.desc)} <span class="dim">${esc(w.genre)}.</span>${
        go ? ` <button class="btn primary small" data-nav="go" data-id="${n.id}">Travel →</button>` : ''
      }`;
      el.classList.remove('dim');
    };
    this.on({
      ...this.commonHandlers(),
      peek: (el) => showInfo(el.dataset.id!, false),
      node: (el) => showInfo(el.dataset.id!, true),
      go: (el) => {
        enterNode(run, el.dataset.id!);
        this.save();
        if (run.battle) this.battle();
        else this.eventScreen();
      },
    });
  }

  // ───────────────────────── Battle ─────────────────────────

  private battle() {
    const run = this.run!;
    this.setScreen('');
    this.battleView = new BattleView(this.root.firstElementChild as HTMLElement, run, () => this.save(), (result) => this.afterBattle(result));
    void this.battleView.mount();
  }

  private afterBattle(result: 'won' | 'lost') {
    const run = this.run!;
    const commanderFell = run.battle!.fallen.some((u) => u.isCommander);
    const summary = finishBattle(run);
    const node = currentNode(run);
    const depth = (run.act - 1) * 7 + (node?.row ?? 0) + 1;
    this.meta.bestDepth = Math.max(this.meta.bestDepth, depth);
    saveMeta(this.meta);

    if (result === 'lost') {
      this.gameOver(commanderFell ? 'Your Commander has fallen.' : 'Your army was wiped out.');
      return;
    }
    this.save();
    this.setScreen(`
      <div class="results">
        <h1 class="win">Victory</h1>
        <div class="res-row"><span>Gold earned</span><b class="gold">+${summary.gold}g</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${summary.kills}</b></div>
        ${summary.fallen.length ? `<div class="res-fallen"><span class="dim">Fallen in battle:</span> ${summary.fallen.map((u) => `${token(u, 28)} ${esc(u.name)}`).join(' ')}</div>` : '<div class="dim">No losses. Flawless.</div>'}
        <div class="res-army">${run.roster.map((u) => `<div class="res-unit">${token(u, 36)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} · ${u.xp}/100 XP</div></div></div>`).join('')}</div>
        <button class="btn primary big" data-nav="cont">Continue</button>
      </div>`, 'center');
    this.on({ cont: () => this.afterNode() });
  }

  /** Called when a node is fully resolved. */
  private afterNode() {
    const run = this.run!;
    if (isRunWon(run)) return this.victory();
    if (isActComplete(run)) {
      advanceAct(run);
      this.save();
      const names = ['', '', 'The Convergence', 'The Heart of the Rift'];
      this.setScreen(`
        <div class="results">
          <div class="dim">Warlord defeated</div>
          <h1>Act ${run.act}</h1>
          <h2>${names[run.act] ?? ''}</h2>
          <p class="dim">The worlds pull closer together. Enemies grow stronger. You receive <b class="gold">150g</b> in spoils.</p>
          <button class="btn primary big" data-nav="cont">Onward</button>
        </div>`, 'center');
      this.on({ cont: () => this.mapScreen() });
      return;
    }
    this.mapScreen();
  }

  private gameOver(reason: string) {
    const run = this.run!;
    const node = currentNode(run);
    this.run = null;
    this.save();
    this.setScreen(`
      <div class="results">
        <h1 class="lose">Run Over</h1>
        <p>${esc(reason)}</p>
        <div class="res-row"><span>Reached</span><b>Act ${run.act}, step ${(node?.row ?? 0) + 1}</b></div>
        <div class="res-row"><span>Battles won</span><b>${run.stats.battles - 1}</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${run.stats.kills}</b></div>
        <div class="res-row"><span>Heroes recruited</span><b>${run.stats.recruits}</b></div>
        <button class="btn primary big" data-nav="title">Return to Title</button>
      </div>`, 'center');
    this.on({ title: () => this.title() });
  }

  private victory() {
    const run = this.run!;
    this.meta.wins++;
    saveMeta(this.meta);
    this.run = null;
    this.save();
    this.setScreen(`
      <div class="results">
        <h1 class="win">The Rift is Sealed</h1>
        <p>The Unmaker is undone. One by one, the worlds drift back to where they belong, and your heroes with them, carrying stories no one at home will believe.</p>
        <div class="res-army">${run.roster.map((u) => `<div class="res-unit">${token(u, 40)}<div><b>${esc(u.name)}</b><div class="dim small">${esc(u.title)} · Lv ${u.level}</div></div></div>`).join('')}</div>
        <div class="res-row"><span>Enemies defeated</span><b>${run.stats.kills}</b></div>
        <button class="btn primary big" data-nav="title">Return to Title</button>
      </div>`, 'center');
    this.on({ title: () => this.title() });
  }

  // ───────────────────────── Events ─────────────────────────

  private eventScreen() {
    const ev = this.run!.event;
    if (!ev) return this.afterNode();
    if (ev.type === 'recruit') return this.recruitScreen();
    if (ev.type === 'shop') return this.shopScreen();
    if (ev.type === 'rest') return this.restScreen();
    if (ev.type === 'treasure') return this.treasureScreen();
  }

  private finishEvent() {
    this.run!.event = undefined;
    this.save();
    this.afterNode();
  }

  private recruitScreen() {
    const run = this.run!;
    const ev = run.event as Extract<RunWithEvent['event'], { type: 'recruit' }>;
    const full = run.roster.length >= MAX_ROSTER;
    const lvl = Math.max(1, Math.round(averageLevel(run)) - 1);
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>A Rift Tear</h1>
        <p class="dim center-text">Reality splits open. Figures stumble through, dazed, from worlds not their own. ${
          full ? '<b>Your army is full</b>, so you can only send them home with supplies (+120g).' : `One of them will join you at <b>Level ${lvl}</b>.`
        }</p>
        ${ev.offers.length ? `<div class="card-grid">${ev.offers.map((id) => `<div>${heroCard(HERO_MAP[id], full ? '' : `<button class="btn primary wide" data-nav="take" data-id="${id}">Recruit ${esc(HERO_MAP[id].name)}</button>`)}</div>`).join('')}</div>`
          : '<p class="center-text">The tear is empty. You have met every hero the Rift can offer. (+120g)</p>'}
        <div class="center-text"><button class="btn" data-nav="skip">${full || !ev.offers.length ? 'Take 120g and leave' : 'Leave'}</button></div>
      </div>`);
    this.on({
      ...this.commonHandlers(),
      take: (el) => {
        const u = recruit(run, el.dataset.id!);
        this.discover([u.heroId!]);
        this.save();
        const m = modal(`<div class="center-text">${token(u, 64)}<h2>${esc(u.name)} joins!</h2><p class="dim">${esc(HERO_MAP[u.heroId!].bio)}</p><button class="btn primary" data-ok>Welcome aboard</button></div>`);
        m.el.addEventListener('click', (e) => {
          if (!(e.target as HTMLElement).closest('[data-ok]')) return;
          m.close();
          this.afterNode();
        });
      },
      skip: () => {
        if (full || !ev.offers.length) run.gold += 120;
        this.discover(ev.offers);
        this.finishEvent();
      },
    });
  }

  private unitPicker(title: string, eligible: (uid: string) => boolean, preview: (uid: string) => string): Promise<string | null> {
    const run = this.run!;
    return new Promise((resolve) => {
      const m = modal(`<h3>${title}</h3><div class="picker">${run.roster.map((u) => {
        const ok = eligible(u.uid);
        return `<button class="party-row ${ok ? '' : 'disabled'}" ${ok ? `data-uid="${u.uid}"` : 'disabled'}>${token(u, 32)}<div class="pr-main"><b>${esc(u.name)}</b> <span class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId].name)}</span><div class="small dim">${preview(u.uid)}</div></div></button>`;
      }).join('')}</div><button class="btn" data-close>Cancel</button>`, { dismissable: true });
      m.el.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        const row = t.closest('[data-uid]') as HTMLElement | null;
        if (row) { m.close(); resolve(row.dataset.uid!); }
        else if (t.closest('[data-close]') || t === m.el) { m.close(); resolve(null); }
      });
    });
  }

  private shopScreen() {
    const run = this.run!;
    const ev = run.event as Extract<RunWithEvent['event'], { type: 'shop' }>;
    const render = () => {
      const tonicLabel = (s: StatKey) => `${STAT_LABELS[s]} Tonic`;
      this.setScreen(`
        ${this.topBar()}
        <div class="map-layout">
          <div class="page">
            <h1>Interdimensional Merchant</h1>
            <p class="dim center-text">“Gold from any world spends the same here, friend.”</p>
            <h3>Weapons</h3>
            <div class="shop-list">${ev.weapons.map((id) => {
              const w = WEAPONS[id];
              const sold = ev.sold.includes(id);
              const users = run.roster.filter((u) => canEquip(u, id)).length;
              return `<div class="shop-item ${sold ? 'sold' : ''}">${weaponLine(w)}${w.desc ? `<div class="dim small">${esc(w.desc)}</div>` : ''}
                <button class="btn small" data-nav="weapon" data-id="${id}" ${sold || run.gold < w.price || !users ? 'disabled' : ''}>${sold ? 'Sold' : `${w.price}g`}</button></div>`;
            }).join('')}</div>
            <h3>Tonics <span class="dim small">Permanent stat boost for one unit</span></h3>
            <div class="shop-list">${ev.tonics.map((s) => {
              const sold = ev.sold.includes(`tonic:${s}`);
              return `<div class="shop-item ${sold ? 'sold' : ''}"><span><b>${tonicLabel(s)}</b> <span class="dim">+${s === 'hp' ? 5 : 2} ${STAT_LABELS[s]}</span></span>
                <button class="btn small" data-nav="tonic" data-id="${s}" ${sold || run.gold < TONIC_PRICE ? 'disabled' : ''}>${sold ? 'Sold' : `${TONIC_PRICE}g`}</button></div>`;
            }).join('')}</div>
            <h3>Relics <span class="dim small">Passive bonuses for your whole army</span></h3>
            <div class="shop-list">${ev.relics.map((r: RelicId) => {
              const R = RELICS[r];
              const sold = run.relics.includes(r);
              return `<div class="shop-item ${sold ? 'sold' : ''}"><span><b>${R.icon} ${esc(R.name)}</b> <span class="dim">${esc(R.desc)}</span></span>
                <button class="btn small" data-nav="relic" data-id="${r}" ${sold || run.gold < R.price ? 'disabled' : ''}>${sold ? 'Owned' : `${R.price}g`}</button></div>`;
            }).join('') || '<div class="dim">Sold out.</div>'}</div>
            ${run.fallen.length ? `<h3>Revival <span class="dim small">Pull a fallen ally back through the Rift</span></h3>
              <div class="shop-list">${run.fallen.map((u) => `<div class="shop-item">${token(u, 28)} <b>${esc(u.name)}</b> <span class="dim small">Lv ${u.level}</span>
                <button class="btn small" data-nav="revive" data-id="${u.uid}" ${run.gold < REVIVE_PRICE || run.roster.length >= MAX_ROSTER ? 'disabled' : ''}>${REVIVE_PRICE}g</button></div>`).join('')}</div>` : ''}
            <div class="center-text"><button class="btn primary big" data-nav="leave">Leave Shop</button></div>
          </div>
          ${this.partyHtml()}
        </div>`);
      this.on({
        ...this.commonHandlers(),
        weapon: async (el) => {
          const id = el.dataset.id!;
          const w = WEAPONS[id];
          const uid = await this.unitPicker(`Equip ${esc(w.name)} on…`, (uid) => canEquip(run.roster.find((u) => u.uid === uid)!, id),
            (uid) => `Current: ${esc(WEAPONS[run.roster.find((u) => u.uid === uid)!.weaponId].name)}`);
          if (uid && buyWeapon(run, id, uid)) { this.save(); render(); }
        },
        tonic: async (el) => {
          const s = el.dataset.id as StatKey;
          const uid = await this.unitPicker(`Give ${STAT_LABELS[s]} Tonic to…`, () => true, (uid) => `${STAT_LABELS[s]} ${run.roster.find((u) => u.uid === uid)!.stats[s]}`);
          if (uid && buyTonic(run, s, uid)) { this.save(); render(); }
        },
        relic: (el) => { if (buyRelic(run, el.dataset.id as RelicId)) { this.save(); render(); } },
        revive: (el) => { if (revive(run, el.dataset.id!)) { this.save(); render(); } },
        leave: () => this.finishEvent(),
      });
    };
    render();
  }

  private restScreen() {
    const run = this.run!;
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="page">
          <h1>Campfire</h1>
          <p class="dim center-text">The Rift is quiet tonight. Heroes from six worlds share one fire, and trade stories none of the others quite believe.</p>
          <div class="choice-grid">
            <button class="choice" data-nav="train"><b>☾ Train</b><span>One unit trains through the night and gains a full level.</span></button>
            <button class="choice" data-nav="drill"><b>⚔ Drill</b><span>The whole army spars together: everyone gains 45 XP.</span></button>
          </div>
        </div>
        ${this.partyHtml()}
      </div>`);
    const done = async (ups: LevelUp[]) => {
      this.save();
      await showLevelUps(ups, run.roster);
      this.finishEvent();
    };
    this.on({
      ...this.commonHandlers(),
      train: async () => {
        const uid = await this.unitPicker('Who will train?', (uid) => run.roster.find((u) => u.uid === uid)!.level < 20, (uid) => {
          const u = run.roster.find((x) => x.uid === uid)!;
          return `${hpBar(u.hp, u.stats.hp)}`;
        });
        if (!uid) return;
        const up = restTrain(run, uid);
        await done(up ? [up] : []);
      },
      drill: async () => done(restDrill(run)),
    });
  }

  private treasureScreen() {
    const run = this.run!;
    const ev = run.event as Extract<RunWithEvent['event'], { type: 'treasure' }>;
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>Rift Cache</h1>
        <p class="dim center-text">Debris from a dozen worlds, half-buried in the shardfloor. Something in here still hums with power.</p>
        <div class="choice-grid">${ev.relics.map((r) => `
          <button class="choice" data-nav="take" data-id="${r}"><b>${RELICS[r].icon} ${esc(RELICS[r].name)}</b><span>${esc(RELICS[r].desc)}</span></button>`).join('')}
          <button class="choice" data-nav="gold"><b class="gold">${ev.gold}g</b><span>Leave the relics. Take the coin.</span></button>
        </div>
      </div>`);
    this.on({
      ...this.commonHandlers(),
      take: (el) => { takeTreasure(run, el.dataset.id as RelicId); this.finishEvent(); },
      gold: () => { takeTreasure(run, null); this.finishEvent(); },
    });
  }
}
