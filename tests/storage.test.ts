import { describe, expect, it, vi } from 'vitest';

function fakeDb() {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    doc: (path: string) => {
      // Like the real database: a document path has an even number of segments.
      if (path.split('/').length % 2) throw new Error(`not a document path: ${path}`);
      return {
      get: async () => ({ exists: docs.has(path), data: () => docs.get(path) }),
      set: async (d: Record<string, unknown>) => { docs.set(path, JSON.parse(JSON.stringify(d))); },
      delete: async () => { docs.delete(path); },
    }; },
  };
}
function install(db: ReturnType<typeof fakeDb>, local: Map<string, string>) {
  const g = globalThis as Record<string, unknown>;
  g.claude = { use: async (n: string) => (n === 'db' ? db : n === 'user' ? { id: async () => 'u1' } : null) };
  g.localStorage = { getItem: (k: string) => local.get(k) ?? null, setItem: (k: string, v: string) => local.set(k, v), removeItem: (k: string) => local.delete(k) };
  g.addEventListener = () => {};
  g.document = { addEventListener: () => {}, visibilityState: 'visible' };
}

describe('cloud save', () => {
  it('a save made in one visit loads in the next, even with browser storage wiped', async () => {
    const db = fakeDb();
    install(db, new Map());
    vi.resetModules();
    let s = await import('../src/storage');
    await s.initCloudSave();
    expect(s.saveStatus()).toBe('cloud');
    s.appStorage().setItem('hyrule.run.v1', '{"act":3}');
    s.appStorage().setItem('hyrule.meta.v1', '{"runs":2}');
    await s.flush();
    expect(db.docs.get('data/users/u1/save~hyrule.run.v1')?.v).toBe('{"act":3}');

    install(db, new Map()); // browser storage gone
    vi.resetModules();
    s = await import('../src/storage');
    expect(s.appStorage().getItem('hyrule.run.v1')).toBeNull();
    await s.initCloudSave();
    expect(s.appStorage().getItem('hyrule.run.v1')).toBe('{"act":3}');
    expect(s.appStorage().getItem('hyrule.meta.v1')).toBe('{"runs":2}');

    s.appStorage().removeItem('hyrule.run.v1');
    await s.flush();
    install(db, new Map([['hyrule.run.v1', 'stale']]));
    vi.resetModules();
    s = await import('../src/storage');
    await s.initCloudSave();
    expect(s.appStorage().getItem('hyrule.run.v1')).toBeNull();
  });

  it('splits big saves across documents and reassembles them', async () => {
    const db = fakeDb();
    install(db, new Map());
    vi.resetModules();
    let s = await import('../src/storage');
    await s.initCloudSave();
    const big = 'x'.repeat(450_000) + 'end';
    s.appStorage().setItem('hyrule.run.v1', big);
    await s.flush();
    s.appStorage().setItem('hyrule.run.v1', big + '2');
    await s.flush();
    const pieces = [...db.docs.keys()].filter((k) => k.split('~').length > 2);
    expect(pieces.length).toBe(3); // old version's pieces were tidied
    install(db, new Map());
    vi.resetModules();
    s = await import('../src/storage');
    await s.initCloudSave();
    expect(s.appStorage().getItem('hyrule.run.v1')).toBe(big + '2');
  });

  it('uploads an existing browser save the first time the cloud is available', async () => {
    const db = fakeDb();
    install(db, new Map([['hyrule.meta.v1', '{"runs":9}']]));
    vi.resetModules();
    const s = await import('../src/storage');
    await s.initCloudSave();
    await s.flush();
    expect(db.docs.get('data/users/u1/save~hyrule.meta.v1')?.v).toBe('{"runs":9}');
  });
});

import { appStorage as st2, exportSaveFile, importSaveFile } from '../src/storage';
describe('save files', () => {
  it('round-trips the saved keys through a file', () => {
    st2().setItem('hyrule.run.v1', '{"act":7}');
    st2().setItem('hyrule.meta.v1', '{"runs":3}');
    const file = exportSaveFile();
    st2().setItem('hyrule.run.v1', '{"act":1}');
    expect(importSaveFile(file)).toBe(true);
    expect(st2().getItem('hyrule.run.v1')).toBe('{"act":7}');
    expect(st2().getItem('hyrule.meta.v1')).toBe('{"runs":3}');
  });
  it('rejects files that are not saves', () => {
    expect(importSaveFile('{"hello":1}')).toBe(false);
    expect(importSaveFile('not json')).toBe(false);
  });
});
