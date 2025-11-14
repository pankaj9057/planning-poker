// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Status Enums
export const PlayerStatus = {
  NOT_STARTED: 'NotStarted',
  IN_PROGRESS: 'InProgress',
  FINISHED: 'Finished',
} as const;

export const GameStatus = {
  STARTED: 'Started',
  IN_PROGRESS: 'InProgress',
  FINISHED: 'Finished',
} as const;

// Deck Definitions
export const DECK_FIBONACCI = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];
export const DECK_TSHIRT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'];

// Special Card Values (Sentinel)
export const SPECIAL_CARD_UNKNOWN = -2; // '?'
export const SPECIAL_CARD_COFFEE = -1;  // '☕'

// Languages
export const LANGUAGES = {
  en: 'English',
  es: 'Español',
} as const;
