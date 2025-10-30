/**
 * Utility functions for level and XP calculations
 */

/**
 * Calculate level from XP using easier progression
 * @param {number} xp - Total XP
 * @returns {number} Level
 */
export const calculateLevel = (xp) => {
  if (xp < 50) return 1;
  if (xp < 100) return 2;
  if (xp < 150) return 3;
  if (xp < 200) return 4;
  if (xp < 300) return 5;
  if (xp < 400) return 6;
  if (xp < 500) return 7;
  if (xp < 600) return 8;
  if (xp < 750) return 9;
  if (xp < 900) return 10;
  if (xp < 1100) return 11;
  if (xp < 1300) return 12;
  if (xp < 1500) return 13;
  if (xp < 1750) return 14;
  return 15; // Max level
};

/**
 * Get XP required for a specific level
 * @param {number} level - Target level
 * @returns {number} XP required to reach that level
 */
export const getXpForLevel = (level) => {
  const levelRequirements = {
    1: 0,
    2: 50,
    3: 100,
    4: 150,
    5: 200,
    6: 300,
    7: 400,
    8: 500,
    9: 600,
    10: 750,
    11: 900,
    12: 1100,
    13: 1300,
    14: 1500,
    15: 1750
  };
  return levelRequirements[level] !== undefined ? levelRequirements[level] : 1750;
};

/**
 * Get level progress information
 * @param {number} xp - Current XP
 * @param {number} level - Current level
 * @returns {object} Level progress information
 */
export const getLevelProgress = (xp, level) => {
  const currentLevelXp = getXpForLevel(level); // XP needed to reach current level
  const nextLevelXp = getXpForLevel(level + 1); // XP needed to reach next level
  const xpInCurrentLevel = xp - currentLevelXp; // XP earned in current level
  const xpNeededForNext = nextLevelXp - xp; // XP needed to reach next level
  const levelRange = nextLevelXp - currentLevelXp; // Total XP range for current level
  
  // Calculate progress percentage
  let progressPercentage;
  if (levelRange === 0) {
    // If we're at max level, show 100%
    progressPercentage = 100;
  } else {
    progressPercentage = (xpInCurrentLevel / levelRange) * 100;
  }
  
  return {
    xpInCurrentLevel: Math.max(0, xpInCurrentLevel),
    xpNeededForNext: Math.max(0, xpNeededForNext),
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  };
};

/**
 * Get level title based on level
 * @param {number} level - Current level
 * @returns {string} Level title
 */
export const getLevelTitle = (level) => {
  if (level <= 2) return 'Budget Beginner';
  if (level <= 5) return 'Savings Star';
  if (level <= 10) return 'Investment Explorer';
  return 'Financial Master';
};

/**
 * Get XP required for next level
 * @param {number} currentLevel - Current level
 * @returns {number} XP required for next level
 */
export const getXpForNextLevel = (currentLevel) => {
  return getXpForLevel(currentLevel + 1);
};
