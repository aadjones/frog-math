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

/** Return a Set of pad indexes reachable from `start`
 *  using any combination of hop distances in `hops`
 *  within the inclusive range [min, max].
 */
export function reachablePadsMulti(
  start: number,
  hops: number[],
  min: number,
  max: number
): Set<number> {
  const reach = new Set<number>([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const h of hops) {
      for (const step of [h, -h]) {
        const nxt = cur + step;
        if (nxt < min || nxt > max || reach.has(nxt)) continue;
        reach.add(nxt);
        queue.push(nxt);
      }
    }
  }
  return reach;
}