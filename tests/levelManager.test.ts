import { describe, it, expect, beforeEach } from 'vitest';
import { LevelManager, Level } from '../src/ui/levelManager';
import { MULTI_HOPPER_LEVELS, createMultiHopperLevelManager } from '../src/ui/levelSets';

describe('LevelManager', () => {
  let levelManager: LevelManager;
  let testLevels: Level[];

  beforeEach(() => {
    testLevels = [
      {
        id: 1,
        target: 2,
        description: "Test level 1",
        hopDistances: [5, 7]
      },
      {
        id: 2,
        target: 3,
        description: "Test level 2",
        hopDistances: [5, 7]
      },
      {
        id: 3,
        target: 1,
        description: "Test level 3",
        hopDistances: [5, 7]
      }
    ];
    levelManager = new LevelManager(testLevels);
  });

  describe('initialization', () => {
    it('should start at level 0', () => {
      expect(levelManager.getCurrentLevelIndex()).toBe(0);
    });

    it('should return correct total levels', () => {
      expect(levelManager.getTotalLevels()).toBe(3);
    });

    it('should return the first level as current', () => {
      expect(levelManager.getCurrentLevel()).toEqual(testLevels[0]);
    });

    it('should have no completed levels initially', () => {
      expect(levelManager.isCurrentLevelCompleted()).toBe(false);
      expect(levelManager.isGameCompleted()).toBe(false);
    });
  });

  describe('level navigation', () => {
    it('should advance to next level', () => {
      expect(levelManager.advanceToNextLevel()).toBe(true);
      expect(levelManager.getCurrentLevelIndex()).toBe(1);
      expect(levelManager.getCurrentLevel()).toEqual(testLevels[1]);
    });

    it('should not advance past last level', () => {
      levelManager.goToLevel(2);
      expect(levelManager.advanceToNextLevel()).toBe(false);
      expect(levelManager.getCurrentLevelIndex()).toBe(2);
    });

    it('should go to previous level', () => {
      levelManager.goToLevel(1);
      expect(levelManager.goToPreviousLevel()).toBe(true);
      expect(levelManager.getCurrentLevelIndex()).toBe(0);
    });

    it('should not go before first level', () => {
      expect(levelManager.goToPreviousLevel()).toBe(false);
      expect(levelManager.getCurrentLevelIndex()).toBe(0);
    });

    it('should go to specific level', () => {
      expect(levelManager.goToLevel(2)).toBe(true);
      expect(levelManager.getCurrentLevelIndex()).toBe(2);
    });

    it('should not go to invalid level', () => {
      expect(levelManager.goToLevel(-1)).toBe(false);
      expect(levelManager.goToLevel(5)).toBe(false);
      expect(levelManager.getCurrentLevelIndex()).toBe(0);
    });

    it('should check navigation availability', () => {
      expect(levelManager.canGoToPreviousLevel()).toBe(false);
      expect(levelManager.canGoToNextLevel()).toBe(true);

      levelManager.goToLevel(1);
      expect(levelManager.canGoToPreviousLevel()).toBe(true);
      expect(levelManager.canGoToNextLevel()).toBe(true);

      levelManager.goToLevel(2);
      expect(levelManager.canGoToPreviousLevel()).toBe(true);
      expect(levelManager.canGoToNextLevel()).toBe(false);
    });
  });

  describe('level completion', () => {
    it('should mark current level as completed', () => {
      levelManager.completeCurrentLevel();
      expect(levelManager.isCurrentLevelCompleted()).toBe(true);
      expect(levelManager.isLevelCompleted(0)).toBe(true);
    });

    it('should track multiple completed levels', () => {
      levelManager.completeCurrentLevel();
      levelManager.goToLevel(1);
      levelManager.completeCurrentLevel();
      
      expect(levelManager.isLevelCompleted(0)).toBe(true);
      expect(levelManager.isLevelCompleted(1)).toBe(true);
      expect(levelManager.isLevelCompleted(2)).toBe(false);
    });

    it('should detect game completion', () => {
      levelManager.completeCurrentLevel();
      levelManager.goToLevel(1);
      levelManager.completeCurrentLevel();
      levelManager.goToLevel(2);
      levelManager.completeCurrentLevel();
      
      expect(levelManager.isGameCompleted()).toBe(true);
    });
  });

  describe('win condition checking', () => {
    it('should check win condition correctly', () => {
      const currentLevel = levelManager.getCurrentLevel();
      expect(levelManager.checkWinCondition(currentLevel.target)).toBe(true);
      expect(levelManager.checkWinCondition(currentLevel.target + 1)).toBe(false);
    });

    it('should handle win and auto-advance', () => {
      const currentLevel = levelManager.getCurrentLevel();
      expect(levelManager.handleWin(currentLevel.target)).toBe(true);
      expect(levelManager.getCurrentLevelIndex()).toBe(1);
      expect(levelManager.isLevelCompleted(0)).toBe(true);
    });

    it('should not advance on non-win position', () => {
      expect(levelManager.handleWin(999)).toBe(false);
      expect(levelManager.getCurrentLevelIndex()).toBe(0);
      expect(levelManager.isLevelCompleted(0)).toBe(false);
    });

    it('should not advance on final level win', () => {
      levelManager.goToLevel(2);
      const currentLevel = levelManager.getCurrentLevel();
      expect(levelManager.handleWin(currentLevel.target)).toBe(false);
      expect(levelManager.getCurrentLevelIndex()).toBe(2);
      expect(levelManager.isLevelCompleted(2)).toBe(true);
    });
  });
});

describe('MULTI_HOPPER_LEVELS', () => {
  it('should have correct level progression', () => {
    expect(MULTI_HOPPER_LEVELS).toHaveLength(3);
    expect(MULTI_HOPPER_LEVELS[0].target).toBe(2);
    expect(MULTI_HOPPER_LEVELS[1].target).toBe(3);
    expect(MULTI_HOPPER_LEVELS[2].target).toBe(1);
  });

  it('should have consistent hop distances', () => {
    MULTI_HOPPER_LEVELS.forEach(level => {
      expect(level.hopDistances).toEqual([5, 7]);
    });
  });
});

describe('createMultiHopperLevelManager', () => {
  it('should create manager with correct levels', () => {
    const manager = createMultiHopperLevelManager();
    expect(manager.getTotalLevels()).toBe(3);
    expect(manager.getCurrentLevel()).toEqual(MULTI_HOPPER_LEVELS[0]);
  });
}); 