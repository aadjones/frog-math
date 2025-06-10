import { describe, it, expect } from "vitest";
import {
  hopDuration,
  playbackRate,
  nextIndex,
  MS_PER_PAD,
  AUDIO_REF_MS,
} from "../src/frogPhysics";

describe("frog physics", () => {
  it("hopDuration scales linearly", () => {
    expect(hopDuration(1)).toBe(MS_PER_PAD);
    expect(hopDuration(4)).toBe(4 * MS_PER_PAD);
  });

  it("playbackRate inverts duration and matches reference", () => {
    expect(playbackRate(MS_PER_PAD)).toBeCloseTo(AUDIO_REF_MS / MS_PER_PAD);
    expect(playbackRate(2 * MS_PER_PAD)).toBeCloseTo(
      AUDIO_REF_MS / (2 * MS_PER_PAD),
    );
  });

  it("nextIndex moves exactly hopSize in given direction", () => {
    expect(nextIndex(7, 3, 1)).toBe(10);
    expect(nextIndex(7, 3, -1)).toBe(4);
  });
});
