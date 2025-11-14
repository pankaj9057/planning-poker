import { SPECIAL_CARD_COFFEE, SPECIAL_CARD_UNKNOWN } from '../constants';
import type { Player } from '../types';

/**
 * Generates a simple UUID
 */
export const generateId = (): string => crypto.randomUUID();

/**
 * Calculates the average of valid votes, excluding special sentinel values.
 */
export const calculateAverage = (players: Player[]): number | null => {
  const validVotes = players
    .map(p => {
      // Convert T-Shirt sizes (non-numeric strings) to 0 for exclusion,
      // but numeric strings must be converted to numbers for calculation.
      const val = String(p.value);
      if (val === '?' || val === '☕') return SPECIAL_CARD_COFFEE; // Treat as special card
      if (isNaN(parseFloat(val))) return SPECIAL_CARD_COFFEE; // Exclude non-numeric strings
      return parseFloat(val);
    })
    .filter(val => val >= 0); // Only include non-negative numbers

  if (validVotes.length === 0) {
    return null;
  }

  const sum = validVotes.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / validVotes.length).toFixed(2));
};

/**
 * Converts card identifier to display value or sentinel value for storage.
 */
export const getCardValueForStorage = (card: string): number | string => {
  if (card === '?') return SPECIAL_CARD_UNKNOWN;
  if (card === '☕') return SPECIAL_CARD_COFFEE;
  // If numeric or T-Shirt, store as string to simplify schema and retain original type
  return card;
};

/**
 * Converts card value from storage to display value.
 */
export const getCardDisplayValue = (value: number | string | null): string => {
  if (value === SPECIAL_CARD_UNKNOWN) return '?';
  if (value === SPECIAL_CARD_COFFEE) return '☕';
  if (value === null || value === undefined) return '';
  return String(value);
};
