// Small, fast, seedable PRNG (mulberry32). State is a single integer so it
// serialises trivially into save data.

export class RNG {
  constructor(public state: number) {
    this.state = state >>> 0;
  }

  next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Inclusive integer range. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Roll a percentage: true with probability pct/100. */
  chance(pct: number): boolean {
    return this.next() * 100 < pct;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  weighted<T>(entries: readonly [T, number][]): T {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = this.next() * total;
    for (const [v, w] of entries) {
      if ((roll -= w) < 0) return v;
    }
    return entries[entries.length - 1][0];
  }
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}
