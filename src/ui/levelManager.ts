export interface Level {
  id: number;
  target: number;
  description: string;
  hopDistances: number[];
}

export interface LevelState {
  currentLevelIndex: number;
  levels: Level[];
  completedLevels: Set<number>;
}

export class LevelManager {
  private state: LevelState;

  constructor(levels: Level[]) {
    this.state = {
      currentLevelIndex: 0,
      levels,
      completedLevels: new Set(),
    };
  }

  getCurrentLevel(): Level {
    return this.state.levels[this.state.currentLevelIndex];
  }

  getCurrentLevelIndex(): number {
    return this.state.currentLevelIndex;
  }

  getTotalLevels(): number {
    return this.state.levels.length;
  }

  isLevelCompleted(levelIndex: number): boolean {
    return this.state.completedLevels.has(levelIndex);
  }

  isCurrentLevelCompleted(): boolean {
    return this.isLevelCompleted(this.state.currentLevelIndex);
  }

  isGameCompleted(): boolean {
    return this.state.completedLevels.size === this.state.levels.length;
  }

  completeCurrentLevel(): void {
    this.state.completedLevels.add(this.state.currentLevelIndex);
  }

  advanceToNextLevel(): boolean {
    if (this.state.currentLevelIndex < this.state.levels.length - 1) {
      this.state.currentLevelIndex++;
      return true;
    }
    return false;
  }

  goToLevel(levelIndex: number): boolean {
    if (levelIndex >= 0 && levelIndex < this.state.levels.length) {
      this.state.currentLevelIndex = levelIndex;
      return true;
    }
    return false;
  }

  canGoToPreviousLevel(): boolean {
    return this.state.currentLevelIndex > 0;
  }

  canGoToNextLevel(): boolean {
    return this.state.currentLevelIndex < this.state.levels.length - 1;
  }

  goToPreviousLevel(): boolean {
    if (this.canGoToPreviousLevel()) {
      this.state.currentLevelIndex--;
      return true;
    }
    return false;
  }

  goToNextLevel(): boolean {
    if (this.canGoToNextLevel()) {
      this.state.currentLevelIndex++;
      return true;
    }
    return false;
  }

  checkWinCondition(frogPosition: number): boolean {
    const currentLevel = this.getCurrentLevel();
    return frogPosition === currentLevel.target;
  }

  handleWin(frogPosition: number): boolean {
    if (this.checkWinCondition(frogPosition)) {
      this.completeCurrentLevel();
      return this.advanceToNextLevel();
    }
    return false;
  }
}
