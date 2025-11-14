import { SupabaseClient } from '@supabase/supabase-js';

export type Language = 'en' | 'es';

export interface Player {
  id: string;
  name: string;
  value: number | string | null;
  status: string;
  game_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: string;
  name: string;
  story_name?: string;
  game_status: string;
  created_by_id: string;
  created_by_name: string;
  deck_type: 'fibonacci' | 'tshirt';
  auto_reveal: boolean;
  is_allow_members_to_manage_session: boolean;
  cards?: string[];
  average?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface GameData {
  name: string;
  story_name?: string;
  deck_type: 'fibonacci' | 'tshirt';
  auto_reveal: boolean;
  is_allow_members_to_manage_session: boolean;
}

export interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface GameState {
  game: Game | null;
  players: Player[];
  currentPlayer: Player | null;
  loading: boolean;
  error: string | null;
  finishedCount: number;
  totalPlayers: number;
  isModerator: boolean;
  canReveal: boolean;
  canReset: boolean;
  statusMessage: string;
  canRevealOrReset: boolean;
}

export interface GameActions {
  createGame: (gameData: GameData, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
  joinGame: (gameId: string, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
  vote: (gameId: string, playerId: string, card: string) => Promise<void>;
  revealVotes: (gameId: string, players: Player[], canReveal: boolean) => Promise<void>;
  resetRound: (gameId: string, players: Player[], canReset: boolean) => Promise<void>;
  clearStatus: () => void;
  displayMessage: (textKey: string, type: 'success' | 'error' | 'info') => void;
  statusMessage: Message;
}

export interface UseSupabaseReturn {
  supabase: SupabaseClient | null;
  userId: string | null;
  isAuthReady: boolean;
  configError: string | null;
}

export interface TranslationFunction {
  (key: string): string;
}

export interface CardProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
  isRevealed: boolean;
  isDisabled: boolean;
}

export interface StatusMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

