import { appStorage } from '../storage';
// Sound effects (synthesized with Web Audio, so no files are needed) and
// optional background music. Drop music files into public/music/ named after
// the tracks below (e.g. public/music/battle.mp3); missing tracks just stay silent.

export type Sfx =
  | 'tick' | 'select' | 'move' | 'cancel' | 'confirm' | 'hit' | 'crit' | 'miss' | 'block' | 'heal' | 'death'
  | 'levelUp' | 'spell' | 'song' | 'bomb' | 'coin' | 'victory' | 'defeat' | 'phase' | 'error' | 'transform'
  | 'chest' | 'secret' | 'step';

export type Track = 'title' | 'map' | 'battle' | 'boss' | 'victory' | 'gameover' | 'camp' | 'shop' | 'termina' | 'moon';

/** Each track tries these extensions in order. */
const EXTS = ['mp3', 'ogg', 'm4a', 'wav'];

interface AudioSettings { sfx: number; music: number; muted: boolean }

const KEY = 'hyrule.audio';

function load(): AudioSettings {
  try {
    const raw = appStorage().getItem(KEY);
    if (raw) return { sfx: 0.6, music: 0.5, muted: false, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { sfx: 0.6, music: 0.5, muted: false };
}

let settings = load();
/** Re-read the settings once the cloud save has loaded. */
export function reloadAudioSettings() { settings = load(); }
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function audioSettings(): AudioSettings {
  return { ...settings };
}

export function setAudio(next: Partial<AudioSettings>) {
  settings = { ...settings, ...next };
  try { appStorage().setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  if (master) master.gain.value = settings.muted ? 0 : settings.sfx;
  if (musicEl) musicEl.volume = settings.muted ? 0 : settings.music;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = settings.muted ? 0 : settings.sfx;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

type Wave = OscillatorType;

/** One tone with a quick attack and exponential decay. */
function tone(freq: number, start: number, dur: number, type: Wave = 'square', vol = 0.25, slideTo?: number) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A burst of filtered noise (impacts, explosions). */
function noise(start: number, dur: number, vol = 0.3, freq = 1200, q = 0.8) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + start;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

const N = (semis: number) => 440 * Math.pow(2, semis / 12); // semitones from A4

const SOUNDS: Record<Sfx, () => void> = {
  tick: () => tone(1320, 0, 0.04, 'square', 0.08),
  step: () => tone(220, 0, 0.03, 'triangle', 0.08),
  select: () => { tone(N(3), 0, 0.06, 'square', 0.12); tone(N(10), 0.05, 0.08, 'square', 0.12); },
  move: () => { tone(N(-2), 0, 0.05, 'triangle', 0.15); tone(N(5), 0.05, 0.07, 'triangle', 0.15); },
  cancel: () => { tone(N(5), 0, 0.06, 'square', 0.1); tone(N(-2), 0.05, 0.08, 'square', 0.1); },
  confirm: () => { tone(N(7), 0, 0.06, 'square', 0.14); tone(N(12), 0.06, 0.1, 'square', 0.14); },
  error: () => { tone(110, 0, 0.12, 'sawtooth', 0.12); tone(104, 0.12, 0.14, 'sawtooth', 0.12); },
  hit: () => { noise(0, 0.12, 0.35, 900); tone(160, 0, 0.1, 'square', 0.15, 70); },
  crit: () => { noise(0, 0.25, 0.5, 600, 0.5); tone(240, 0, 0.2, 'sawtooth', 0.2, 60); tone(N(12), 0.05, 0.12, 'square', 0.12); },
  miss: () => { noise(0, 0.16, 0.12, 3500, 2); },
  block: () => { tone(1800, 0, 0.08, 'square', 0.1); tone(2400, 0.02, 0.12, 'triangle', 0.1); },
  heal: () => [0, 4, 7, 12].forEach((s, i) => tone(N(s + 3), i * 0.07, 0.18, 'sine', 0.16)),
  death: () => { tone(N(-5), 0, 0.2, 'triangle', 0.2, N(-17)); noise(0.05, 0.3, 0.15, 400); },
  levelUp: () => [0, 4, 7, 12, 16].forEach((s, i) => tone(N(s + 3), i * 0.08, 0.2, 'square', 0.12)),
  spell: () => { tone(N(0), 0, 0.4, 'sine', 0.15, N(24)); tone(N(7), 0.05, 0.35, 'triangle', 0.1, N(19)); },
  // A little ocarina-ish phrase.
  song: () => [7, 12, 9, 7, 12].forEach((s, i) => tone(N(s), i * 0.16, 0.22, 'sine', 0.2)),
  bomb: () => { noise(0, 0.5, 0.6, 180, 0.4); tone(90, 0, 0.4, 'sine', 0.3, 35); },
  coin: () => { tone(N(14), 0, 0.06, 'square', 0.12); tone(N(19), 0.06, 0.16, 'square', 0.12); },
  victory: () => [0, 4, 7, 12, 7, 12].forEach((s, i) => tone(N(s + 3), i * 0.12, i === 5 ? 0.5 : 0.14, 'square', 0.13)),
  defeat: () => [7, 6, 5, 0].forEach((s, i) => tone(N(s - 5), i * 0.22, 0.3, 'triangle', 0.18)),
  phase: () => { tone(N(0), 0, 0.12, 'square', 0.1); tone(N(7), 0.1, 0.18, 'square', 0.1); },
  transform: () => { tone(N(-12), 0, 0.6, 'sawtooth', 0.12, N(12)); noise(0.1, 0.5, 0.15, 2000, 3); },
  chest: () => [0, 2, 4, 5, 7, 9, 11, 12].forEach((s, i) => tone(N(s + 3), i * 0.05, 0.1, 'square', 0.1)),
  secret: () => [7, 6, 3, -3, -4, 4, 8, 12].forEach((s, i) => tone(N(s), i * 0.09, 0.12, 'square', 0.1)),
};

export function sfx(name: Sfx) {
  if (settings.muted || settings.sfx <= 0) return;
  try { SOUNDS[name](); } catch { /* audio unavailable */ }
}

// ───────────────────────── Music ─────────────────────────

let musicEl: HTMLAudioElement | null = null;
let current: Track | null = null;
const missing = new Set<string>();

/** Play a looping track if its file exists in public/music/; otherwise stay silent. */
export function music(track: Track | null) {
  if (track === current) return;
  current = track;
  if (musicEl) { musicEl.pause(); musicEl = null; }
  if (!track || typeof Audio === 'undefined') return;
  const tryExt = (i: number) => {
    if (current !== track || i >= EXTS.length) return;
    const url = `music/${track}.${EXTS[i]}`;
    if (missing.has(url)) return tryExt(i + 1);
    const el = new Audio(url);
    el.loop = true;
    el.volume = settings.muted ? 0 : settings.music;
    el.addEventListener('error', () => { missing.add(url); if (musicEl === el) musicEl = null; tryExt(i + 1); }, { once: true });
    musicEl = el;
    void el.play().catch(() => {
      // Autoplay blocked until the first click: start on the next interaction.
      const resume = () => { if (musicEl === el) void el.play().catch(() => undefined); };
      window.addEventListener('pointerdown', resume, { once: true });
    });
  };
  tryExt(0);
}

/** Generic click feedback for buttons. */
export function installClickSounds(root: HTMLElement) {
  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('button, .choice, [data-nav]') as HTMLButtonElement | null;
    if (!t) return;
    if (t.disabled) sfx('error');
    else sfx('tick');
  }, true);
}
