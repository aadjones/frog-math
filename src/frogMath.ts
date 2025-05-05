export function reachablePads(hop: number, padCount: number): Set<number> {
    const pads = new Set<number>();
    for (let i = 0; i < padCount; i++) {
      if (i % hop === 0) pads.add(i);
    }
    return pads;
  }
  
  export function gcd(a: number, b: number): number {
    while (b !== 0) [a, b] = [b, a % b];
    return a;
  }