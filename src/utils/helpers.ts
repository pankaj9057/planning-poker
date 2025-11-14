import { SPECIAL_CARD_UNKNOWN, SPECIAL_CARD_COFFEE } from '../constants';

/** Generates a simple UUID */
export const generateId = () => crypto.randomUUID();

/**
 * Calculates the average of valid votes, excluding special sentinel values.
 * @param {Array<{value: number | string}>} players - Array of player objects.
 * @returns {number | null} - The calculated average rounded to 2 decimals, or null.
 */
export const calculateAverage = (players) => {
  const validVotes = players
    .map(p => {
      const val = String(p.value);
      if (val === '?' || val === '☕') return SPECIAL_CARD_COFFEE;
      if (isNaN(parseFloat(val))) return SPECIAL_CARD_COFFEE;
      return parseFloat(val);
    })
    .filter(val => val >= 0);

  if (validVotes.length === 0) {
    return null;
  }

  const sum = validVotes.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / validVotes.length).toFixed(2));
};

/**
 * Converts card identifier to display value or sentinel value for storage.
 */
export const getCardValueForStorage = (card) => {
  if (card === '?') return SPECIAL_CARD_UNKNOWN;
  if (card === '☕') return SPECIAL_CARD_COFFEE;
  return card;
};

/**
 * Converts card value from storage to display value.
 */
export const getCardDisplayValue = (value) => {
  if (value === SPECIAL_CARD_UNKNOWN) return '?';
  if (value === SPECIAL_CARD_COFFEE) return '☕';
  if (value === null || value === undefined) return '';
  return String(value);
};