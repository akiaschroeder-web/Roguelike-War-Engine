import { ABILITIES, GEAR, ITEMS, CLASSES, COMMANDERS, PERMANENT_ITEMS, REGION_IDS, TEMPLATE_LIST, TEMPLATES, WEAPONS, worldDef } from '../data/registry';
import { canWield, type LevelUp } from '../engine/combat';
import { randomSeed } from '../engine/rng';
import {
  ARMY_CAPACITY, DEPLOY_CAPACITY, advanceRegion, availableNodes, buy, campDrill, campRest, campTrain, currentNode, depthOf, enterNode,
  equipFromConvoy, finishBattle, fountainBless, fountainHeal, fountainRevive, isRegionComplete, loadMeta, loadRun, newRun, offerRegions,
  recruit, recruitLevel, saveMeta, saveRun, canTake, canUseOutside, FREE_FOR_ALL_REGION, isFreeForAll, fountainTeach, unlearnedFairySpells, priceOf, stashGear, stashItem, stashWeapon, useItemOutside, type ItemKindTag, startBattle, takeTreasure, weaponPrice,
  type Meta, type Reward, type RunEvent, type RunWithEvent,
} from '../engine/run';
import { equip } from '../engine/combat';
import { GEAR_SLOTS, PACK_SIZE, type GearSlot, type MapNode, type NodeType, type Unit } from '../engine/types';
import { slotFor } from '../engine/units';
import { BattleView } from './battleView';
import {
  confirmDialog, esc, hpBar, itemLine, itemName, modal, SLOT_ICONS, SLOT_LABELS, showLevelUps, templateCard, token, unitDetails,
} from './components';

const NODE_INFO: Record<NodeType, { icon: string; label: string; desc: string }> = {
  battle: { icon: '⚔', label: 'Battle', desc: 'A standard battle. Earn Rupees and experience.' },
  elite: { icon: '☠', label: 'Elite Battle', desc: 'A dangerous foe and their guard. Better rewards.' },
  recruit: { icon: '✧', label: 'Recruitment', desc: 'Heroes and soldiers offer to join your army.' },
  shop: { icon: '₹', label: 'Merchant', desc: 'Buy weapons, accessories and permanent upgrades.' },
  camp: { icon: '⛺', label: 'Camp', desc: 'Rest, train one unit, or drill the whole army.' },
  fountain: { icon: '❀', label: 'Great Fairy Fountain', desc: 'Full heal, a fairy blessing, or revive the fallen.' },
  treasure: { icon: '◈', label: 'Treasure', desc: 'Claim equipment or a permanent upgrade.' },
  boss: { icon: '♛', label: 'Regional Boss', desc: 'Defeat the region’s commander to march onward.' },
};

type EventOf<T extends RunEvent['type']> = Extract<RunEvent, { type: T }>;

export class App {
  private run: RunWithEvent | null = loadRun();
  private meta: Meta = loadMeta();
  private battleView: BattleView | null = null;
  private handlers: Record<string, (el: HTMLElement) => void> = {};

  constructor(private root: HTMLElement) {
    this.root.addEventListener('click', (e) => {
      const el = (e.target as HTMLElement).closest('[data-nav]') as HTMLElement | null;
      if (!el || el.hasAttribute('disabled')) return;
      this.handlers[el.dataset.nav!]?.(el);
    });
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

  private on(h: Record<string, (el: HTMLElement) => void>) {
    this.handlers = h;
  }

  // ───────────────────────── Title ─────────────────────────

  title() {
    const hasRun = !!this.run;
    this.setScreen(`
      <div class="title-screen">
        <div class="logo"><span>HYRULE</span><small>TACTICAL WAR</small></div>
        <div class="tri">▲<br>▲ ▲</div>
        <p class="tagline">Raise an army from every corner of Hyrule and march through an endless war. Battles get harder the further you go. Fallen heroes stay fallen. How long can you last?</p>
        <div class="menu">
          ${hasRun ? '<button class="btn primary big" data-nav="continue">Continue Campaign</button>' : ''}
          <button class="btn ${hasRun ? '' : 'primary'} big" data-nav="new">New Campaign</button>
          <button class="btn" data-nav="howto">How to Play</button>
          <button class="btn" data-nav="codex">Hyrule Archives</button>
        </div>
        <div class="records dim small">Campaigns ${this.meta.runs} · Furthest region ${this.meta.bestRegion} · Battles reached ${this.meta.bestDepth}</div>
        <div class="dim small fan">Fan project · not affiliated with Nintendo</div>
      </div>`, 'center');
    this.on({
      continue: () => this.resume(),
      new: async () => {
        if (this.run && !(await confirmDialog('Abandon your current campaign?', 'Abandon', 'Keep it'))) return;
        this.chooseCommander();
      },
      howto: () => this.howTo(),
      codex: () => this.codex(),
    });
  }

  private howTo() {
    modal(`
      <h2>How to Play</h2>
      <h3>The campaign</h3>
      <p>The war never ends. Each region is a branching map of battles, elite fights, recruitment, merchants, camps, Great Fairy Fountains and treasure, ending in a regional boss. Then you choose where to march next. Enemies grow stronger with every step. See how far you can get.</p>
      <h3>Battles</h3>
      <ul>
        <li>Tap a unit to see where it can move (blue) and what it can hit (red). Tap a square to move, then choose an action.</li>
        <li>Tap an enemy while a unit is selected to move into range and preview the fight. Units carrying several weapons can switch weapons in the forecast.</li>
        <li><b>Weapon triangle:</b> swords beat axes, axes beat lances, lances beat swords. Slingshots and bows are deadly to fliers. Hammers crush armor.</li>
        <li>Heavy weapons slow you down if their weight is above your CON. If your attack speed is 4+ higher, you strike twice.</li>
        <li><b>Unit size:</b> large units fill 2×2 up to 5×5 squares and need room to move.</li>
        <li>Lava burns everyone but Gorons and fliers. Zora swim through deep water. Kokiri ignore forests.</li>
      </ul>
      <h3>Permadeath and attrition</h3>
      <p>Fallen units are gone unless a Great Fairy revives them. If your <b>Commander</b> falls, the campaign ends. HP carries over between battles, so rest at camps and fountains.</p>
      <button class="btn primary" data-close>Got it</button>`, { dismissable: true });
  }

  private codex() {
    const met = new Set(this.meta.discovered);
    const named = TEMPLATE_LIST.filter((t) => !t.generic);
    modal(`
      <h2>Hyrule Archives</h2>
      <p class="dim small">Characters you've commanded or met: ${named.filter((t) => met.has(t.id)).length}/${named.length}. Bosses defeated: ${this.meta.bossesDefeated.length}.</p>
      <div class="codex-row">${named.map((t) => met.has(t.id)
        ? `<div class="codex-hero">${token({ home: t.home, glyph: t.glyph, team: 'player', portraitId: t.id }, 36)}<div><b>${esc(t.name)}</b><div class="dim small">${esc(t.title)}</div></div></div>`
        : '<div class="codex-hero locked"><span class="token" style="--sz:36px"><b>?</b></span><div class="dim">Unknown</div></div>').join('')}</div>
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
  }

  // ───────────────────────── New run ─────────────────────────

  private chooseCommander() {
    let chosen: string | null = null;
    const render = () => {
      this.setScreen(`
        <div class="page">
          <div class="page-head"><button class="btn" data-nav="back">← Back</button><h1>Choose your Commander</h1><span></span></div>
          <p class="dim center-text">Each commander brings their own army and a special bonus. If the commander falls, the campaign is over.</p>
          <div class="card-grid">${COMMANDERS.map((c) => {
            const t = TEMPLATES[c.heroId];
            const army = c.units.map((id) => TEMPLATES[id]);
            return `<div class="pick ${chosen === c.heroId ? 'chosen' : ''}" data-nav="pick" data-id="${c.heroId}">${templateCard(t, `
              <div class="army-box"><div class="small"><b>${esc(c.armyName)}</b></div>
                <div class="army-tokens">${army.map((a) => `<span title="${esc(a.name)}">${token({ home: a.home, glyph: a.glyph, team: 'player', portraitId: a.id }, 30)}</span>`).join('')}
                  <span class="dim small">${army.map((a) => esc(a.name)).join(', ')}</span></div>
                <div class="small"><span class="badge gold">Bonus</span> ${esc(c.bonusText)}</div>
                ${c.startingItems?.length ? `<div class="small"><span class="dim">Starting gear:</span> ${c.startingItems.map((id) => esc(itemName(id))).join(', ')}</div>` : ''}
                ${c.pendingGear?.length ? `<div class="dim small">Coming later: ${esc(c.pendingGear.join(', '))}</div>` : ''}
              </div>`)}</div>`;
          }).join('')}</div>
          <div class="sticky-bar">${chosen
            ? `<span>Commander: <b>${esc(TEMPLATES[chosen].name)}</b></span><button class="btn primary big" data-nav="start">Begin Campaign →</button>`
            : '<span class="dim">Select a commander above.</span>'}</div>
        </div>`);
      this.on({
        back: () => this.title(),
        pick: (el) => { chosen = el.dataset.id!; const y = window.scrollY; render(); window.scrollTo(0, y); },
        start: () => {
          if (!chosen) return;
          this.run = newRun(randomSeed(), chosen);
          this.meta.runs++;
          this.discover(this.run.roster.map((u) => u.templateId!));
          this.save();
          this.mapScreen();
        },
      });
    };
    render();
  }

  private discover(ids: string[]) {
    for (const id of ids) if (TEMPLATES[id] && !TEMPLATES[id].generic && !this.meta.discovered.includes(id)) this.meta.discovered.push(id);
    saveMeta(this.meta);
  }

  private resume() {
    const run = this.run;
    if (!run) return this.title();
    if (run.battle) return this.battle();
    if (run.event) return this.eventScreen();
    this.mapScreen();
  }

  // ───────────────────────── Map & army ─────────────────────────

  private topBar(): string {
    const run = this.run!;
    const w = worldDef(run.region);
    return `
      <div class="topbar">
        <div><span class="dim small">Region ${run.act}</span> <b style="color:${w.color}">${esc(w.name)}</b></div>
        <div><span class="dim small">Rupees</span> <b class="rupee">₹${run.rupees}</b></div>
        <div><span class="dim small">Army</span> <b>${run.roster.length}/${ARMY_CAPACITY}</b></div>
        <div class="spacer"></div>
        <button class="btn small" data-nav="convoy">Convoy (${run.convoy.length})</button>
        <button class="btn small" data-nav="menu">☰</button>
      </div>`;
  }

  private partyHtml(): string {
    const run = this.run!;
    return `
      <div class="party">
        <h3>Army <span class="dim small">${run.roster.length}/${ARMY_CAPACITY} · deploy ${DEPLOY_CAPACITY}</span></h3>
        ${run.roster.map((u) => `
          <div class="party-row" data-nav="unit" data-uid="${u.uid}">
            ${token(u, 34)}
            <div class="pr-main"><b>${esc(u.name)}</b> <span class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId]?.name ?? '')}</span>
              ${hpBar(u.hp, u.stats.hp)}<div class="dim small">HP ${u.hp}/${u.stats.hp} · ${esc(WEAPONS[u.weapons[0]]?.name ?? '—')}</div></div>
          </div>`).join('')}
        ${run.fallen.length ? `<h4 class="dim">Fallen</h4>${run.fallen.map((u) => `<div class="party-row fallen">${token(u, 26)}<span class="dim small">${esc(u.name)}</span></div>`).join('')}` : ''}
      </div>`;
  }

  /** Handlers shared by every screen that shows the top bar and army panel. */
  private common(rerender: () => void) {
    return {
      menu: () => {
        const m = modal(`<h2>Paused</h2><div class="menu"><button class="btn" data-close>Resume</button><button class="btn" data-k="title">Save & Quit to Title</button><button class="btn danger" data-k="abandon">Abandon Campaign</button></div>`, { dismissable: true });
        m.el.addEventListener('click', async (e) => {
          const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
          if (!k) return;
          m.close();
          if (k.dataset.k === 'title') this.title();
          if (k.dataset.k === 'abandon' && (await confirmDialog('Abandon this campaign?', 'Abandon'))) {
            this.recordEnd();
            this.run = null;
            this.save();
            this.title();
          }
        });
      },
      unit: (el: HTMLElement) => this.unitModal(el.dataset.uid!, rerender),
      convoy: () => this.convoyModal(rerender),
    };
  }

  private unitModal(uid: string, rerender: () => void) {
    const run = this.run!;
    const u = run.roster.find((x) => x.uid === uid);
    if (!u) return;
    const t = u.templateId ? TEMPLATES[u.templateId] : undefined;
    const m = modal(`${unitDetails(u)}
      <h3>Equipment</h3>
      <div class="equip-list">${u.weapons.map((id, i) => `<div class="equip-row"><span>${esc(WEAPONS[id]?.name ?? id)}${i === 0 ? ' <span class="badge eq">E</span>' : ''}</span>
        <span>${i > 0 ? `<button class="btn small" data-k="equip" data-id="${id}">Equip</button>` : ''}${u.weapons.length > 1 ? `<button class="btn small" data-k="stash" data-id="${id}">To convoy</button>` : ''}</span></div>`).join('')}
      </div>
      <h3>Gear</h3>
      <div class="equip-list">${GEAR_SLOTS.map((slot) => {
        const id = u.gear[slot];
        return `<div class="equip-row"><span><span class="dim">${SLOT_ICONS[slot]} ${SLOT_LABELS[slot]}</span> ${id ? esc(itemName(id)) : '<span class="dim">—</span>'}${
          id && slot === 'shield' && WEAPONS[u.weapons[0]]?.twoHanded ? ' <span class="badge">inactive: two-handed weapon</span>' : ''}</span>
          ${id ? `<button class="btn small" data-k="ungear" data-slot="${slot}">To convoy</button>` : ''}</div>`;
      }).join('')}</div>
      <h3>Pack <span class="dim small">${u.pack.length}/${PACK_SIZE}</span></h3>
      <div class="equip-list">${u.pack.length ? u.pack.map((p, i) => {
        const def = ITEMS[p.id];
        const usable = canUseOutside(u, i);
        const label = def?.kind === 'learn' ? 'Learn' : 'Use';
        return `<div class="equip-row"><span>${esc(def?.name ?? p.id)}${p.uses > 1 ? ` ×${p.uses}` : ''} <span class="dim small">${esc(def?.desc ?? '')}</span></span>
          <span>${usable ? `<button class="btn small" data-k="use" data-i="${i}">${label}</button>` : ''}<button class="btn small" data-k="unpack" data-i="${i}">To convoy</button></span></div>`;
      }).join('') : '<div class="dim small">Empty. Buy potions, bombs and Deku Nuts from merchants.</div>'}</div>
      ${t ? `<p class="bio">${esc(t.bio)}</p>` : ''}
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
    m.el.addEventListener('click', (e) => {
      const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
      if (!k) return;
      if (k.dataset.k === 'equip') equip(u, k.dataset.id!);
      if (k.dataset.k === 'stash') stashWeapon(run, uid, k.dataset.id!);
      if (k.dataset.k === 'ungear') stashGear(run, uid, k.dataset.slot as GearSlot);
      if (k.dataset.k === 'unpack') stashItem(run, uid, Number(k.dataset.i));
      if (k.dataset.k === 'use') useItemOutside(run, uid, Number(k.dataset.i));
      this.save();
      m.close();
      rerender();
      this.unitModal(uid, rerender);
    });
  }

  private convoyModal(rerender: () => void) {
    const run = this.run!;
    const m = modal(`<h2>Convoy</h2>
      <p class="dim small">Spare weapons, gear and items. Give them to a unit to use them.</p>
      <div class="shop-list">${run.convoy.length ? run.convoy.map((id, i) => `<div class="shop-item">${itemLine(id)}<button class="btn small" data-k="give" data-i="${i}">Give…</button></div>`).join('') : '<div class="dim">Empty.</div>'}</div>
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
    m.el.addEventListener('click', async (e) => {
      const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
      if (!k) return;
      const i = Number(k.dataset.i);
      const id = run.convoy[i];
      m.close();
      const uid = await this.unitPicker(`Give ${esc(itemName(id))} to…`, (u) => canTake(u, id), (u) => this.itemPreview(u, id));
      if (uid && equipFromConvoy(run, i, uid)) this.save();
      rerender();
      this.convoyModal(rerender);
    });
  }

  private itemPreview(u: Unit, id: string): string {
    if (WEAPONS[id]) return `Carrying ${u.weapons.length}/5${canWield(u, WEAPONS[id]) ? '' : ' · cannot wield'}`;
    const g = GEAR[id];
    if (g) {
      const slot = slotFor(u, g.slot);
      return u.gear[slot] ? `Replaces ${esc(itemName(u.gear[slot]!))}` : `${SLOT_LABELS[slot]} slot empty`;
    }
    if (ITEMS[id]) return u.pack.length >= PACK_SIZE ? 'Pack full: goes to convoy' : `Pack ${u.pack.length}/${PACK_SIZE}`;
    const p = PERMANENT_ITEMS[id];
    if (p) return `${p.stat.toUpperCase()} ${u.stats[p.stat]} → ${u.stats[p.stat] + p.amount}`;
    return '';
  }

  private unitPicker(title: string, eligible: (u: Unit) => boolean, preview: (u: Unit) => string, list?: Unit[]): Promise<string | null> {
    const units = list ?? this.run!.roster;
    return new Promise((resolve) => {
      const m = modal(`<h3>${title}</h3><div class="picker">${units.map((u) => {
        const ok = eligible(u);
        return `<button class="party-row ${ok ? '' : 'disabled'}" ${ok ? `data-uid="${u.uid}"` : 'disabled'}>${token(u, 32)}<div class="pr-main"><b>${esc(u.name)}</b> <span class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId]?.name ?? '')}</span><div class="small dim">${preview(u)}</div></div></button>`;
      }).join('')}</div><button class="btn" data-close>Cancel</button>`, { dismissable: true });
      m.el.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        const row = t.closest('[data-uid]') as HTMLElement | null;
        if (row) { m.close(); resolve(row.dataset.uid!); }
        else if (t.closest('[data-close]') || t === m.el) { m.close(); resolve(null); }
      });
    });
  }

  mapScreen() {
    const run = this.run!;
    const avail = new Set(availableNodes(run).map((n) => n.id));
    const rows: MapNode[][] = [];
    for (const n of run.map.nodes) (rows[n.row] ??= []).push(n);
    const colW = 110, height = 400, padY = 46;
    const width = rows.length * colW + 40;
    const pos = (n: MapNode) => ({ x: 40 + n.row * colW + colW / 2 - 20, y: padY + n.col * (height - padY * 2) });
    const lines = run.map.nodes.flatMap((n) => n.next.map((id) => {
      const m = run.map.nodes.find((x) => x.id === id)!;
      const a = pos(n), c = pos(m);
      const cls = n.visited && m.visited ? 'taken' : n.id === run.currentNodeId && avail.has(m.id) ? 'open' : '';
      return `<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}" class="${cls}" />`;
    }));
    const w = worldDef(run.region);
    const nodes = run.map.nodes.map((n) => {
      const p = pos(n);
      const info = NODE_INFO[n.type];
      const cls = ['n-' + n.type, avail.has(n.id) ? 'avail' : '', n.visited ? 'visited' : '', n.id === run.currentNodeId ? 'current' : ''].join(' ');
      return `<button class="map-node ${cls}" style="left:${p.x}px;top:${p.y}px;--wc:${w.color}" data-nav="${avail.has(n.id) ? 'node' : 'peek'}" data-id="${n.id}" title="${esc(info.label)}"><span>${info.icon}</span></button>`;
    }).join('');
    const depth = (run.act - 1) * 7 + (currentNode(run)?.row ?? -1) + 1;
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="map-main">
          <h2 style="color:${w.color}">${esc(w.name)}</h2>
          <p class="dim small">${esc(w.blurb)} <span class="badge">${esc(w.genre)}</span> <span class="badge">Battle depth ${depth}</span>${isFreeForAll(run) ? ' <span class="badge gold">Free-for-All: enemies come from anywhere</span>' : run.act === FREE_FOR_ALL_REGION - 1 ? ' <span class="badge">Next region: Free-for-All</span>' : ''}</p>
          <div class="map-scroll"><div class="map" style="width:${width}px;height:${height}px"><svg width="${width}" height="${height}">${lines.join('')}</svg>${nodes}</div></div>
          <div class="legend">${(Object.keys(NODE_INFO) as NodeType[]).map((t) => `<span><b>${NODE_INFO[t].icon}</b> ${NODE_INFO[t].label}</span>`).join('')}</div>
          <div class="node-info dim small">Tap a glowing node to travel there.</div>
        </div>
        ${this.partyHtml()}
      </div>`);
    const show = (id: string, go: boolean) => {
      const n = run.map.nodes.find((x) => x.id === id)!;
      const info = NODE_INFO[n.type];
      const el = this.root.querySelector('.node-info') as HTMLElement;
      el.innerHTML = `<b>${info.icon} ${esc(info.label)}</b> — ${esc(info.desc)}${go ? ` <button class="btn primary small" data-nav="go" data-id="${n.id}">Travel →</button>` : ''}`;
      el.classList.remove('dim');
    };
    this.on({
      ...this.common(() => this.mapScreen()),
      peek: (el) => show(el.dataset.id!, false),
      node: (el) => show(el.dataset.id!, true),
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
    this.setScreen('');
    this.battleView = new BattleView(this.root.firstElementChild as HTMLElement, this.run!, () => this.save(), (r) => this.afterBattle(r));
    void this.battleView.mount();
  }

  private recordEnd() {
    const run = this.run;
    if (!run) return;
    const node = currentNode(run);
    this.meta.bestDepth = Math.max(this.meta.bestDepth, node ? depthOf(run, node) + 1 : 0);
    this.meta.bestRegion = Math.max(this.meta.bestRegion, run.act);
    saveMeta(this.meta);
  }

  private afterBattle(result: 'won' | 'lost') {
    const run = this.run!;
    const commanderFell = run.battle!.fallen.some((u) => u.isCommander);
    const bosses = run.battle!.fallen.filter((u) => u.isBoss && u.bossId).map((u) => u.bossId!);
    const summary = finishBattle(run);
    this.recordEnd();
    if (result === 'lost') return this.gameOver(commanderFell ? 'Your Commander has fallen.' : 'Your army was wiped out.');
    for (const id of bosses) if (!this.meta.bossesDefeated.includes(id)) this.meta.bossesDefeated.push(id);
    saveMeta(this.meta);
    this.save();
    this.setScreen(`
      <div class="results">
        <h1 class="win">Victory</h1>
        <div class="res-row"><span>Rupees</span><b class="rupee">+₹${summary.rupees}</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${summary.kills}</b></div>
        ${summary.drops.length ? `<div class="res-drops"><div class="dim small">Boss drop (sent to convoy)</div>${summary.drops.map((d) => `<div>${itemLine(d)}</div>`).join('')}</div>` : ''}
        ${summary.fallen.length ? `<div class="res-fallen"><span class="dim">Fallen:</span> ${summary.fallen.map((u) => `${token(u, 28)} ${esc(u.name)}`).join(' ')}</div>` : '<div class="dim">No losses.</div>'}
        <div class="res-army">${run.roster.map((u) => `<div class="res-unit">${token(u, 36)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} · HP ${u.hp}/${u.stats.hp}</div></div></div>`).join('')}</div>
        <p class="dim small">Units recover 20% HP after each battle (benched units recover more).</p>
        <button class="btn primary big" data-nav="cont">Continue</button>
      </div>`, 'center');
    this.on({ cont: () => this.afterNode() });
  }

  private afterNode() {
    const run = this.run!;
    if (isRegionComplete(run) && run.event?.type !== 'region') {
      offerRegions(run);
      this.save();
    }
    if (run.event) return this.eventScreen();
    this.mapScreen();
  }

  private gameOver(reason: string) {
    const run = this.run!;
    this.run = null;
    this.save();
    this.setScreen(`
      <div class="results">
        <h1 class="lose">Campaign Over</h1>
        <p>${esc(reason)}</p>
        <div class="res-row"><span>Regions reached</span><b>${run.act}</b></div>
        <div class="res-row"><span>Battles fought</span><b>${run.stats.battles}</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${run.stats.kills}</b></div>
        <div class="res-row"><span>Recruits</span><b>${run.stats.recruits}</b></div>
        <div class="res-row"><span>Best ever</span><b>Region ${this.meta.bestRegion}</b></div>
        <button class="btn primary big" data-nav="title">Return to Title</button>
      </div>`, 'center');
    this.on({ title: () => this.title() });
  }

  // ───────────────────────── Events ─────────────────────────

  private eventScreen() {
    const ev = this.run!.event;
    if (!ev) return this.mapScreen();
    switch (ev.type) {
      case 'deploy': return this.deployScreen();
      case 'recruit': return this.recruitScreen();
      case 'shop': return this.shopScreen();
      case 'camp': return this.campScreen();
      case 'fountain': return this.fountainScreen();
      case 'treasure': return this.treasureScreen();
      case 'region': return this.regionScreen();
    }
  }

  private finishEvent() {
    this.run!.event = undefined;
    this.save();
    this.afterNode();
  }

  private deployScreen() {
    const run = this.run!;
    const chosen = new Set(run.roster.filter((u) => u.isCommander).map((u) => u.uid));
    // Default: commander plus the healthiest units.
    for (const u of [...run.roster].sort((a, b) => b.hp / b.stats.hp - a.hp / a.stats.hp)) if (chosen.size < DEPLOY_CAPACITY) chosen.add(u.uid);
    const render = () => {
      this.setScreen(`
        ${this.topBar()}
        <div class="page">
          <h1>Deployment</h1>
          <p class="dim center-text">Choose up to <b>${DEPLOY_CAPACITY}</b> units. Benched units recover extra HP. (${chosen.size}/${DEPLOY_CAPACITY})</p>
          <div class="deploy-grid">${run.roster.map((u) => `
            <button class="deploy ${chosen.has(u.uid) ? 'on' : ''}" data-nav="toggle" data-uid="${u.uid}" ${u.isCommander ? 'disabled' : ''}>
              ${token(u, 40)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId]?.name ?? '')}${u.size > 1 ? ` · Size ${u.size}` : ''}</div>${hpBar(u.hp, u.stats.hp)}<div class="dim small">HP ${u.hp}/${u.stats.hp}</div></div>
            </button>`).join('')}</div>
          <div class="center-text"><button class="btn primary big" data-nav="go">To Battle →</button></div>
        </div>`);
      this.on({
        ...this.common(render),
        toggle: (el) => {
          const uid = el.dataset.uid!;
          if (chosen.has(uid)) chosen.delete(uid);
          else if (chosen.size < DEPLOY_CAPACITY) chosen.add(uid);
          render();
        },
        go: () => { startBattle(run, [...chosen]); this.save(); this.battle(); },
      });
    };
    render();
  }

  private recruitScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'recruit'>;
    ev.offers = ev.offers.filter((id) => TEMPLATES[id]);
    const full = run.roster.length >= ARMY_CAPACITY;
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>Recruitment</h1>
        <p class="dim center-text">${full ? `<b>Your army is full (${ARMY_CAPACITY})</b>. You can only accept supplies (+₹120).` : `Recruits join at <b>Level ${recruitLevel(run)}</b>.`}</p>
        <div class="card-grid">${ev.offers.map((id) => `<div>${templateCard(TEMPLATES[id], full ? '' : `<button class="btn primary wide" data-nav="take" data-id="${id}">Recruit ${esc(TEMPLATES[id].name)}</button>`)}</div>`).join('')}</div>
        <div class="center-text"><button class="btn" data-nav="skip">${full ? 'Take ₹120 and leave' : 'Leave'}</button></div>
      </div>`);
    this.on({
      ...this.common(() => this.recruitScreen()),
      take: (el) => {
        const u = recruit(run, el.dataset.id!);
        if (!u) return;
        this.discover([u.templateId!, ...ev.offers]);
        this.save();
        const m = modal(`<div class="center-text">${token(u, 64)}<h2>${esc(u.name)} joins!</h2><p class="dim">${esc(TEMPLATES[u.templateId!].bio)}</p><button class="btn primary" data-ok>Welcome</button></div>`);
        m.el.addEventListener('click', (e) => {
          if (!(e.target as HTMLElement).closest('[data-ok]')) return;
          m.close();
          this.afterNode();
        });
      },
      skip: () => {
        if (full) run.rupees += 120;
        this.discover(ev.offers);
        this.finishEvent();
      },
    });
  }

  private shopScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'shop'>;
    const render = () => {
      const row = (kind: ItemKindTag, id: string, price: number) => {
        const sold = kind !== 'item' && ev.sold.includes(`${kind}:${id}`);
        return `<div class="shop-item ${sold ? 'sold' : ''}"><div>${itemLine(id)}</div><button class="btn small" data-nav="buy" data-kind="${kind}" data-id="${id}" ${sold || run.rupees < price ? 'disabled' : ''}>${sold ? 'Sold' : `₹${price}`}</button></div>`;
      };
      this.setScreen(`
        ${this.topBar()}
        <div class="map-layout">
          <div class="page">
            <h1>Merchant</h1>
            <p class="dim center-text">“Welcome! Buy somethin’, will ya?”${run.bonus === 'forging' ? ' <span class="badge gold">Goron discount −25% on weapons</span>' : ''}</p>
            <h3>Weapons</h3><div class="shop-list">${ev.weapons.map((id) => row('weapon', id, weaponPrice(run, id))).join('')}</div>
            <h3>Gear</h3><div class="shop-list">${ev.gear.map((id) => row('gear', id, GEAR[id].price)).join('') || '<div class="dim">None in stock.</div>'}</div>
            <h3>Items <span class="dim small">restocked: buy as many as you like</span></h3><div class="shop-list">${ev.items.map((id) => row('item', id, priceOf(run, 'item', id))).join('') || '<div class="dim">None in stock.</div>'}</div>
            <h3>Permanent upgrades</h3><div class="shop-list">${ev.permanents.map((id) => row('permanent', id, PERMANENT_ITEMS[id].price)).join('')}</div>
            <div class="center-text"><button class="btn primary big" data-nav="leave">Leave</button></div>
          </div>
          ${this.partyHtml()}
        </div>`);
      this.on({
        ...this.common(render),
        buy: async (el) => {
          const kind = el.dataset.kind as ItemKindTag;
          const id = el.dataset.id!;
          const uid = await this.unitPicker(`Give ${esc(itemName(id))} to…`, (u) => canTake(u, id), (u) => this.itemPreview(u, id));
          if (uid && buy(run, kind, id, uid)) { this.save(); render(); }
        },
        leave: () => this.finishEvent(),
      });
    };
    render();
  }

  private async afterLevelUps(ups: LevelUp[]) {
    this.save();
    await showLevelUps(ups, this.run!.roster);
    this.finishEvent();
  }

  private campScreen() {
    const run = this.run!;
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="page">
          <h1>Camp</h1>
          <p class="dim center-text">The army makes camp for the night.</p>
          <div class="choice-grid">
            <button class="choice" data-nav="rest"><b>☾ Rest</b><span>Everyone recovers 50% of their max HP.</span></button>
            <button class="choice" data-nav="train"><b>⚔ Train</b><span>One unit trains hard and gains a full level.</span></button>
            <button class="choice" data-nav="drill"><b>⚑ Drill</b><span>The whole army drills together: everyone gains 45 XP.</span></button>
          </div>
        </div>
        ${this.partyHtml()}
      </div>`);
    this.on({
      ...this.common(() => this.campScreen()),
      rest: () => { campRest(run); this.finishEvent(); },
      train: async () => {
        const uid = await this.unitPicker('Who will train?', (u) => u.level < 30, (u) => `Lv ${u.level} → ${u.level + 1}`);
        if (!uid) return;
        const up = campTrain(run, uid);
        await this.afterLevelUps(up ? [up] : []);
      },
      drill: () => this.afterLevelUps(campDrill(run)),
    });
  }

  private fountainScreen() {
    const run = this.run!;
    const canRevive = run.fallen.length > 0 && run.roster.length < ARMY_CAPACITY;
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="page">
          <h1>Great Fairy Fountain</h1>
          <p class="dim center-text">Laughter echoes off the water. The Great Fairy offers one gift.</p>
          <div class="choice-grid">
            <button class="choice" data-nav="heal"><b>❀ Healing</b><span>Fully restore the HP of your entire army.</span></button>
            <button class="choice" data-nav="bless"><b>✧ Blessing</b><span>One unit receives a random permanent enhancement.</span></button>
            <button class="choice" data-nav="teach"><b>✦ Magic</b><span>The Great Fairy teaches a unit one of her spells: Din's Fire, Farore's Wind or Nayru's Love.</span></button>
            <button class="choice" data-nav="revive" ${canRevive ? '' : 'disabled'}><b>☥ Revival</b><span>${run.fallen.length ? 'Bring one fallen ally back at full HP.' : 'No fallen allies.'}</span></button>
          </div>
        </div>
        ${this.partyHtml()}
      </div>`);
    this.on({
      ...this.common(() => this.fountainScreen()),
      heal: () => { fountainHeal(run); this.finishEvent(); },
      bless: async () => {
        const uid = await this.unitPicker('Who receives the blessing?', () => true, (u) => `Lv ${u.level}`);
        if (!uid) return;
        const id = fountainBless(run, uid);
        this.save();
        const m = modal(`<div class="center-text"><h2>Blessing received</h2><p>${id ? itemLine(id) : ''}</p><button class="btn primary" data-ok>Thank you</button></div>`);
        m.el.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-ok]')) { m.close(); this.finishEvent(); } });
      },
      teach: async () => {
        const uid = await this.unitPicker('Who receives the Great Fairy\'s magic?', (u) => unlearnedFairySpells(u).length > 0, (u) => `MP ${u.stats.mp} · ${unlearnedFairySpells(u).length} spell(s) left to learn`);
        if (!uid) return;
        const id = fountainTeach(run, uid);
        this.save();
        const m = modal(`<div class="center-text"><h2>A new spell!</h2><p><b>${esc(id ? ABILITIES[id].name : '')}</b></p><p class="dim">${esc(id ? ABILITIES[id].desc : '')}</p><button class="btn primary" data-ok>Thank you</button></div>`);
        m.el.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-ok]')) { m.close(); this.finishEvent(); } });
      },
      revive: async () => {
        const uid = await this.unitPicker('Who returns?', () => true, (u) => `Lv ${u.level}`, run.fallen);
        if (uid && fountainRevive(run, uid)) this.finishEvent();
      },
    });
  }

  private treasureScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'treasure'>;
    const label = (r: Reward) => ({ weapon: 'Weapon', gear: 'Gear', item: 'Item', permanent: 'Permanent upgrade' })[r.kind];
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>Treasure Chest</h1>
        <p class="dim center-text">Da-na-na-naaa! Choose one.${run.bonus === 'extraTreasure' ? ' <span class="badge gold">Hero’s Expedition: +1 choice</span>' : ''}</p>
        <div class="choice-grid">${ev.rewards.map((r, i) => `<button class="choice" data-nav="take" data-i="${i}"><span class="badge">${label(r)}</span>${itemLine(r.id)}</button>`).join('')}
          <button class="choice" data-nav="rupees"><b class="rupee">₹${ev.rupees}</b><span>Take the Rupees instead.</span></button>
        </div>
      </div>`);
    this.on({
      ...this.common(() => this.treasureScreen()),
      take: async (el) => {
        const i = Number(el.dataset.i);
        const r = ev.rewards[i];
        const uid = await this.unitPicker(`Give ${esc(itemName(r.id))} to…`, (u) => canTake(u, r.id), (u) => this.itemPreview(u, r.id));
        if (!uid) return;
        if (takeTreasure(run, i, uid)) this.finishEvent();
      },
      rupees: () => { takeTreasure(run, null, null); this.finishEvent(); },
    });
  }

  private regionScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'region'>;
    this.setScreen(`
      <div class="page">
        <h1>Region ${run.act} cleared!</h1>
        <p class="dim center-text">The regional boss has fallen. Where will the army march next? Enemies grow stronger with every region. You receive <b class="rupee">₹150</b> in spoils.</p>
        <div class="choice-grid">${ev.options.map((id) => {
          const w = worldDef(id);
          return `<button class="choice region" style="--wc:${w.color}" data-nav="go" data-id="${id}"><b style="color:${w.color}">${esc(w.name)}</b><span class="badge">${esc(w.genre)}</span><span>${esc(w.blurb)}</span></button>`;
        }).join('')}</div>
        <p class="dim small center-text">${REGION_IDS.length} regions in the Ocarina of Time pack. They repeat, harder each time.</p>
      </div>`);
    this.on({
      go: (el) => {
        advanceRegion(run, el.dataset.id!);
        this.save();
        this.mapScreen();
      },
    });
  }
}
