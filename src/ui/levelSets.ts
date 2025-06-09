import type { Level } from './levelManager';
import { LevelManager } from './levelManager';

export const MULTI_HOPPER_LEVELS: Level[] = [
  {
    id: 1,
    target: 2,
    description: "Get to the fly on lilypad 2!",
    hopDistances: [5, 7]
  },
  {
    id: 2,
    target: 3,
    description: "Get to the fly on lilypad 3!",
    hopDistances: [5, 7]
  },
  {
    id: 3,
    target: 1,
    description: "Get to the fly on lilypad 1!",
    hopDistances: [5, 7]
  }
];

export function createMultiHopperLevelManager(): LevelManager {
  return new LevelManager(MULTI_HOPPER_LEVELS);
} 