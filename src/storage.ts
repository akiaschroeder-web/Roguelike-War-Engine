// Save storage that survives closing the page.
//
// The game reads and writes saves synchronously through `appStorage()`. In the published
// claude.ai page, saves are also kept in the artifact's private per-person database
// (data/users/<id>/save~<key>), which outlives the page, the browser session and new
// versions. Browser storage is kept as a local copy, and is the only store when the
// database isn't available (tests, local dev, signed-out viewers).

type Db = {
  doc(path: string): { get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>; set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> };
};

/** Keys that belong in the cloud save. */
const CLOUD_KEYS = ['hyrule.run.v1', 'hyrule.meta.v1', 'hyrule.wild.blueprints.v1', 'hyrule.audio', 'hyrule.battleAnims'];
const CHUNK = 200_000; // characters per database document (documents hold up to 256 KiB)

const mem = new Map<string, string | null>();
let cloud: { db: Db; base: string } | null = null;
const dirty = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
let writing: Promise<void> = Promise.resolve();
const listeners: ((s: SaveStatus) => void)[] = [];

export type SaveStatus = 'local' | 'cloud' | 'saving' | 'error';
let status: SaveStatus = 'local';
const setStatus = (s: SaveStatus) => { status = s; for (const f of listeners) f(s); };
export const saveStatus = () => status;
export const onSaveStatus = (f: (s: SaveStatus) => void) => { listeners.push(f); };

function local(): Storage | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}

/** The storage the game uses. Synchronous; cloud writes happen in the background. */
export function appStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  return {
    getItem(k) {
      if (mem.has(k)) return mem.get(k) ?? null;
      try { return local()?.getItem(k) ?? null; } catch { return null; }
    },
    setItem(k, v) {
      mem.set(k, v);
      try { local()?.setItem(k, v); } catch { /* full or blocked */ }
      queue(k);
    },
    removeItem(k) {
      mem.set(k, null);
      try { local()?.removeItem(k); } catch { /* blocked */ }
      queue(k);
    },
  };
}

function queue(k: string) {
  if (!cloud || !CLOUD_KEYS.includes(k)) return;
  dirty.add(k);
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 1200);
}

/** Write every changed key to the database, one write at a time. */
export function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = undefined; }
  if (!cloud || !dirty.size) return writing;
  const keys = [...dirty];
  dirty.clear();
  writing = writing.then(async () => {
    setStatus('saving');
    try {
      for (const k of keys) await writeKey(k, mem.has(k) ? mem.get(k) ?? null : null);
      setStatus(dirty.size ? 'saving' : 'cloud');
    } catch {
      for (const k of keys) dirty.add(k);
      setStatus('error');
      timer = setTimeout(flush, 8000);
    }
  });
  return writing;
}

async function writeKey(k: string, v: string | null) {
  const { db, base } = cloud!;
  const head = db.doc(`${base}/save~${k}`);
  const prev = await head.get().catch(() => undefined);
  const prevN = Number(prev?.exists ? prev.data()?.n ?? 0 : 0);
  const prevVer = String(prev?.exists ? prev.data()?.ver ?? '' : '');
  if (v === null) {
    await head.set({ gone: true, t: Date.now() });
  } else if (v.length <= CHUNK) {
    await head.set({ v, t: Date.now() });
  } else {
    // Large saves: write the pieces under a new version first, then point the head at them.
    const ver = String(Date.now());
    const n = Math.ceil(v.length / CHUNK);
    for (let i = 0; i < n; i++) await db.doc(`${base}/save~${k}~${ver}~${i}`).set({ d: v.slice(i * CHUNK, (i + 1) * CHUNK) });
    await head.set({ ver, n, t: Date.now() });
  }
  // Tidy the previous version's pieces.
  if (prevVer) for (let i = 0; i < prevN; i++) await db.doc(`${base}/save~${k}~${prevVer}~${i}`).delete().catch(() => undefined);
}

async function readKey(db: Db, base: string, k: string): Promise<string | null | undefined> {
  const snap = await db.doc(`${base}/save~${k}`).get();
  if (!snap.exists) return undefined; // never saved to the cloud
  const d = snap.data() ?? {};
  if (d.gone) return null;
  if (typeof d.v === 'string') return d.v;
  if (d.ver && d.n) {
    let s = '';
    for (let i = 0; i < Number(d.n); i++) {
      const c = await db.doc(`${base}/save~${k}~${String(d.ver)}~${i}`).get();
      if (!c.exists) return undefined;
      s += String(c.data()?.d ?? '');
    }
    return s;
  }
  return undefined;
}

/** Connect to the cloud save (if this page offers one) and load it. Resolves within ~10 s. */
export async function initCloudSave(): Promise<void> {
  const claude = (globalThis as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
  if (!claude?.use) return;
  const timeout = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<undefined>((r) => setTimeout(() => r(undefined), ms))]);
  try {
    const [db, user] = (await timeout(Promise.all([claude.use('db'), claude.use('user')]), 10_000)) ?? [];
    const id = db && user ? await timeout((user as { id(): Promise<string | null> }).id(), 10_000) : null;
    if (!db || !id) return;
    // Documents need an even number of path segments: data/users/<id>/<doc>.
    const base = `data/users/${id}`;
    const loaded = await timeout(Promise.all(CLOUD_KEYS.map((k) => readKey(db as Db, base, k).catch(() => undefined))), 12_000);
    if (!loaded) return; // the store didn't answer: keep playing on the local copy this visit
    cloud = { db: db as Db, base };
    CLOUD_KEYS.forEach((k, i) => {
      const v = loaded[i];
      if (v === undefined) {
        // Nothing in the cloud yet: upload what this browser already has.
        const l = local()?.getItem(k);
        if (l != null) { mem.set(k, l); dirty.add(k); }
      } else {
        mem.set(k, v);
        try { if (v === null) local()?.removeItem(k); else local()?.setItem(k, v); } catch { /* blocked */ }
      }
    });
    setStatus('cloud');
    if (dirty.size) void flush();
    // Get the last change out when the page is hidden or closed.
    const out = () => { void flush(); };
    addEventListener('pagehide', out);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') out(); });
  } catch {
    /* no cloud this visit */
  }
}

// ───────────────────────── Save files ─────────────────────────

const FILE_TAG = 'hyrule-tactical-war-save';

/** Everything worth keeping, as the text of a save file. */
export function exportSaveFile(): string {
  const st = appStorage();
  const keys: Record<string, string> = {};
  for (const k of CLOUD_KEYS) { const v = st.getItem(k); if (v != null) keys[k] = v; }
  return JSON.stringify({ tag: FILE_TAG, version: 1, savedAt: new Date().toISOString(), keys });
}

/** Load a save file's text. Returns false if it isn't one of ours. */
export function importSaveFile(text: string): boolean {
  let f: { tag?: string; keys?: Record<string, unknown> };
  try { f = JSON.parse(text); } catch { return false; }
  if (f?.tag !== FILE_TAG || !f.keys || typeof f.keys !== 'object') return false;
  const st = appStorage();
  for (const k of CLOUD_KEYS) {
    const v = f.keys[k];
    if (typeof v === 'string') st.setItem(k, v); else st.removeItem(k);
  }
  void flush();
  return true;
}

/** Offer the save file for download: the page's download capability, else an ordinary link. */
export async function downloadSaveFile(): Promise<boolean> {
  const data = exportSaveFile();
  const filename = `hyrule-war-save-${new Date().toISOString().slice(0, 10)}.json`;
  const claude = (globalThis as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
  try {
    const dl = (await claude?.use('downloads')) as { save(r: { filename: string; data: string }): Promise<unknown> } | null | undefined;
    if (dl) { await dl.save({ filename, data }); return true; }
  } catch { return false; /* declined or refused */ }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return true;
}
