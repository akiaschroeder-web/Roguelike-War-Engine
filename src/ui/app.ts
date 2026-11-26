import { imgUrl } from './media';
import { TEARS_NEEDED, twilightOf } from '../engine/twilightRun';
import { TWILIT_PROVINCES } from '../content/twilight';
import { availableRecipes, craft, materialBag, questCount, recipeCost, recipeHolders, repairShield, shieldRepairCost } from '../engine/skywardRun';
import { packSize } from '../engine/units';
import { shieldDurability } from '../engine/skyward';
import { doWildCamp, FACILITIES, wildCampOptions, wildOf, wildStatus } from '../engine/wildRun';
import { ABILITIES, artFor, BOSSES, ENEMIES, GEAR, QUEST_ITEMS, ITEMS, CLASSES, COMMANDERS, PERMANENT_ITEMS, REGION_IDS, TEMPLATE_LIST, TEMPLATES, WEAPONS, worldDef, WORLDS, ART_VARIANTS } from '../data/registry';
import { canWield, type LevelUp } from '../engine/combat';
import { randomSeed } from '../engine/rng';
import {
  advanceRegion, buySupplies, supplyPrice, give, clockLabel, songOfTimeReset, TERMINA_SCHEDULE, deposit, withdraw, returnStrayFairy, strayFairyCount, campFeast, commanderOf, FEAST_COST, improveMaterials, reviveWithDust, SUPPLY_PACK, availableNodes, buy, campDrill, campRest, campTrain, currentNode, depthOf, enterNode,
  equipFromConvoy, finishBattle, fountainBless, fountainHeal, fountainRevive, isRegionComplete, loadMeta, loadRun, newRun, offerRegions,
  recruit, recruitLevel, saveMeta, saveRun, canTake, canUseOutside, forgePrice, forgeWeapon, improveCost, improveWeapon, MAX_FORGE, repairCost, repairWeapon, FREE_FOR_ALL_REGION, isFreeForAll, fountainTeach, unlearnedFairySpells, priceOf, stashGear, stashItem, stashWeapon, useItemOutside, type ItemKindTag, startBattle, takeTreasure,
  canChoose, chooseEvent, descendDungeon, eventDef, leaveDungeon, fleetCrew, isNavalNode, ownedGear, vesselHasSlot,
  type Meta, type Reward, type RunEvent, type RunWithEvent,
  TOUR_NAMES,
} from '../engine/run';
import { equip } from '../engine/combat';
import { saveStatus } from '../storage';
import { GEAR_SLOTS, type GearSlot, type MapNode, type NodeType, type TourCampaign, type Unit } from '../engine/types';
import { forgeLevel, slotFor } from '../engine/units';
import { maxRank, pointCap, rankOf } from '../engine/supports';
import { GROUP_SUPPORTS, PAIR_BONUSES, canonOf, formPairs, pairDef, pairKey } from '../content/supports';
import { BattleView } from './battleView';
import { CHART_SIZE, fleetCap, lockReason, navalDeployCap, sectorName, seaOf } from '../engine/sea';
import { capacityOf, isVessel } from '../engine/naval';
import { audioSettings, music, setAudio, sfx } from './audio';
import {
  applyMetaToRun, awardMedals, BOUNTIES, bump, buyUpgrade, claimBounties, FORMATIONS, HERO_COST, heroCandidates, KITS, medalsForRun, setMax, TRIALS,
  trialMultiplier, unlockFormation, unlockHero, unlockKit, upgradeCost, upgradeLevel, UPGRADES, type RunChoices,
} from '../engine/meta';
import { RNG } from '../engine/rng';
import { rollLevelUp } from '../engine/units';
import { conversationFor, type ConvoRank } from '../content/ocarina/conversations';
import { armyCap, armyOf, BLESSINGS, cpMax, deployCap, moraleBonus, moraleLabel, ORDERS, ordersFor, repDiscount, supplyCap, useBlessing, xpToNext } from '../engine/army';
import {
  confirmDialog, esc, hpBar, itemLine, itemName, modal, SLOT_ICONS, SLOT_LABELS, weaponLine, showLevelUps, templateCard, token, unitDetails,
  portraitIdOf,
} from './components';

const NODE_INFO: Record<NodeType, { icon: string; label: string; desc: string }> = {
  battle: { icon: '⚔', label: 'Battle', desc: 'A standard battle. Earn Rupees and experience.' },
  elite: { icon: '☠', label: 'Elite Battle', desc: 'A dangerous foe and their guard. Better rewards.' },
  ambush: { icon: '⚡', label: 'Ambush', desc: 'The enemy springs a trap: they start on your flank and strike first. Better pay.' },
  siege: { icon: '🏰', label: 'Siege', desc: 'Storm a walled keep and seize its throne.' },
  dungeon: { icon: '⛓', label: 'Dungeon', desc: `${3} battles in a row with no rest in between, then a rich vault.` },
  event: { icon: '?', label: 'Event', desc: 'Something happens on the road. Choose wisely.' },
  recruit: { icon: '✧', label: 'Recruitment', desc: 'Heroes and soldiers offer to join your army.' },
  shop: { icon: '₹', label: 'Merchant', desc: 'Buy weapons, accessories and permanent upgrades.' },
  camp: { icon: '⛺', label: 'Camp', desc: 'Rest, train one unit, or drill the whole army.' },
  fountain: { icon: '❀', label: 'Great Fairy Fountain', desc: 'Full heal, a fairy blessing, or revive the fallen.' },
  treasure: { icon: '◈', label: 'Treasure', desc: 'Claim equipment or a permanent upgrade.' },
  blacksmith: { icon: '⚒', label: 'Blacksmith', desc: 'Repair worn weapons, improve them (+1 Might), or forge new ones.' },
  boss: { icon: '♛', label: 'Regional Boss', desc: 'Defeat the region’s commander to march onward.' },
  sea: { icon: '≈', label: 'Open Sea', desc: 'Empty water. Sailing on costs a day’s supplies.' },
};

type EventOf<T extends RunEvent['type']> = Extract<RunEvent, { type: T }>;
const VESSEL_SLOT_SET = new Set<string>(['hull', 'sail', 'utility', 'flag']);

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
    music('title');
    const hasRun = !!this.run;
    this.setScreen(`
      <div class="title-screen">
        <div class="logo"><span>HYRULE</span><small>TACTICAL WAR</small></div>
        <div class="tri">▲<br>▲ ▲</div>
        <p class="tagline">Raise an army from every corner of Hyrule and march through an endless war. Battles get harder the further you go. Fallen heroes stay fallen. How long can you last?</p>
        <div class="menu">
          ${hasRun ? '<button class="btn primary big" data-nav="continue">Continue Campaign</button>' : ''}
          <button class="btn ${hasRun ? '' : 'primary'} big" data-nav="new">New Campaign</button>
          <button class="btn" data-nav="sanctuary">🏛 Sanctuary <span class="dim">· ${this.meta.medals} Hero Medals</span></button>
          <button class="btn" data-nav="sound">🔊 Sound</button>
          <button class="btn" data-nav="howto">How to Play</button>
          <button class="btn" data-nav="codex">Hyrule Archives</button>
        </div>
        <div class="records dim small">Campaigns ${this.meta.runs} · Furthest region ${this.meta.bestRegion} · Battles reached ${this.meta.bestDepth}</div>
        <div class="dim small save-status">${saveStatus() === 'local' ? '💾 Saves are kept in this browser only' : saveStatus() === 'error' ? '⚠ Cloud save is retrying — your progress is also kept in this browser' : '☁ Saves are kept with your account and survive closing the page'}</div>
        <div class="dim small fan">Fan project · not affiliated with Nintendo</div>
      </div>`, 'center');
    this.on({
      continue: () => this.resume(),
      new: async () => {
        if (this.run && !(await confirmDialog('Abandon your current campaign? You still earn Hero Medals for how far you got.', 'Abandon', 'Keep it'))) return;
        if (this.run) { this.recordEnd(); this.endCampaign(this.run); this.run = null; this.save(); }
        this.chooseCommander();
      },
      howto: () => this.howTo(),
      codex: () => this.codex(),
      sanctuary: () => this.sanctuary(),
      sound: () => this.soundModal(),
    });
  }

  private soundModal() {
    const a = audioSettings();
    const m = modal(`
      <h2>Sound</h2>
      <div class="opt-row"><span>Sound effects</span><input type="range" min="0" max="100" value="${Math.round(a.sfx * 100)}" data-vol="sfx"></div>
      <div class="opt-row"><span>Music</span><input type="range" min="0" max="100" value="${Math.round(a.music * 100)}" data-vol="music"></div>
      <div class="opt-row"><label><input type="checkbox" data-mute ${a.muted ? 'checked' : ''}> Mute everything</label></div>
      <p class="dim small">Music plays from files in the game's <code>music/</code> folder (title, map, battle, boss, victory, gameover, camp, shop, termina, moon). Tracks that aren't there are simply silent.</p>
      <div class="center-text"><button class="btn primary" data-close>Done</button></div>`, { dismissable: true });
    m.el.querySelectorAll<HTMLInputElement>('[data-vol]').forEach((r) => r.addEventListener('input', () => { setAudio({ [r.dataset.vol!]: Number(r.value) / 100 }); if (r.dataset.vol === 'sfx') sfx('tick'); }));
    m.el.querySelector<HTMLInputElement>('[data-mute]')?.addEventListener('change', (e) => setAudio({ muted: (e.target as HTMLInputElement).checked }));
  }

  // ───────────────────────── Sanctuary (between campaigns) ─────────────────────────

  private sanctuary(tab = 'statue') {
    const p = this.meta;
    const fresh = claimBounties(p);
    if (fresh.length) saveMeta(p);
    const tabs: [string, string][] = [['statue', '🗿 Goddess Statue'], ['heroes', '🛡 Hall of Heroes'], ['treasury', '💰 Royal Treasury'], ['academy', '⚔ Military Academy'], ['bounty', '📜 Bounty Board'], ['trials', '⏳ Chamber of Trials']];
    let body = '';
    if (tab === 'statue') {
      body = `<p class="dim">Permanent upgrades for every future campaign.</p><div class="shop-list">${UPGRADES.map((u) => {
        const lvl = upgradeLevel(p, u.id);
        const cost = upgradeCost(p, u.id);
        return `<div class="shop-item"><div><b>${esc(u.name)}</b> <span class="dim small">Lv ${lvl}/${u.costs.length}</span><div class="dim small">${esc(u.desc)}</div></div>
          <button class="btn small" data-nav="buyup" data-id="${u.id}" ${cost === null || p.medals < cost ? 'disabled' : ''}>${cost === null ? 'Maxed' : `🏅 ${cost}`}</button></div>`;
      }).join('')}</div>`;
    } else if (tab === 'heroes') {
      const cands = heroCandidates(p.discovered, p);
      body = `<p class="dim">Unlock characters you've met so one of them can join you at the start of a campaign (🏅 ${HERO_COST} each).</p>
        ${p.heroes.length ? `<h3>Unlocked</h3><div class="army-tokens">${p.heroes.map((id) => `<span title="${esc(TEMPLATES[id]?.name ?? id)}">${token({ home: TEMPLATES[id].home, glyph: TEMPLATES[id].glyph, team: 'player', portraitId: id }, 36)}</span>`).join('')}</div>` : ''}
        <h3>Available</h3><div class="shop-list">${cands.map((id) => `<div class="shop-item"><div>${token({ home: TEMPLATES[id].home, glyph: TEMPLATES[id].glyph, team: 'player', portraitId: id }, 28)} <b>${esc(TEMPLATES[id].name)}</b> <span class="dim small">${esc(TEMPLATES[id].title)}</span></div>
          <button class="btn small" data-nav="hero" data-id="${id}" ${p.medals < HERO_COST ? 'disabled' : ''}>🏅 ${HERO_COST}</button></div>`).join('') || '<div class="dim">Meet more characters in your campaigns to unlock them here.</div>'}</div>`;
    } else if (tab === 'treasury') {
      body = `<p class="dim">Starting kits: pick one when you begin a campaign.</p><div class="shop-list">${KITS.map((k) => `<div class="shop-item"><div><b>${esc(k.name)}</b><div class="dim small">${esc(k.desc)}</div></div>
        ${p.kits.includes(k.id) ? '<span class="badge gold">Unlocked</span>' : `<button class="btn small" data-nav="kit" data-id="${k.id}" ${p.medals < k.cost ? 'disabled' : ''}>🏅 ${k.cost}</button>`}</div>`).join('')}</div>`;
    } else if (tab === 'academy') {
      body = `<p class="dim">Starting formations: pick one when you begin a campaign.</p><div class="shop-list">${FORMATIONS.map((f) => `<div class="shop-item"><div><b>${esc(f.name)}</b><div class="dim small">${esc(f.desc)}</div></div>
        ${p.formations.includes(f.id) ? '<span class="badge gold">Unlocked</span>' : `<button class="btn small" data-nav="formation" data-id="${f.id}" ${p.medals < f.cost ? 'disabled' : ''}>🏅 ${f.cost}</button>`}</div>`).join('')}</div>`;
    } else if (tab === 'bounty') {
      body = `<p class="dim">Challenges that pay Hero Medals once. Progress counts across all campaigns.</p><div class="shop-list">${BOUNTIES.map((b) => `<div class="shop-item ${p.bounties.includes(b.id) ? 'sold' : ''}"><div><b>${esc(b.name)}</b><div class="dim small">${esc(b.desc)}</div></div>
        <span>${p.bounties.includes(b.id) ? '✔ Claimed' : `🏅 ${b.reward}`}</span></div>`).join('')}</div>`;
    } else {
      body = `<p class="dim">Optional modifiers, chosen when you begin a campaign. Each one makes the war harder and raises the Hero Medals you earn.</p><div class="shop-list">${TRIALS.map((t) => `<div class="shop-item"><div><b>${esc(t.name)}</b><div class="dim small">${esc(t.desc)}</div></div><span class="badge">+${Math.round(t.mult * 100)}% medals</span></div>`).join('')}</div>`;
    }
    this.setScreen(`
      <div class="page">
        <div class="page-head"><button class="btn" data-nav="back">← Back</button><h1>Sanctuary</h1><span class="badge gold">🏅 ${p.medals} Hero Medals</span></div>
        ${fresh.length ? `<p class="center-text win">Bounties claimed: ${fresh.map((b) => `${esc(b.name)} (+${b.reward})`).join(', ')}</p>` : ''}
        <p class="dim center-text">Hero Medals are earned when a campaign ends (more for going further). Spend them here on lasting upgrades.</p>
        <div class="tabs">${tabs.map(([id, label]) => `<button class="btn ${tab === id ? 'primary' : ''}" data-nav="tab" data-id="${id}">${label}</button>`).join('')}</div>
        ${body}
      </div>`);
    const buy = (ok: boolean) => { if (ok) { saveMeta(p); this.sanctuary(tab); } };
    this.on({
      back: () => this.title(),
      tab: (el) => this.sanctuary(el.dataset.id!),
      buyup: (el) => buy(buyUpgrade(p, el.dataset.id!)),
      hero: (el) => buy(unlockHero(p, el.dataset.id!)),
      kit: (el) => buy(unlockKit(p, el.dataset.id!)),
      formation: (el) => buy(unlockFormation(p, el.dataset.id!)),
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
      <h3>Turn order</h3>
      <p>Player Phase → Allied Phase (friendly NPCs in green act on their own) → Enemy Phase → Environment Phase (fire spreads, Magic Beans grow, weather shifts).</p>
      <h3>The battlefield</h3>
      <ul>
        <li><b>Fog</b> hides enemies beyond your units' sight. Some ghosts and undead are <b>invisible</b> until you get close or use the Lens of Truth.</li>
        <li>Bombs break <b>cracked walls</b>. The <b>Song of Time</b> moves Time Blocks. Hidden <b>spike traps</b> hurt and root; buried treasure waits for a Shovel.</li>
        <li>The <b>Hookshot</b> pulls you across water and gaps to trees, walls and units. You can still attack afterwards.</li>
      </ul>
      <h3>Your army</h3>
      <ul>
        <li><b>Orders</b> cost Command Points: Rally, Focus Fire, Reinforce and more, depending on your Commander. They don't use up anyone's turn.</li>
        <li><b>Supplies</b> are eaten after every battle; run out and the army goes hungry. <b>Morale</b> gives the whole army Hit/Avoid. <b>Reputation</b> lowers prices. <b>Materials</b> improve weapons. <b>Fairy Dust</b> revives the fallen at camp. <b>Sacred Energy</b> buys blessings.</li>
        <li>Allies who fight side by side build <b>supports</b>; read their conversations from the unit screen.</li>
      </ul>
      <h3>Between campaigns</h3>
      <p>When a campaign ends you earn <b>Hero Medals</b>. Spend them in the <b>Sanctuary</b>: permanent upgrades, starting companions, kits and formations, bounties, and optional Trials for bigger rewards.</p>
      <h3>Permadeath and attrition</h3>
      <p>Fallen units are gone unless a Great Fairy revives them. If your <b>Commander</b> falls, the campaign ends. HP carries over between battles, so rest at camps and fountains.</p>
      <button class="btn primary" data-close>Got it</button>`, { dismissable: true });
  }

  private codex(tab = 'heroes') {
    const p = this.meta;
    const met = new Set(p.discovered);
    const named = TEMPLATE_LIST.filter((t) => !t.generic);
    const tt = (id: string) => TEMPLATES[id];
    const tabs: [string, string][] = [['heroes', 'Characters'], ['enemies', 'Enemies'], ['items', 'Items'], ['convos', 'Conversations']];
    let body = '';
    if (tab === 'heroes') {
      body = `<p class="dim small">Characters you've commanded or met: ${named.filter((t) => met.has(t.id)).length}/${named.length}. Bosses defeated: ${p.bossesDefeated.length}.</p>
      <div class="codex-row">${named.map((t) => met.has(t.id)
        ? `<div class="codex-hero">${token({ home: t.home, glyph: t.glyph, team: 'player', portraitId: t.id }, 36)}<div><b>${esc(t.name)}</b><div class="dim small">${esc(t.title)}</div></div></div>`
        : '<div class="codex-hero locked"><span class="token" style="--sz:36px"><b>?</b></span><div class="dim">Unknown</div></div>').join('')}</div>`;
    } else if (tab === 'enemies') {
      const all = [...Object.values(ENEMIES).map((e) => ({ id: e.id, name: e.name, kind: 'Monster' })), ...Object.values(BOSSES).map((b) => ({ id: b.id, name: b.name, kind: 'Boss' }))];
      const seen = new Set(p.enemiesSeen);
      body = `<p class="dim small">Foes faced: ${all.filter((e) => seen.has(e.id)).length}/${all.length}</p><div class="codex-row">${all.map((e) => seen.has(e.id)
        ? `<div class="codex-hero">${token({ home: 'hyruleField', glyph: e.name[0], team: 'enemy', portraitId: e.id }, 36)}<div><b>${esc(e.name)}</b><div class="dim small">${e.kind}</div></div></div>`
        : '<div class="codex-hero locked"><span class="token" style="--sz:36px"><b>?</b></span><div class="dim">Unknown</div></div>').join('')}</div>`;
    } else if (tab === 'items') {
      const all = [...Object.keys(WEAPONS).filter((id) => WEAPONS[id].type !== 'natural'), ...Object.keys(GEAR), ...Object.keys(ITEMS)];
      const seen = new Set(p.itemsSeen);
      body = `<p class="dim small">Equipment and items found: ${all.filter((id) => seen.has(id)).length}/${all.length}</p><div class="shop-list">${all.filter((id) => seen.has(id)).map((id) => `<div class="shop-item"><div>${itemLine(id)}</div></div>`).join('') || '<div class="dim">Nothing yet.</div>'}</div>`;
    } else {
      body = `<p class="dim small">Support conversations you've read: ${p.convos.length}</p><div class="shop-list">${p.convos.map((k, i) => {
        const [a, b, r] = k.split('|');
        return `<div class="shop-item"><div><b>${esc(tt(a)?.name ?? a)} & ${esc(tt(b)?.name ?? b)}</b> <span class="badge">${r}</span></div><button class="btn small" data-k="read" data-i="${i}">💬 Read</button></div>`;
      }).join('') || '<div class="dim">Build supports in battle, then read their conversations from the unit screen.</div>'}</div>`;
    }
    const m = modal(`
      <h2>Hyrule Archives</h2>
      <div class="tabs">${tabs.map(([id, label]) => `<button class="btn small ${tab === id ? 'primary' : ''}" data-k="tab" data-id="${id}">${label}</button>`).join('')}</div>
      ${body}
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
    m.el.addEventListener('click', (e) => {
      const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
      if (!k) return;
      if (k.dataset.k === 'tab') { m.close(); this.codex(k.dataset.id!); }
      if (k.dataset.k === 'read') {
        const [a, b, r, form] = p.convos[Number(k.dataset.i)].split('|');
        const ta = tt(a), tb = tt(b);
        if (!ta || !tb) return;
        const { lines, swap } = conversationFor(a, b, r as ConvoRank, { a: ta.name, b: tb.name }, form);
        modal(`<h2>${esc(ta.name)} & ${esc(tb.name)} <span class="dim small">Support ${r}</span></h2>
          <div class="convo">${lines.map(([sp, text]) => {
            if (sp === 'n') return `<div class="convo-narration">${esc(text)}</div>`;
            const t = (sp === 'a') !== swap ? ta : tb;
            return `<div class="convo-line ${t === ta ? 'left' : 'right'}">${token({ home: t.home, glyph: t.glyph, team: 'player', portraitId: t.id }, 40)}<div class="bubble"><b>${esc(t.name)}</b><div>${esc(text)}</div></div></div>`;
          }).join('')}</div><div class="center-text"><button class="btn primary" data-close>Close</button></div>`, { dismissable: true });
      }
    });
  }


  // ───────────────────────── New run ─────────────────────────

  private chooseCommander() {
    let chosen: string | null = null;
    const p = this.meta;
    const choices: RunChoices = { trials: [] };
    const render = () => {
      this.setScreen(`
        <div class="page">
          <div class="page-head"><button class="btn" data-nav="back">← Back</button><h1>Choose your Commander</h1><span></span></div>
          <p class="dim center-text">Each commander brings their own army and a special bonus. If the commander falls, the campaign is over.</p>
          ${(['hyrule', 'termina', 'greatSea', 'twilight', 'skyward', 'wild', 'original'] as const).map((pack) => `<h2 class="pack-head">${pack === 'hyrule' ? 'Ocarina of Time · Hyrule' : pack === 'termina' ? "Majora's Mask · Termina" : pack === 'greatSea' ? 'The Wind Waker · The Great Sea' : pack === 'twilight' ? 'Twilight Princess · Twilight Hyrule' : pack === 'skyward' ? 'Skyward Sword · The Sky' : pack === 'wild' ? 'Era of the Wild · Hyrule Reborn' : 'The Legend of Zelda · Original Hyrule'}</h2>
          <div class="card-grid">${COMMANDERS.filter((c) => (c.campaign ?? 'hyrule') === pack).map((c) => {
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
          }).join('')}</div>`).join('')}
          ${`
          <div class="run-options">
            <h3>Campaign options</h3>
            <div class="opt-row"><span class="dim small">Campaign</span><select data-opt="campaign">
              <option value="">Commander's home${chosen ? ` (${({ hyrule: 'Hyrule', termina: 'Termina', greatSea: 'the Great Sea', twilight: 'Twilight Hyrule', skyward: 'the Sky', wild: 'Hyrule Reborn', original: 'Original Hyrule' } as const)[COMMANDERS.find((c) => c.heroId === chosen)?.campaign ?? 'hyrule']})` : ''}</option>
              <option value="hyrule" ${choices.campaign === 'hyrule' ? 'selected' : ''}>Hyrule: the endless war</option>
              <option value="termina" ${choices.campaign === 'termina' ? 'selected' : ''}>Termina: three days until the Moon falls</option>
              <option value="greatSea" ${choices.campaign === 'greatSea' ? 'selected' : ''}>The Great Sea: sail a 7×7 chart of islands and fleets</option>
              <option value="twilight" ${choices.campaign === 'twilight' ? 'selected' : ''}>Twilight Hyrule: restore the Light Spirits</option>
              <option value="skyward" ${choices.campaign === 'skyward' ? 'selected' : ''}>The Sky: from Skyloft to the Demon's Realm</option>
              <option value="wild" ${choices.campaign === 'wild' ? 'selected' : ''}>Hyrule Reborn: surface, sky and Depths, under the Blood Moon</option>
              <option value="original" ${choices.campaign === 'original' ? 'selected' : ''}>Original Hyrule: the nine Levels and the Triforce of Wisdom</option>
              <option value="random" ${choices.campaign === 'random' ? 'selected' : ''}>Random: any region, any enemy, any event</option>
              <option value="worldTour" ${choices.campaign === 'worldTour' ? 'selected' : ''}>World Tour: every campaign in turn, a few regions in each</option></select></div>
            ${choices.campaign === 'worldTour' ? `<div class="opt-row"><span class="dim small">World Tour: regions per campaign</span><select data-opt="tourActs">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${(choices.tourActs ?? '2') === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>` : ''}
            ${p.heroes.length ? `<div class="opt-row"><span class="dim small">Companion (Hall of Heroes)</span><select data-opt="hero"><option value="">None</option>${p.heroes.map((id) => `<option value="${id}" ${choices.hero === id ? 'selected' : ''}>${esc(TEMPLATES[id]?.name ?? id)}</option>`).join('')}</select></div>` : ''}
            ${p.kits.length ? `<div class="opt-row"><span class="dim small">Starting kit (Royal Treasury)</span><select data-opt="kit"><option value="">None</option>${KITS.filter((k) => p.kits.includes(k.id)).map((k) => `<option value="${k.id}" ${choices.kit === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select></div>` : ''}
            ${p.formations.length ? `<div class="opt-row"><span class="dim small">Formation (Military Academy)</span><select data-opt="formation"><option value="">Standard</option>${FORMATIONS.filter((f) => p.formations.includes(f.id)).map((f) => `<option value="${f.id}" ${choices.formation === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></div>` : ''}
            <div class="opt-row"><span class="dim small">Trials (Chamber of Trials)</span><span class="trial-list">${TRIALS.map((t) => `<label class="small" title="${esc(t.desc)}"><input type="checkbox" data-trial="${t.id}" ${choices.trials!.includes(t.id) ? 'checked' : ''}> ${esc(t.name)}</label>`).join(' ')}</span></div>
            <div class="dim small">Medal multiplier: ×${trialMultiplier(choices.trials).toFixed(2)}</div>
          </div>`}
          <div class="sticky-bar">${chosen
            ? `<span>Commander: <b>${esc(TEMPLATES[chosen].name)}</b></span><button class="btn primary big" data-nav="start">Begin Campaign →</button>`
            : '<span class="dim">Select a commander above.</span>'}</div>
        </div>`);
      this.on({
        back: () => this.title(),
        pick: (el) => { chosen = el.dataset.id!; const y = window.scrollY; render(); window.scrollTo(0, y); },
        start: () => {
          if (!chosen) return;
          this.run = newRun(randomSeed(), chosen, choices.campaign, Number(choices.tourActs ?? 2));
          const run = this.run;
          applyMetaToRun(run, p, choices,
            (id) => { recruit(run, id); run.event = undefined; },
            (id) => { const taker = run.roster.find((u) => canTake(u, id)); if (!taker || !give(run, id, taker.uid)) run.convoy.push(id); },
            (levels) => { for (const u of run.roster) for (let i = 0; i < levels; i++) { const rng = new RNG(run.rngState + i * 7 + u.uid.length); rollLevelUp(u, rng); } },
          );
          this.meta.runs++;
          this.discover(this.run.roster.map((u) => u.templateId!));
          this.save();
          this.mapScreen();
        },
      });
      this.root.querySelectorAll<HTMLSelectElement>('[data-opt]').forEach((sel) => sel.addEventListener('change', () => {
        (choices as Record<string, unknown>)[sel.dataset.opt!] = sel.value || undefined;
        if (sel.dataset.opt === 'campaign') { const y = window.scrollY; render(); window.scrollTo(0, y); }
      }));
      this.root.querySelectorAll<HTMLInputElement>('[data-trial]').forEach((cb) => cb.addEventListener('change', () => {
        const id = cb.dataset.trial!;
        choices.trials = cb.checked ? [...choices.trials!, id] : choices.trials!.filter((t) => t !== id);
        const y = window.scrollY; render(); window.scrollTo(0, y);
      }));
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
        <div><span class="dim small">Army</span> <b>${run.roster.length}/${armyCap(run)}</b></div>
        <div class="tb-res"><span class="dim small">Supplies</span> <b class="${armyOf(run).supplies < 5 ? 'bad' : ''}">${armyOf(run).supplies}</b></div>
        <div class="tb-res"><span class="dim small">Morale</span> <b>${armyOf(run).morale}</b></div>
        ${run.sea ? (() => { const sea = seaOf(run); const ships = run.roster.filter(isVessel); return `<div class="tb-res" title="Fleet: vessels owned / Fleet Capacity. Deploy: vessels per sea battle. Crew: passengers they carry."><span class="dim small">Fleet</span> <b>${ships.length}/${fleetCap(run)}</b> <span class="dim small">deploy ${navalDeployCap(run)} · crew ${fleetCrew(run)}</span></div>
          <div class="tb-res" title="Navigation reveals the chart; Salvage improves sunken treasure; Naval Reputation brings pirates and merchants."><span class="dim small">Nav</span> <b>${sea.navigation}</b> <span class="dim small">Salv</span> <b>${sea.salvage}</b> <span class="dim small">Rep</span> <b>${sea.reputation}</b></div>`; })() : ''}
        ${run.campaign === 'twilight' ? (() => { const tw = twilightOf(run); const prov = Object.keys(TWILIT_PROVINCES).filter((r) => r !== 'ordonProvince'); return `<div class="tb-res" title="Tears of Light gathered in each twilit province (${TEARS_NEEDED} fill its Vessel of Light). Restored provinces have their Light Spirit back."><span class="dim small">Light</span> ${prov.map((r) => tw.restored.includes(r) ? `<b title="${esc(WORLDS[r]?.name ?? r)}: restored">☀</b>` : `<span title="${esc(WORLDS[r]?.name ?? r)}">💧${tw.tears[r] ?? 0}</span>`).join(' ')}</div>`; })() : ''}
        ${run.campaign === 'skyward' ? (() => { const qi = run.questItems ?? []; const parts = ['songPartFaron', 'songPartEldin', 'songPartLanayru', 'songPartLevias'].filter((p) => qi.includes(p)).length; const mats = materialBag(run).reduce((n, m) => n + m.n, 0);
          return `<div class="tb-res" title="Gratitude Crystals (trade with Batreaux) · crafting Treasures and insects in the bag · Song of the Hero parts${run.skyward?.trialPending ? ' · a Silent Realm trial is next' : ''}"><span class="dim small">Gratitude</span> <b>💎${questCount(run, 'gratitudeCrystal')}</b> <span class="dim small">Treasures</span> <b>${mats}</b> <span class="dim small">Song</span> <b>${qi.includes('songOfTheHeroComplete') ? '🎵' : `${parts}/4`}</b>${run.skyward?.trialPending ? ' <b title="Silent Realm trial next">⛩</b>' : ''}</div>`; })() : ''}
        ${run.campaign === 'wild' ? (() => { const s = wildStatus(run); const icon = s.layer === 'sky' ? '☁ Sky' : s.layer === 'depths' ? '◉ Depths' : '⛰ Surface';
          return `<div class="tb-res" title="Layer · Energy Cell capacity · Zonaite · Korok Seeds · Spirit Orbs and Lights of Blessing · Poes · max HP lost to Gloom · the Blood Moon"><span class="dim small">${icon}</span> <b>⚡${s.energy}</b> <span class="dim small">Zonaite</span> <b>${s.zonaite}</b> <span class="dim small">Seeds</span> <b>🌰${s.seeds}</b> <span class="dim small">Orbs</span> <b>${s.orbs}</b> <span class="dim small">Poes</span> <b>${s.poes}</b>${s.gloom ? ` <span class="dim small">Gloom</span> <b class="bad">−${s.gloom}</b>` : ''} <b>${esc(s.moon)}</b></div>`; })() : ''}
        ${run.tour ? (() => { const t = run.tour; const left = Math.max(0, t.per - (run.act - t.legStartAct + 1)); const nxt = t.next ?? (t.leg + 1 < t.legs.length ? t.legs[t.leg + 1] : undefined);
          return `<div class="tb-res" title="World Tour: ${t.per} region${t.per > 1 ? 's' : ''} in each campaign, then on to the next. First pass: ${t.legs.map((c) => TOUR_NAMES[c]).join(' → ')}; after that the tour wanders at random"><span class="dim small">World Tour</span> <b>${t.leg + 1}</b> <span class="dim small">· ${esc(TOUR_NAMES[run.campaign as TourCampaign] ?? '')} · ${left ? `${left} more region${left > 1 ? 's' : ''}, then` : 'next:'} ${nxt ? esc(TOUR_NAMES[nxt]) : 'somewhere at random'}</span></div>`; })() : ''}
        ${run.campaign === 'original' ? (() => { const qi = run.questItems ?? []; const n = qi.includes('fullTriforce') ? 8 : Math.min(8, questCount(run, 'wisdomFragment'));
          return `<div class="tb-res" title="Fragments of the Triforce of Wisdom (one from each Level's boss). All eight open Death Mountain.${run.trials?.includes('secondQuest') ? ' · Second Quest' : ''}"><span class="dim small">Triforce</span> <b>${n >= 8 ? '🔺 whole' : `🔺${n}/8`}</b>${run.trials?.includes('secondQuest') ? ' <span class="dim small">2nd Quest</span>' : ''}</div>`; })() : ''}
        ${run.clock ? (() => { const c = clockLabel(run); return `<div class="tb-clock ${c.hoursLeft <= 12 ? 'bad' : c.day === 3 ? 'warn' : ''}" title="The Moon falls when the third day ends."><span class="dim small">Day ${c.day} ${c.night ? '☾' : '☀'}</span> <b>${c.time}</b> <span class="dim small">${c.hoursLeft}h left</span></div>
          <button class="btn small" data-nav="songoftime" title="Return to the dawn of the first day">🎵 Song of Time</button>`; })() : ''}
        <div class="spacer"></div>
        <button class="btn small" data-nav="armyinfo">⚑ Army Lv ${armyOf(run).level}</button>
        <button class="btn small" data-nav="convoy">Convoy (${run.convoy.length})</button>
        <button class="btn small" data-nav="menu">☰</button>
      </div>`;
  }

  private partyHtml(): string {
    const run = this.run!;
    return `
      <div class="party">
        <h3>Army <span class="dim small">${run.roster.length}/${armyCap(run)} · deploy ${deployCap(run)}</span></h3>
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
        const m = modal(`<h2>Paused</h2><div class="menu"><button class="btn" data-close>Resume</button><button class="btn" data-k="sound">🔊 Sound</button><button class="btn" data-k="title">Save & Quit to Title</button><button class="btn danger" data-k="abandon">Abandon Campaign</button></div>`, { dismissable: true });
        m.el.addEventListener('click', async (e) => {
          const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
          if (!k) return;
          m.close();
          if (k.dataset.k === 'sound') this.soundModal();
          if (k.dataset.k === 'title') this.title();
          if (k.dataset.k === 'abandon' && (await confirmDialog('Abandon this campaign? You still earn Hero Medals for how far you got.', 'Abandon'))) {
            this.recordEnd();
            if (this.run) this.endCampaign(this.run);
            this.run = null;
            this.save();
            this.title();
          }
        });
      },
      unit: (el: HTMLElement) => this.unitModal(el.dataset.uid!, rerender),
      convoy: () => this.convoyModal(rerender),
      armyinfo: () => this.armyModal(rerender),
      songoftime: async () => {
        const run = this.run!;
        const c = run.clock!;
        if (!(await confirmDialog(`Play the Song of Time and return to the dawn of the first day?<br><br>You keep your army, levels, gear, masks, Boss Remains, learned songs and banked Rupees (₹${run.bank ?? 0}).<br>You lose your ₹${run.rupees} unbanked Rupees, ordinary consumables and most quest items, and this region's route starts over.<br>Enemies grow stronger after every reset (resets so far: ${c.resets}).`, 'Play it'))) return;
        const lost = songOfTimeReset(run);
        sfx('song');
        this.save();
        modal(`<h2>🎵 Song of Time</h2><p>Dawn of the first day. 72 hours remain.</p>${lost.length ? `<p class="dim small">Lost: ${lost.map(esc).join(', ')}.</p>` : ''}<div class="center-text"><button class="btn primary" data-close>Continue</button></div>`, { dismissable: true });
        this.mapScreen();
      },
    };
  }

  private armyModal(rerender: () => void) {
    const run = this.run!;
    const a = armyOf(run);
    const cmd = commanderOf(run);
    const row = (label: string, value: string, note = '') => `<div class="equip-row"><span>${label}</span><span><b>${value}</b>${note ? ` <span class="dim small">${note}</span>` : ''}</span></div>`;
    const m = modal(`
      <h2>${esc(cmd.armyName)} <span class="dim small">Army Lv ${a.level}</span></h2>
      <div class="xpbar"><i style="width:${Math.round((a.xp / xpToNext(a.level)) * 100)}%"></i></div>
      <p class="dim small">Army EXP ${a.xp}/${xpToNext(a.level)}. Army level comes from finishing encounters and raises capacity, supplies and Command Points.</p>
      <div class="equip-list">
        ${row('Rupees', `₹${run.rupees}`)}
        ${row('Supplies', `${a.supplies}/${supplyCap(run)}`, 'eaten after every battle; camps rest better with them')}
        ${row('Materials', String(a.materials), 'used by the Blacksmith to improve weapons')}
        ${row('Command Points', String(cpMax(run)), 'per battle, for orders')}
        ${row('Fairy Dust', String(a.fairyDust), 'revive the fallen at camp')}
        ${row('Sacred Energy', String(a.sacredEnergy), 'army-wide blessings')}
        ${row('Morale', `${a.morale}/100`, `${moraleLabel(a.morale)} · ${moraleBonus(a.morale) >= 0 ? '+' : ''}${moraleBonus(a.morale)} Hit/Avoid`)}
        ${row('Reputation', `${a.reputation}/100`, `${repDiscount(run)}% off at merchants`)}
        ${row('Army Capacity', `${run.roster.length}/${armyCap(run)}`)}
        ${row('Deployment', String(deployCap(run)))}
      </div>
      ${run.questItems?.length ? `<h3>Quest items</h3><div class="equip-list">${run.questItems.map((id) => row(`📜 ${esc(QUEST_ITEMS[id]?.name ?? id)}`, '', esc(QUEST_ITEMS[id]?.desc ?? ''))).join('')}</div>` : ''}
      ${run.clock && run.questItems?.includes('bombersNotebook') ? `<h3>Bombers' Notebook <span class="dim small">who can be recruited when</span></h3><div class="equip-list">${Object.entries(TERMINA_SCHEDULE).map(([id, days]) => row(esc(TEMPLATES[id]?.name ?? id), days.map((d) => `Day ${d}`).join(', '), days.includes(clockLabel(run).day) ? 'available today' : '')).join('')}</div>` : ''}
      ${run.clock ? `<p class="small">🏦 Clock Town Bank: <b>₹${run.bank ?? 0}</b> (safe through the Song of Time; deposit at any Termina merchant).</p>` : ''}
      <h3>Orders <span class="dim small">given in battle with Command Points</span></h3>
      <div class="equip-list">${ordersFor(run.commanderId).map((id) => row(`${esc(ORDERS[id].name)}`, `${ORDERS[id].cp} CP`, esc(ORDERS[id].desc))).join('')}</div>
      <h3>Sacred Energy blessings</h3>
      ${a.blessing ? `<p class="small">Active for the next battle: <b>${BLESSINGS[a.blessing].name}</b></p>` : ''}
      <div class="choice-grid">${(Object.keys(BLESSINGS) as (keyof typeof BLESSINGS)[]).map((k) => `
        <button class="choice" data-k="${k}" ${a.sacredEnergy < 1 || (k !== 'farore' && a.blessing) ? 'disabled' : ''}><b>${BLESSINGS[k].name}</b><span>${BLESSINGS[k].desc} (1 Sacred Energy)</span></button>`).join('')}</div>
      <div class="center-text"><button class="btn" data-close>Close</button></div>`, { dismissable: true });
    m.el.addEventListener('click', (e) => {
      const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
      if (!k) return;
      if (useBlessing(run, k.dataset.k as keyof typeof BLESSINGS)) { this.save(); m.close(); rerender(); this.armyModal(rerender); }
    });
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
      ${isVessel(u) ? `<p class="dim small">Carries ${capacityOf(u)} passengers. Ships only sail into sea battles.</p>` : ''}
      <div class="equip-list">${GEAR_SLOTS.filter((slot) => (isVessel(u) ? vesselHasSlot(u, slot) : !VESSEL_SLOT_SET.has(slot) && (slot !== 'mount' || true))).map((slot) => {
        const id = u.gear[slot];
        return `<div class="equip-row"><span><span class="dim">${SLOT_ICONS[slot]} ${SLOT_LABELS[slot]}</span> ${id ? esc(itemName(id)) : '<span class="dim">—</span>'}${
          id && slot === 'shield' && WEAPONS[u.weapons[0]]?.twoHanded ? ' <span class="badge">inactive: two-handed weapon</span>' : ''}</span>
          ${id ? `<button class="btn small" data-k="ungear" data-slot="${slot}">To convoy</button>` : ''}</div>`;
      }).join('')}</div>
      <h3>Pack <span class="dim small">${u.pack.length}/${packSize(u)}</span></h3>
      <div class="equip-list">${u.pack.length ? u.pack.map((p, i) => {
        const def = ITEMS[p.id];
        const usable = canUseOutside(u, i);
        const label = def?.kind === 'learn' ? 'Learn' : 'Use';
        return `<div class="equip-row"><span>${esc(def?.name ?? p.id)}${p.uses > 1 ? ` ×${p.uses}` : ''} <span class="dim small">${esc(def?.desc ?? '')}</span></span>
          <span>${usable ? `<button class="btn small" data-k="use" data-i="${i}">${label}</button>` : ''}<button class="btn small" data-k="unpack" data-i="${i}">To convoy</button></span></div>`;
      }).join('') : '<div class="dim small">Empty. Buy potions, bombs and Deku Nuts from merchants.</div>'}</div>
      ${(() => { const vs = (ART_VARIANTS[portraitIdOf(u) ?? ''] ?? []).filter((v) => artFor(v)); return vs.length > 1 ? `<div class="equip-row"><span>🎨 Art <span class="dim small">${vs.indexOf(artFor(portraitIdOf(u), u.uid, u.artPick) ?? '') + 1}/${vs.length}</span></span><button class="btn small" data-k="art">Change art</button></div>` : ''; })()}
      ${this.supportsHtml(u)}
      ${t ? `<p class="bio">${esc(t.bio)}</p>` : ''}
      <button class="btn primary" data-close>Close</button>`, { dismissable: true });
    m.el.addEventListener('click', (e) => {
      const k = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
      if (!k) return;
      if (k.dataset.k === 'talk') {
        const other = run.roster.find((x) => x.uid === k.dataset.uid);
        if (other) this.showConversation(u, other, k.dataset.rank as ConvoRank, k.dataset.form);
        return;
      }
      if (k.dataset.k === 'equip') equip(u, k.dataset.id!);
      if (k.dataset.k === 'stash') stashWeapon(run, uid, k.dataset.id!);
      if (k.dataset.k === 'ungear') stashGear(run, uid, k.dataset.slot as GearSlot);
      if (k.dataset.k === 'unpack') stashItem(run, uid, Number(k.dataset.i));
      if (k.dataset.k === 'use') useItemOutside(run, uid, Number(k.dataset.i));
      if (k.dataset.k === 'art') {
        const vs = (ART_VARIANTS[portraitIdOf(u) ?? ''] ?? []).filter((v) => artFor(v));
        const cur = artFor(portraitIdOf(u), u.uid, u.artPick) ?? vs[0];
        u.artPick = vs[(vs.indexOf(cur) + 1) % vs.length];
      }
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
    if (ITEMS[id]) return u.pack.length >= packSize(u) ? 'Pack full: goes to convoy' : `Pack ${u.pack.length}/${packSize(u)}`;
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

  /** The Great Sea chart: 7×7 sectors, sail one sector at a time. */
  private seaChart() {
    music('map');
    const run = this.run!;
    const sea = seaOf(run);
    const owned = ownedGear(run);
    const avail = new Set(availableNodes(run).map((n) => n.id));
    const cur = currentNode(run);
    const icon = (n: MapNode): string => {
      if (!sea.revealed.includes(n.id) && !n.visited) return '?';
      if (n.island) return sea.cleared.includes(n.island) ? '✔' : n.type === 'shop' ? '₹' : '●';
      if (n.visited && !['shop', 'camp', 'fountain', 'blacksmith'].includes(n.type)) return '·';
      if (['battle', 'elite', 'ambush', 'boss'].includes(n.type)) return n.label === 'The Ghost Ship' ? '☠' : n.type === 'boss' ? '🐙' : '!';
      if (n.type === 'sea') return '≈';
      return NODE_INFO[n.type].icon;
    };
    const kindClass = (n: MapNode) => (!sea.revealed.includes(n.id) && !n.visited ? 'unknown' : n.island ? 'island' : ['battle', 'elite', 'ambush', 'boss'].includes(n.type) ? 'hostile' : n.type === 'sea' ? 'water' : 'vessel');
    const cells: string[] = [];
    for (let y = 0; y < CHART_SIZE; y++) for (let x = 0; x < CHART_SIZE; x++) {
      const n = run.map.nodes.find((m) => m.col === x && m.row === y)!;
      const lock = n.locked ? lockReason(run, n, owned) : null;
      const cls = ['sector', kindClass(n), avail.has(n.id) ? 'avail' : '', n.visited ? 'visited' : '', n.id === cur?.id ? 'current' : '', lock ? 'locked' : ''].join(' ');
      cells.push(`<button class="${cls}" data-nav="${avail.has(n.id) ? 'node' : 'peek'}" data-id="${n.id}" title="${esc(sectorName(x, y))}${n.label && (sea.revealed.includes(n.id) || n.visited) ? ` · ${esc(n.label)}` : ''}">
        <span class="sec-name">${sectorName(x, y)}</span><span class="sec-icon">${icon(n)}</span>${n.island && n.label ? `<span class="sec-label">${esc(n.label.replace(/ \(.*\)/, ''))}</span>` : ''}${lock ? '<span class="sec-lock">🔒</span>' : ''}${n.id === cur?.id ? '<span class="sec-boat">⛵</span>' : ''}</button>`);
    }
    const sail = run.lastSail ?? [];
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="map-main">
          <h2 style="color:#2a7ac0">The Great Sea <span class="dim small">· Chart ${sea.charts + 1}</span></h2>
          <p class="dim small">Sail one sector at a time: each crossing eats a day of supplies. Clear the islands, gather the Goddess Pearls to raise the Tower of the Gods, then take the fight to Ganon's Tower.
            <span class="badge">Islands cleared ${sea.cleared.length}/10</span> <span class="badge">Pearls ${['dinsPearl', 'faroresPearl', 'nayrusPearl'].filter((p) => owned.has(p)).length}/3</span>
            <span class="badge">Triforce Shards ${(run.questItems ?? []).filter((q) => q.startsWith('triforceShard')).length}/8</span></p>
          ${sail.length ? `<div class="sail-log small">${sail.map((l) => `<div>🌊 ${esc(l)}</div>`).join('')}</div>` : ''}
          <div class="sea-chart">${cells.join('')}</div>
          <div class="legend"><span><b>●</b> Island</span><span><b>₹</b> Merchant / port</span><span><b>!</b> Hostile fleet</span><span><b>🐙</b> Sea boss</span><span><b>?</b> Unknown</span><span><b>≈</b> Open sea</span><span><b>✔</b> Cleared</span><span><b>🔒</b> Locked</span></div>
          <div class="node-info dim small">Tap a glowing sector next to your ship to sail there.</div>
        </div>
        ${this.partyHtml()}
      </div>`);
    const show = (id: string, go: boolean) => {
      const n = run.map.nodes.find((x) => x.id === id)!;
      const known = sea.revealed.includes(n.id) || n.visited;
      const info = NODE_INFO[n.type];
      const lock = n.locked ? lockReason(run, n, owned) : null;
      const el = this.root.querySelector('.node-info') as HTMLElement;
      const what = !known ? 'Uncharted water. Anything could be out there.'
        : `${n.label ? `<b>${esc(n.label)}</b>: ` : ''}${n.visited && !['shop', 'camp', 'fountain', 'blacksmith'].includes(n.type) && n.type !== 'sea' ? 'Already explored.' : `${info.icon} ${esc(info.label)} — ${esc(info.desc)}`}${['battle', 'elite', 'ambush', 'boss'].includes(n.type) ? ` <span class="badge">${isNavalNode(run, n) ? 'Sea battle' : 'Land battle'}</span>` : ''}`;
      el.innerHTML = `<b>${sectorName(n.col, n.row)}</b> · ${what}${lock ? ` <span class="badge">🔒 ${esc(lock)}</span>` : ''}${go ? ` <button class="btn primary small" data-nav="go" data-id="${n.id}">Sail →</button>` : ''}`;
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
        else if (run.event) this.eventScreen();
        else this.mapScreen();
      },
    });
  }

  mapScreen() {
    if (this.run?.campaign === 'greatSea') return this.seaChart();
    music(this.run?.campaign === 'termina' ? (this.run.region === 'moon' ? 'moon' : 'termina') : 'map');
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
    music(this.run?.battle?.nodeType === 'boss' || this.run?.battle?.nodeType === 'elite' ? 'boss' : 'battle');
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
    setMax(this.meta, 'bestRegion', run.act);
    saveMeta(this.meta);
  }

  /** Campaign over: Hero Medals and bounties. */
  private endCampaign(run: RunWithEvent): { medals: number; bounties: string[] } {
    const medals = medalsForRun(run);
    awardMedals(this.meta, medals);
    const bounties = claimBounties(this.meta).map((b) => `${b.name} (+${b.reward})`);
    saveMeta(this.meta);
    return { medals, bounties };
  }

  private afterBattle(result: 'won' | 'lost') {
    const run = this.run!;
    const fought = run.battle!;
    const p = this.meta;
    // Lifetime counters for the Bounty Board and Archives
    for (const e of [...fought.units, ...fought.fallen]) {
      if (e.team === 'enemy') { const id = e.bossId ?? e.artId ?? e.templateId; if (id && !p.enemiesSeen.includes(id)) p.enemiesSeen.push(id); }
    }
    if (result === 'won') {
      bump(p, 'wins');
      if (!fought.fallen.some((u) => u.team === 'player' && !u.npc)) bump(p, 'flawless');
      if (fought.nodeType === 'siege') bump(p, 'sieges');
      if (fought.objective.type === 'escort') bump(p, 'escorts');
      bump(p, 'rescued', fought.units.filter((u) => u.rescued).length);
      bump(p, 'bossKills', fought.fallen.filter((u) => u.team === 'enemy' && u.isBoss).length);
    }
    const commanderFell = run.battle!.fallen.some((u) => u.isCommander);
    const bosses = run.battle!.fallen.filter((u) => u.isBoss && u.bossId).map((u) => u.bossId!);
    const summary = finishBattle(run);
    if (summary.dungeon?.cleared) bump(p, 'dungeons');
    if (summary.supportUps.some((x) => x.rank === 'S')) bump(p, 'supportS');
    for (const id of [...run.convoy, ...run.roster.flatMap((u) => [...u.weapons, ...Object.values(u.gear), ...u.pack.map((x) => x.id)])]) if (id && !p.itemsSeen.includes(id)) p.itemsSeen.push(id);
    this.recordEnd();
    if (result === 'won') music('victory');
    if (result === 'lost' && !summary.retreated) return this.gameOver(commanderFell ? 'Your Commander has fallen.' : 'Your army was wiped out.');
    for (const id of bosses) if (!this.meta.bossesDefeated.includes(id)) this.meta.bossesDefeated.push(id);
    saveMeta(this.meta);
    this.save();
    this.setScreen(`
      <div class="results">
        ${summary.retreated ? '<h1 class="lose">Retreat</h1><p class="dim">The enemy took the point. Your army falls back to fight another day (no reward).</p>' : '<h1 class="win">Victory</h1>'}
        ${summary.sideQuest ? `<div class="res-row"><span>Side quest: ${esc(summary.sideQuest.text)}</span><b class="${summary.sideQuest.done ? 'win' : 'dim'}">${summary.sideQuest.done ? `✔ ${esc(summary.sideQuest.reward)}` : '✘ Failed'}</b></div>` : ''}
        ${summary.dungeon ? `<div class="res-row"><span>Dungeon</span><b>${summary.dungeon.cleared ? 'Cleared! The vault is open.' : `Onward to floor ${summary.dungeon.floor} of ${summary.dungeon.of}`}</b></div>` : ''}
        <div class="res-row"><span>Rupees</span><b class="rupee">+₹${summary.rupees}</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${summary.kills}</b></div>
        ${summary.drops.length ? `<div class="res-drops"><div class="dim small">Boss drop (sent to convoy)</div>${summary.drops.map((d) => `<div>${itemLine(d)}</div>`).join('')}</div>` : ''}
        ${summary.supportUps.length ? `<div class="res-drops"><div class="dim small">Supports</div>${summary.supportUps.map((x, i) => `<div>💞 <b>${esc(x.a)}</b> & <b>${esc(x.b)}</b> reached <b>${x.rank}</b> <button class="btn tiny" data-nav="talk" data-i="${i}">💬 Read</button></div>`).join('')}</div>` : ''}
        ${summary.found.length ? `<div class="res-drops"><div class="dim small">Found on the field</div><div>${summary.found.map((d) => esc(itemName(d))).join(', ')}</div></div>` : ''}
        ${summary.joined.length ? `<div class="res-drops"><div class="dim small">Rescued and joined your army</div><div>${summary.joined.map(esc).join(', ')}</div></div>` : ''}
        ${summary.twilight?.length ? `<div class="res-drops"><div class="dim small">Twilight</div>${summary.twilight.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
        ${summary.skyward?.length ? `<div class="res-drops"><div class="dim small">Skyward</div>${summary.skyward.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
        ${summary.wild?.length ? `<div class="res-drops"><div class="dim small">The Wild</div>${summary.wild.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
        ${summary.original?.length ? `<div class="res-drops"><div class="dim small">Hyrule</div>${summary.original.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
        <div class="res-army-stats">${armyReportHtml(summary.army)}</div>
        ${summary.fallen.length ? `<div class="res-fallen"><span class="dim">Fallen:</span> ${summary.fallen.map((u) => `${token(u, 28)} ${esc(u.name)}`).join(' ')}</div>` : '<div class="dim">No losses.</div>'}
        <div class="res-army">${run.roster.map((u) => `<div class="res-unit">${token(u, 36)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} · HP ${u.hp}/${u.stats.hp}</div></div></div>`).join('')}</div>
        <p class="dim small">Units recover 20% HP after each battle (benched units recover more).</p>
        <button class="btn primary big" data-nav="cont">Continue</button>
      </div>`, 'center');
    this.on({
      cont: () => this.afterNode(),
      talk: (el) => {
        const x = summary.supportUps[Number(el.dataset.i)];
        const ua = run.roster.find((u) => u.uid === x.aUid), ub = run.roster.find((u) => u.uid === x.bUid);
        if (ua && ub && x.rank) this.showConversation(ua, ub, x.rank as ConvoRank);
      },
    });
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
    music('gameover');
    const run = this.run!;
    this.run = null;
    this.save();
    const earned = this.endCampaign(run);
    this.setScreen(`
      <div class="results">
        <h1 class="lose">Campaign Over</h1>
        <p>${esc(reason)}</p>
        <div class="res-row"><span>Regions reached</span><b>${run.act}</b></div>
        <div class="res-row"><span>Battles fought</span><b>${run.stats.battles}</b></div>
        <div class="res-row"><span>Enemies defeated</span><b>${run.stats.kills}</b></div>
        <div class="res-row"><span>Recruits</span><b>${run.stats.recruits}</b></div>
        <div class="res-row"><span>Best ever</span><b>Region ${this.meta.bestRegion}</b></div>
        <div class="res-row"><span>Hero Medals earned</span><b class="win">🏅 ${earned.medals}${run.trials?.length ? ` <span class="dim small">(Trials ×${trialMultiplier(run.trials).toFixed(2)})</span>` : ''}</b></div>
        ${earned.bounties.length ? `<div class="res-drops"><div class="dim small">Bounties completed</div>${earned.bounties.map((b) => `<div>📜 ${esc(b)}</div>`).join('')}</div>` : ''}
        <p class="dim small">Spend Hero Medals in the Sanctuary for lasting upgrades.</p>
        <button class="btn primary big" data-nav="sanctuary">🏛 Sanctuary</button>
        <button class="btn big" data-nav="title">Return to Title</button>
      </div>`, 'center');
    this.on({ title: () => this.title(), sanctuary: () => this.sanctuary() });
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
      case 'blacksmith': return this.blacksmithScreen();
      case 'event': return this.randomEventScreen();
      case 'dungeon': return this.dungeonScreen();
      case 'moonfall': this.recordEnd(); return this.gameOver('The Moon has fallen on Termina. (Play the Song of Time before the third day ends!)');
    }
  }

  private randomEventScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'event'>;
    const def = eventDef(run);
    if (!def) return this.finishEvent();
    const art = artFor(def.art);
    const body = ev.result
      ? `<p class="event-result">${esc(ev.result.text)}</p>
         ${ev.result.lines.length ? `<ul class="event-lines">${ev.result.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
         <div class="center-text"><button class="btn primary big" data-nav="done">Continue</button></div>`
      : `<div class="choice-grid">${def.choices.map((c, i) => `
          <button class="choice" data-nav="pick" data-i="${i}" ${canChoose(run, def, i) ? '' : 'disabled'}>
            <b>${esc(c.label)}</b>${c.gamble ? `<span class="dim small">A gamble (${c.gamble.chance}% to go well)</span>` : ''}
            ${c.cost && run.rupees < c.cost ? '<span class="dim small">Not enough Rupees</span>' : ''}
          </button>`).join('')}</div>`;
    this.setScreen(`
      ${this.topBar()}
      <div class="page event-page">
        <h1>${esc(def.title)}</h1>
        <div class="event-card">
          ${art ? `<img class="event-art" src="${imgUrl('art', art)}" alt="" onerror="this.remove()">` : ''}
          <p>${esc(def.text)}</p>
        </div>
        ${body}
      </div>`);
    this.on({
      ...this.common(() => this.randomEventScreen()),
      pick: (el) => { if (chooseEvent(run, Number(el.dataset.i))) { this.save(); this.randomEventScreen(); } },
      done: () => this.finishEvent(),
    });
  }

  private dungeonScreen() {
    const run = this.run!;
    const ev = run.event as EventOf<'dungeon'>;
    const last = ev.floor >= ev.of;
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>Dungeon: Floor ${ev.floor} of ${ev.of}</h1>
        <p class="dim center-text">Little rest down here: only the usual post-battle recovery before the next fight.${last ? ' A powerful guardian waits on the last floor, and the vault lies beyond it.' : ''}</p>
        <div class="res-army">${run.roster.map((u) => `<div class="res-unit">${token(u, 36)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} · HP ${u.hp}/${u.stats.hp}</div></div></div>`).join('')}</div>
        <div class="center-text">
          <button class="btn primary big" data-nav="deeper">Go deeper →</button>
          <button class="btn" data-nav="leave">Leave the dungeon (no vault)</button>
        </div>
      </div>`);
    this.on({
      ...this.common(() => this.dungeonScreen()),
      deeper: () => { descendDungeon(run); this.save(); if (run.battle) this.battle(); else this.eventScreen(); },
      leave: async () => {
        if (!(await confirmDialog('Leave the dungeon? You keep what you have earned, but lose the vault.'))) return;
        leaveDungeon(run); this.finishEvent();
      },
    });
  }

  private finishEvent() {
    this.run!.event = undefined;
    this.save();
    this.afterNode();
  }

  private deployScreen() {
    const run = this.run!;
    const chosen = new Set(run.roster.filter((u) => u.isCommander).map((u) => u.uid));
    const node = currentNode(run);
    const naval = !!node && isNavalNode(run, node);
    const landCount = () => run.roster.filter((u) => chosen.has(u.uid) && !isVessel(u)).length;
    const shipCount = () => run.roster.filter((u) => chosen.has(u.uid) && isVessel(u)).length;
    const room = (u: Unit) => (isVessel(u) ? naval && shipCount() < navalDeployCap(run) : landCount() < deployCap(run));
    // Default: commander plus the healthiest units (and the sturdiest ships at sea).
    for (const u of [...run.roster].sort((a, b) => b.hp / b.stats.hp - a.hp / a.stats.hp)) if (room(u)) chosen.add(u.uid);
    const render = () => {
      this.setScreen(`
        ${this.topBar()}
        <div class="page">
          <h1>Deployment</h1>
          <p class="dim center-text">Choose up to <b>${deployCap(run)}</b> units. Benched units recover extra HP. (${landCount()}/${deployCap(run)})
            ${naval ? `<br>⛵ <b>Sea battle</b>: also choose up to <b>${navalDeployCap(run)}</b> ships (${shipCount()}/${navalDeployCap(run)}). Your units start aboard them.` : run.roster.some(isVessel) ? '<br><span class="dim">This fight is on land: your ships wait in the harbour.</span>' : ''}</p>
          <div class="deploy-grid">${run.roster.map((u) => `
            <button class="deploy ${chosen.has(u.uid) ? 'on' : ''}" data-nav="toggle" data-uid="${u.uid}" ${u.isCommander || (isVessel(u) && !naval) ? 'disabled' : ''}>
              ${token(u, 40)}<div><b>${esc(u.name)}</b><div class="dim small">Lv ${u.level} ${esc(CLASSES[u.classId]?.name ?? '')}${u.size > 1 ? ` · Size ${u.size}` : ''}</div>${hpBar(u.hp, u.stats.hp)}<div class="dim small">HP ${u.hp}/${u.stats.hp}</div></div>
            </button>`).join('')}</div>
          <div class="center-text"><button class="btn primary big" data-nav="go">To Battle →</button></div>
        </div>`);
      this.on({
        ...this.common(render),
        toggle: (el) => {
          const uid = el.dataset.uid!;
          const u = run.roster.find((x) => x.uid === uid)!;
          if (chosen.has(uid)) chosen.delete(uid);
          else if (room(u)) chosen.add(uid);
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
    const full = run.roster.length >= armyCap(run);
    this.setScreen(`
      ${this.topBar()}
      <div class="page">
        <h1>Recruitment</h1>
        <p class="dim center-text">${full ? `<b>Your army is full (${armyCap(run)})</b>. You can only accept supplies (+₹120).` : `Recruits join at <b>Level ${recruitLevel(run)}</b>.`}</p>
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
    music('shop');
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
            ${repDiscount(run) ? `<p class="center-text"><span class="badge">Reputation discount −${repDiscount(run)}%</span></p>` : ''}
            <h3>Weapons</h3><div class="shop-list">${ev.weapons.map((id) => row('weapon', id, priceOf(run, 'weapon', id))).join('')}</div>
            <h3>Gear</h3><div class="shop-list">${ev.gear.map((id) => row('gear', id, priceOf(run, 'gear', id))).join('') || '<div class="dim">None in stock.</div>'}</div>
            <h3>Items <span class="dim small">restocked: buy as many as you like</span></h3><div class="shop-list">${ev.items.map((id) => row('item', id, priceOf(run, 'item', id))).join('') || '<div class="dim">None in stock.</div>'}</div>
            <h3>Permanent upgrades</h3><div class="shop-list">${ev.permanents.map((id) => row('permanent', id, priceOf(run, 'permanent', id))).join('')}</div>
            ${this.wildFacilitiesHtml('shop')}
            ${run.clock ? `<h3>🏦 Clock Town Bank <span class="dim small">balance ₹${run.bank ?? 0}: safe through the Song of Time</span></h3>
            <div class="row"><button class="btn small" data-nav="deposit" ${run.rupees ? '' : 'disabled'}>Deposit all (₹${run.rupees})</button><button class="btn small" data-nav="withdraw" ${run.bank ? '' : 'disabled'}>Withdraw all</button></div>` : ''}
            <h3>Supplies <span class="dim small">${armyOf(run).supplies}/${supplyCap(run)}</span></h3>
            <div class="shop-list"><div class="shop-item"><div><b>Crate of supplies</b> <span class="dim small">+${SUPPLY_PACK.amount} supplies (food, bandages, horse feed)</span></div><button class="btn small" data-nav="supplies" ${run.rupees < supplyPrice(run) || armyOf(run).supplies >= supplyCap(run) ? 'disabled' : ''}>₹${supplyPrice(run)}</button></div></div>
            <div class="center-text"><button class="btn primary big" data-nav="leave">Leave</button></div>
          </div>
          ${this.partyHtml()}
        </div>`);
      this.on({
        ...this.common(render),
        ...this.wildHandlers(render),
        buy: async (el) => {
          const kind = el.dataset.kind as ItemKindTag;
          const id = el.dataset.id!;
          const uid = await this.unitPicker(`Give ${esc(itemName(id))} to…`, (u) => canTake(u, id), (u) => this.itemPreview(u, id));
          if (uid && buy(run, kind, id, uid)) { sfx('coin'); this.save(); render(); }
        },
        supplies: () => { if (buySupplies(run)) { this.save(); render(); } },
        deposit: () => { if (deposit(run, run.rupees)) { sfx('coin'); this.save(); render(); } },
        withdraw: () => { if (withdraw(run, run.bank ?? 0)) { sfx('coin'); this.save(); render(); } },
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
    music('camp');
    const run = this.run!;
    this.setScreen(`
      ${this.topBar()}
      <div class="map-layout">
        <div class="page">
          <h1>Camp</h1>
          <p class="dim center-text">The army makes camp for the night.</p>
          <div class="choice-grid">
            <button class="choice" data-nav="rest"><b>☾ Rest</b><span>${armyOf(run).supplies >= 4 ? 'Eat 4 supplies: everyone recovers fully (+5 morale).' : 'Out of supplies: everyone recovers 50% of their max HP.'}</span></button>
            <button class="choice" data-nav="feast" ${armyOf(run).supplies < FEAST_COST ? 'disabled' : ''}><b>🍖 Feast</b><span>Mess Hall: spend ${FEAST_COST} supplies for +15 morale; everyone starts the next battle Inspired.</span></button>
            <button class="choice" data-nav="train"><b>⚔ Train</b><span>One unit trains hard and gains a full level.</span></button>
            <button class="choice" data-nav="drill"><b>⚑ Drill</b><span>The whole army drills together: everyone gains 45 XP.</span></button>
          </div>
          ${this.workshopHtml()}
          ${this.wildFacilitiesHtml('camp')}
          ${armyOf(run).fairyDust > 0 && run.fallen.length ? `<h3>Infirmary <span class="dim small">${armyOf(run).fairyDust} Fairy Dust</span></h3>
            <div class="shop-list">${run.fallen.map((u) => `<div class="shop-item"><div>${token(u, 24)} ${esc(u.name)}</div><button class="btn small" data-nav="dust" data-uid="${u.uid}" ${run.roster.length >= armyCap(run) ? 'disabled' : ''}>Revive (1 Fairy Dust)</button></div>`).join('')}</div>` : ''}
        </div>
        ${this.partyHtml()}
      </div>`);
    this.on({
      ...this.common(() => this.campScreen()),
      ...this.workshopHandlers(() => this.campScreen()),
      ...this.wildHandlers(() => this.campScreen()),
      rest: () => { campRest(run); this.finishEvent(); },
      feast: () => { if (campFeast(run)) this.finishEvent(); },
      dust: (el) => { if (reviveWithDust(run, el.dataset.uid!)) { this.save(); this.campScreen(); } },
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
    music('camp');
    const run = this.run!;
    const canRevive = run.fallen.length > 0 && run.roster.length < armyCap(run);
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
          ${strayFairyCount(run) ? `<div class="center-text"><button class="btn" data-nav="stray">🧚 Return a Stray Fairy (${strayFairyCount(run)}): a free blessing</button></div>` : ''}
        </div>
        ${this.partyHtml()}
      </div>`);
    this.on({
      ...this.common(() => this.fountainScreen()),
      heal: () => { fountainHeal(run); this.finishEvent(); },
      stray: async () => {
        const uid = await this.unitPicker('Who receives the Stray Fairy\'s blessing?', () => true, (u) => `Lv ${u.level}`);
        if (!uid) return;
        const id = returnStrayFairy(run, uid);
        sfx('levelUp');
        this.save();
        modal(`<div class="center-text"><h2>The fairy returns home</h2><p>${id ? itemLine(id) : ''}</p><button class="btn primary" data-close>Thank you</button></div>`, { dismissable: true });
        this.fountainScreen();
      },
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
    sfx('chest');
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

  /** Show a support conversation between two units. */
  private showConversation(a: Unit, b: Unit, rank: ConvoRank, form?: string) {
    const run = this.run!;
    const { lines, swap } = conversationFor(a.templateId ?? a.uid, b.templateId ?? b.uid, rank, { a: a.name, b: b.name }, form);
    const who = (s: 'a' | 'b' | 'n') => ((s === 'a') !== swap ? a : b);
    const key = `${[canonOf(a.templateId ?? ''), canonOf(b.templateId ?? '')].sort().join('|')}|${rank}${form ? `|${form}` : ''}`;
    if (!(run.convosSeen ??= []).includes(key)) run.convosSeen.push(key);
    if (!this.meta.convos.includes(key)) { this.meta.convos.push(key); saveMeta(this.meta); }
    this.save();
    modal(`
        <h2>${esc(a.name)} & ${esc(b.name)} <span class="dim small">Support ${rank}${form ? ` · ${esc(TEMPLATES[form]?.name ?? form)}` : ''}</span></h2>
        <div class="convo">${lines.map(([s, t]) => {
          if (s === 'n') return `<div class="convo-narration">${esc(t)}</div>`;
          const u = who(s);
          const left = u === a;
          return `<div class="convo-line ${left ? 'left' : 'right'}">${token(u, 40)}<div class="bubble"><b>${esc(u.name)}</b><div>${esc(t)}</div></div></div>`;
        }).join('')}</div>
        <div class="center-text"><button class="btn primary" data-close>Close</button></div>`, { dismissable: true });
  }

  private supportsHtml(u: Unit): string {
    const run = this.run!;
    const rows = Object.entries(run.supports ?? {})
      .filter(([k]) => k.split('|').includes(u.uid))
      .map(([k, pts]) => {
        const other = run.roster.find((x) => x.uid !== u.uid && k.split('|').includes(x.uid));
        if (!other) return '';
        const max = maxRank(u, other);
        const r = rankOf(pts, max);
        const def = pairDef(u.templateId ?? '', other.templateId ?? '');
        const reached = (['C', 'B', 'A', 'S'] as ConvoRank[]).filter((x) => r && 'CBAS'.indexOf(x) <= 'CBAS'.indexOf(r));
        const talks = reached.map((x) => `<button class="btn tiny" data-k="talk" data-uid="${other.uid}" data-rank="${x}" title="Read the ${x} conversation">💬${x}</button>`).join('');
        const pk = pairKey(u.templateId ?? '', other.templateId ?? '');
        const formTalks = formPairs(u.templateId ?? '', other.templateId ?? '').filter((f) => (run.formSupports ?? []).includes(`${pk}#${f.form}`))
          .flatMap((f) => reached.filter((x) => 'CBAS'.indexOf(x) <= 'CBAS'.indexOf(f.max)).map((x) => `<button class="btn tiny" data-k="talk" data-uid="${other.uid}" data-rank="${x}" data-form="${f.form}" title="${esc(TEMPLATES[f.form!]?.name ?? '')}: ${esc(f.theme)}">🎭${x}</button>`)).join('');
        const bonus = PAIR_BONUSES[pk];
        return `<div class="equip-row"><span>${token(other, 22)} ${esc(other.name)}</span><span><b>${r || '–'}</b> <span class="dim small">${pts}/${pointCap(max)} · max ${max}</span> ${talks}${formTalks}</span></div>`
          + (def ? `<span class="support-theme">${esc(def.theme)}${bonus ? ` · <b>${esc(bonus.name)}</b> (${bonus.rank}): ${esc(bonus.text)}` : ''}</span>` : '');
      }).filter(Boolean);
    const mine = GROUP_SUPPORTS.filter((g) => g.members.includes(canonOf(u.templateId ?? '')));
    const groupRows = mine.map((g) => {
      const have = g.members.filter((m) => run.roster.some((x) => canonOf(x.templateId ?? '') === m));
      return `<div class="equip-row"><span>👥 <b>${esc(g.name)}</b> <span class="dim small">${have.length}/${g.members.length} in the army</span></span></div><span class="support-theme">${esc(g.text)} · ${g.members.map((m) => esc(TEMPLATES[m]?.name ?? m)).join(', ')}</span>`;
    });
    return `<h3>Supports</h3><div class="equip-list">${rows.join('') || '<div class="dim small">Fight near allies to build supports (C → B → A, and S for special pairs).</div>'}</div>${groupRows.length ? `<h3>Group supports</h3><div class="equip-list">${groupRows.join('')}</div><p class="dim small">Active in battle when every member is deployed.</p>` : ''}`;
  }

  /** Era of the Wild camp facilities (section 32), shown as expansions of the camp, shop and blacksmith. */
  private wildFacilitiesHtml(where: 'camp' | 'shop' | 'smith'): string {
    const run = this.run!;
    const opts = wildCampOptions(run, where);
    if (!opts.length) return '';
    const w = wildOf(run);
    const groups = [...new Set(opts.map((o) => o.facility))];
    return `<h3>The Wild <span class="dim small">Research ${w.research} · Construction ${w.construction} · Cooking ${w.cooking} · Fusion ${w.fusion} · Energy Cell ${w.energyCap} · Colossal ${w.colossal} · Gloom Res ${w.gloomRes} · Explore ${w.explore.surface}/${w.explore.sky}/${w.explore.depths}</span></h3>
      ${groups.map((g) => `<details class="wild-facility"><summary><b>${FACILITIES[g].icon} ${esc(FACILITIES[g].name)}</b></summary><div class="shop-list">${opts.filter((o) => o.facility === g).map((o, i) => {
        const sel = o.select ? `<select data-wsel="${esc(o.key)}-${i}">${o.select.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}</select>` : '';
        return `<div class="shop-item"><div>${esc(o.label)}<div class="dim small">${esc(o.desc)}</div></div><span>${sel}<button class="btn small" data-nav="wildcamp" data-key="${esc(o.key)}" data-sel="${o.select ? `${esc(o.key)}-${i}` : ''}" data-where="${where}" ${o.ok ? '' : 'disabled'}>Go</button></span></div>`;
      }).join('')}</div></details>`).join('')}`;
  }

  private wildHandlers(rerender: () => void) {
    const run = this.run!;
    return {
      wildcamp: async (el: HTMLElement) => {
        const key = el.dataset.key!;
        const opt = wildCampOptions(run, el.dataset.where as 'camp' | 'shop' | 'smith').find((o) => o.key === key);
        if (!opt) return;
        const arg = el.dataset.sel ? (this.root.querySelector<HTMLSelectElement>(`[data-wsel="${el.dataset.sel}"]`)?.value ?? undefined) : undefined;
        let uid: string | undefined;
        if (opt.pick) { const picked = await this.unitPicker(esc(opt.label), opt.pick, () => ''); if (!picked) return; uid = picked; }
        const rng = new RNG(run.rngState);
        const line = doWildCamp(run, key, rng, uid, arg);
        run.rngState = rng.state;
        this.save();
        rerender();
        if (line) { sfx('secret'); const m = modal(`<p>${esc(line)}</p><button class="btn primary" data-close>OK</button>`, { dismissable: true }); void m; }
      },
    };
  }

  /** Skyward Sword's upgrade workshop (section 13): recipes, the materials bag and shield repairs. */
  private workshopHtml(): string {
    const run = this.run!;
    const recipes = availableRecipes(run);
    const bag = materialBag(run);
    const shields = run.roster.filter((u) => shieldRepairCost(u) > 0);
    if (!recipes.length && !bag.length && !shields.length) return '';
    const holderName = (h: string | null) => (h === null ? 'convoy' : run.roster.find((u) => u.uid === h)?.name ?? '?');
    const rows = recipes.flatMap((r) => recipeHolders(run, r).map((h) => {
      const c = recipeCost(run, r);
      const parts = [...Object.entries(c.mats).map(([id, n]) => `${esc(QUEST_ITEMS[id]?.name ?? id)} ×${n} <span class="dim">(${questCount(run, id)})</span>`), ...c.sacred.map((s) => `<b>${esc(QUEST_ITEMS[s]?.name ?? s)}</b>`)];
      return `<div class="shop-item"><div>${esc(itemName(r.from))} → <b>${esc(itemName(r.to))}</b> <span class="dim small">(${esc(holderName(h))})</span><div class="dim small">${parts.join(', ') || 'no materials'}${c.generic ? ` · ${c.generic} army materials fill the gaps` : ''}</div></div>
        <button class="btn small" data-nav="craft" data-id="${esc(r.id)}" data-holder="${h ?? ''}" ${c.ok ? '' : 'disabled'}>${c.rupees ? `₹${c.rupees}` : 'Forge'}</button></div>`;
    })).join('');
    const fixes = shields.map((u) => { const d = shieldDurability(u)!; const cost = shieldRepairCost(u);
      return `<div class="shop-item"><div>${token(u, 24)} ${esc(itemName(u.gear.shield!))} <span class="dim small">${d.left}/${d.max} durability</span></div><button class="btn small" data-nav="shieldfix" data-uid="${u.uid}" ${run.rupees < cost ? 'disabled' : ''}>Repair ₹${cost}</button></div>`; }).join('');
    return `<h3>Upgrade workshop <span class="dim small">Treasures: ${bag.map((m) => `${esc(m.name)} ×${m.n}`).join(', ') || 'none yet'} · army materials ${armyOf(run).materials}</span></h3>
      <div class="shop-list">${rows || '<div class="dim small">Nothing you carry can be upgraded yet.</div>'}${fixes}</div>`;
  }

  private workshopHandlers(rerender: () => void) {
    const run = this.run!;
    return {
      craft: (el: HTMLElement) => { if (craft(run, el.dataset.id!, el.dataset.holder || null)) { sfx('secret'); this.save(); rerender(); } },
      shieldfix: (el: HTMLElement) => { if (repairShield(run, el.dataset.uid!)) { this.save(); rerender(); } },
    };
  }

  private blacksmithScreen() {
    music('shop');
    const run = this.run!;
    const ev = run.event as EventOf<'blacksmith'>;
    const render = () => {
      const rows = run.roster.flatMap((u) => u.weapons.map((wid) => {
        const w = WEAPONS[wid];
        if (!w || w.type === 'natural' || w.type === 'instrument') return '';
        const rc = repairCost(run, u, wid);
        const ic = improveCost(run, u, wid);
        return `<div class="shop-item"><div>${token(u, 24)} ${weaponLine(w, { owner: u })}</div><span>
          <button class="btn small" data-nav="repair" data-uid="${u.uid}" data-w="${wid}" ${!rc || run.rupees < rc ? 'disabled' : ''}>${rc ? `Repair ₹${rc}` : 'No wear'}</button>
          <button class="btn small" data-nav="improve" data-uid="${u.uid}" data-w="${wid}" ${!ic || run.rupees < ic || armyOf(run).materials < improveMaterials(u, wid) ? 'disabled' : ''}>${ic ? `Improve +${forgeLevel(u, wid) + 1} ₹${ic} + ${improveMaterials(u, wid)} mats` : 'Maxed'}</button></span></div>`;
      })).join('');
      this.setScreen(`
        ${this.topBar()}
        <div class="map-layout">
          <div class="page">
            <h1>Blacksmith</h1>
            <p class="dim center-text">“Bring me your dull blades and your broken dreams!”${run.bonus === 'forging' ? ' <span class="badge gold">Goron discount −25%</span>' : ''}</p>
            <h3>Repair & improve <span class="dim small">Improving adds +1 Might (max +${MAX_FORGE}) · Materials: ${armyOf(run).materials}</span></h3>
            <div class="shop-list">${rows}</div>
            <h3>Forge a new weapon</h3>
            <div class="shop-list">${ev.forgeOffers.map((id) => {
              const sold = ev.sold.includes(id);
              const p = forgePrice(run, id);
              return `<div class="shop-item ${sold ? 'sold' : ''}"><div>${itemLine(id)}</div><button class="btn small" data-nav="forge" data-id="${id}" ${sold || run.rupees < p ? 'disabled' : ''}>${sold ? 'Forged' : `₹${p}`}</button></div>`;
            }).join('')}</div>
            ${this.workshopHtml()}
            ${this.wildFacilitiesHtml('smith')}
            <div class="center-text"><button class="btn primary big" data-nav="leave">Leave</button></div>
          </div>
          ${this.partyHtml()}
        </div>`);
      this.on({
        ...this.common(render),
        ...this.workshopHandlers(render),
        ...this.wildHandlers(render),
        repair: (el) => { if (repairWeapon(run, el.dataset.uid!, el.dataset.w!)) { this.save(); render(); } },
        improve: (el) => { if (improveWeapon(run, el.dataset.uid!, el.dataset.w!)) { this.save(); render(); } },
        forge: async (el) => {
          const id = el.dataset.id!;
          const uid = await this.unitPicker(`Who gets the ${esc(itemName(id))}?`, (u) => canTake(u, id), (u) => this.itemPreview(u, id));
          if (uid && forgeWeapon(run, id, uid)) { this.save(); render(); }
        },
        leave: () => this.finishEvent(),
      });
    };
    render();
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

function armyReportHtml(r: { xp: number; levelUps: number; supplies: number; materials: number; morale: number; reputation: number; fairyDust: number; sacredEnergy: number; starving: boolean }): string {
  const sign = (n: number) => (n > 0 ? `+${n}` : String(n));
  const parts = [
    `Army EXP +${r.xp}${r.levelUps ? ` <b class="win">(Army Level up!)</b>` : ''}`,
    `Supplies ${sign(r.supplies)}`,
    r.materials ? `Materials ${sign(r.materials)}` : '',
    `Morale ${sign(r.morale)}`,
    r.reputation ? `Reputation ${sign(r.reputation)}` : '',
    r.fairyDust ? `Fairy Dust ${sign(r.fairyDust)}` : '',
    r.sacredEnergy ? `Sacred Energy ${sign(r.sacredEnergy)}` : '',
  ].filter(Boolean);
  return `<span class="dim small">${parts.join(' · ')}</span>${r.starving ? '<div class="bad small">Out of supplies! The army goes hungry (less recovery, lower morale).</div>' : ''}`;
}
