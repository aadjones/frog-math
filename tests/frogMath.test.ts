import { describe, it, expect } from "vitest";
import { reachablePads, gcd, reachablePadsMulti } from "../src/frogMath";

describe("frogMath", () => {
  it("reachablePads with hop=3 out of 10", () => {
    expect(Array.from(reachablePads(3, 10))).toEqual([0, 3, 6, 9]);
  });
  it("gcd works", () => {
    expect(gcd(21, 14)).toBe(7);
  });
});

describe("multi‑hopper reachability", () => {
  it("gcd of 5 and 7 is 1", () => {
    expect(gcd(5, 7)).toBe(1);
  });

  it("5/7‑hopper reaches every pad in a local window", () => {
    const reach = reachablePadsMulti(0, [5, 7], -30, 30);
    for (let i = -30; i <= 30; i++) {
      expect(reach.has(i)).toBe(true);
    }
  });

  it("non‑coprime hops miss some pads", () => {
    const reach = reachablePadsMulti(0, [4, 6], -20, 20);
    // Only even numbers should be reachable
    for (let i = -20; i <= 20; i++) {
      expect(reach.has(i)).toBe(i % 2 === 0);
    }
  });
});
