// Image URLs. Newer art ships in a few JSON packs of data URIs (public/packs) to keep
// the published artifact's file count down; everything else is a plain PNG.

const PACKED: Record<'art' | 'portraits', Record<string, string>> = { art: {}, portraits: {} };

/** Load the art packs (call once before the first render; missing packs are fine). */
export async function loadArtPacks(): Promise<void> {
  try {
    const names: string[] = await (await fetch('packs/index.json')).json();
    await Promise.all(names.map(async (n) => {
      const data: Record<string, string> = await (await fetch(`packs/${n}.json`)).json();
      Object.assign(n.startsWith('portraits') ? PACKED.portraits : PACKED.art, data);
    }));
  } catch { /* no packs: fall back to PNG files */ }
}

export function imgUrl(kind: 'art' | 'portraits', id: string): string {
  return PACKED[kind][id] ?? `${kind}/${id}.png`;
}
