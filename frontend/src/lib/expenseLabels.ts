/**
 * Utility functions for mapping expense entry numeric values to human-readable labels
 */

export const EXPENSE_CATEGORIES: Record<number, string> = {
  1: "🍔 Food & Dining",
  2: "🚗 Transportation",
  3: "🛍️ Shopping & Entertainment",
  4: "🏠 Housing & Utilities",
  5: "🏥 Healthcare",
};

export const EXPENSE_LEVELS: Record<number, string> = {
  1: "Very Low (<$10)",
  2: "Low ($10-$30)",
  3: "Moderate Low ($30-$50)",
  4: "Moderate ($50-$100)",
  5: "Medium ($100-$200)",
  6: "Moderate High ($200-$300)",
  7: "High ($300-$500)",
  8: "Very High ($500-$1000)",
  9: "Extremely High ($1000-$2000)",
  10: "Maximum (>$2000)",
};

export const SATISFACTION_LEVELS: Record<number, string> = {
  1: "😊 Very Satisfied",
  2: "🙂 Satisfied",
  3: "😐 Neutral",
  4: "😕 Dissatisfied",
  5: "😞 Very Dissatisfied",
};

/**
 * Get category label by number
 */
export function getCategoryLabel(category: number): string {
  return EXPENSE_CATEGORIES[category] || `Category ${category}`;
}

/**
 * Get level label by number
 */
export function getLevelLabel(level: number): string {
  return EXPENSE_LEVELS[level] || `Level ${level}`;
}

/**
 * Get satisfaction label by number
 */
export function getSatisfactionLabel(emotion: number): string {
  return SATISFACTION_LEVELS[emotion] || `Emotion ${emotion}`;
}

/**
 * Get category name without emoji (for charts/analysis)
 */
export function getCategoryName(category: number): string {
  const label = EXPENSE_CATEGORIES[category] || `Category ${category}`;
  // Remove emoji and return clean name
  // Find the first space and take everything after it (emoji is always at the start followed by space)
  const spaceIndex = label.indexOf(' ');
  if (spaceIndex !== -1) {
    return label.substring(spaceIndex + 1).trim();
  }
  return label;
}

