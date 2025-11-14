import { useState, useCallback } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Player, StatusMessage, GameData } from '../types';
import { PlayerStatus, GameStatus, DECK_FIBONACCI, DECK_TSHIRT } from '../constants';
import { calculateAverage, getCardValueForStorage, generateId } from '../utils/gameUtils';

interface UseGameActionsReturn {
  createGame: (gameData: GameData, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
  joinGame: (gameId: string, displayName: string) => Promise<{ gameId: string; playerId: string } | null>;
  vote: (gameId: string, playerId: string, card: string | number) => Promise<void>;
  revealVotes: (gameId: string, players: Player[], canReveal: boolean) => Promise<void>;
  resetRound: (gameId: string, players: Player[], canReset: boolean) => Promise<void>;
  statusMessage: StatusMessage;
  clearStatus: () => void;
  displayMessage: (textKey: string, type: 'info' | 'error') => void;
}

/**
 * Hook for game actions: create, join, vote, reveal, reset.
 * Manages all game interactions and status messaging.
 */
export const useGameActions = (
  supabase: SupabaseClient | null,
  userId: string | null,
  t: (key: string) => string
): UseGameActionsReturn => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ text: '', type: 'info' });

  const clearStatus = () => setStatusMessage({ text: '', type: 'info' });

  const displayMessage = (textKey: string, type: 'info' | 'error') => {
    setStatusMessage({ text: t(textKey) || textKey, type });
    setTimeout(clearStatus, 3000);
  };

  /**
   * Creates a new game document and the moderator's player document.
   */
  const createGame = useCallback(async (gameData: GameData, displayName: string) => {
    if (!supabase || !userId) {
      displayMessage('System error: Auth not ready.', 'error');
      return null;
    }
    const gameId = generateId();
    const playerId = userId;

    const now = new Date().toISOString();
    const newGame = {
      id: gameId,
      name: gameData.name,
      average: null,
      game_status: GameStatus.STARTED,
      game_type: gameData.deck_type,
      is_allow_members_to_manage_session: false,
      story_name: gameData.story_name || null,
      auto_reveal: gameData.auto_reveal,
      cards: gameData.deck_type === 'fibonacci' ? DECK_FIBONACCI : DECK_TSHIRT,
      created_by: displayName,
      created_by_id: playerId,
      created_at: now,
      updated_at: now,
      show_timer: false,
      show_qr_code: false,
      timer_minutes: 5,
    };

    const newPlayer = {
      id: playerId,
      game_id: gameId,
      name: displayName,
      status: PlayerStatus.NOT_STARTED,
      value: null,
      emoji: null,
    };

    try {
      // Insert game
      const { error: gameError } = await supabase
        .from('games')
        .insert([newGame]);

      if (gameError) throw gameError;

      // Check if player already exists (from previous session with same UUID)
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (!existingPlayer) {
        // Insert player only if doesn't exist
        const { error: playerError } = await supabase
          .from('players')
          .insert([newPlayer]);

        if (playerError) throw playerError;
      } else {
        // Update existing player to join this game
        const { error: updateError } = await supabase
          .from('players')
          .update({
            game_id: gameId,
            name: displayName,
            status: PlayerStatus.NOT_STARTED,
            value: null,
            emoji: null,
          })
          .eq('id', playerId);

        if (updateError) throw updateError;
      }

      return { gameId, playerId };
    } catch (e) {
      console.error('Error creating game:', e);
      displayMessage('Failed to create game. Please try again.', 'error');
      return null;
    }
  }, [supabase, userId, t]);

  /**
   * Joins an existing game by creating a new player document.
   */
  const joinGame = useCallback(async (gameId: string, displayName: string) => {
    if (!supabase || !userId) {
      displayMessage('System error: Auth not ready.', 'error');
      return null;
    }
    const playerId = userId;

    try {
      // Check if game exists
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw new Error('Game not found.');
      }

      // Check if player already exists in this specific game
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .eq('game_id', gameId)
        .maybeSingle();

      if (existingPlayer) {
        return { gameId, playerId };
      }

      // Check if player ID exists in any other game
      const { data: playerInOtherGame } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (playerInOtherGame) {
        // Update existing player to join this new game
        const { error: updateError } = await supabase
          .from('players')
          .update({
            game_id: gameId,
            name: displayName,
            status: PlayerStatus.NOT_STARTED,
            value: null,
            emoji: null,
          })
          .eq('id', playerId);

        if (updateError) throw updateError;
      } else {
        // Create new player
        const newPlayer = {
          id: playerId,
          game_id: gameId,
          name: displayName,
          status: PlayerStatus.NOT_STARTED,
          value: null,
          emoji: null,
        };

        const { error: playerError } = await supabase
          .from('players')
          .insert([newPlayer]);

        if (playerError) throw playerError;
      }

      // Update game's updated_at
      await supabase
        .from('games')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', gameId);

      return { gameId, playerId };
    } catch (e) {
      const msg = (e as Error).message === 'Game not found.' ? 'Game not found.' : 'Failed to join game. Check ID.';
      displayMessage(msg, 'error');
      console.error('Error joining game:', e);
      return null;
    }
  }, [supabase, userId, t]);

  /**
   * Player selects a card, updating their vote value and status.
   */
  const vote = useCallback(async (gameId: string, playerId: string, card: string | number) => {
    if (!supabase || !playerId) return;

    const storedValue = getCardValueForStorage(String(card));

    try {
      // Check game status first
      const { data: game } = await supabase
        .from('games')
        .select('game_status')
        .eq('id', gameId)
        .maybeSingle();

      if (game?.game_status === GameStatus.FINISHED) {
        throw new Error('Cannot vote after reveal.');
      }

      // Update player
      const { error: playerError } = await supabase
        .from('players')
        .update({
          value: storedValue,
          status: PlayerStatus.FINISHED,
        })
        .eq('id', playerId)
        .eq('game_id', gameId);

      if (playerError) throw playerError;

      // Update game status if it was 'Started'
      if (game?.game_status === GameStatus.STARTED) {
        await supabase
          .from('games')
          .update({
            game_status: GameStatus.IN_PROGRESS,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId);
      }
    } catch (e) {
      console.error('Error recording vote:', e);
      displayMessage('Failed to place vote.', 'error');
    }
  }, [supabase, t]);

  /**
   * Moderator reveals the votes and calculates the average.
   */
  const revealVotes = useCallback(async (gameId: string, players: Player[], canReveal: boolean) => {
    if (!supabase || !canReveal) {
      displayMessage('NOT_AUTHORIZED', 'error');
      return;
    }

    try {
      const { data: game } = await supabase
        .from('games')
        .select('game_status')
        .eq('id', gameId)
        .single();

      if (game?.game_status === GameStatus.FINISHED) {
        throw new Error('Game already revealed.');
      }

      const newAverage = calculateAverage(players);

      const { error } = await supabase
        .from('games')
        .update({
          average: newAverage,
          game_status: GameStatus.FINISHED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (error) throw error;
    } catch (e) {
      console.error('Error revealing votes:', e);
      displayMessage('Failed to reveal votes.', 'error');
    }
  }, [supabase, t]);

  /**
   * Moderator resets the round, clearing all player votes and statuses.
   */
  const resetRound = useCallback(async (gameId: string, players: Player[], canReset: boolean) => {
    if (!supabase || !canReset) {
      displayMessage('NOT_AUTHORIZED', 'error');
      return;
    }

    try {
      // Update Game
      const { error: gameError } = await supabase
        .from('games')
        .update({
          average: null,
          game_status: GameStatus.STARTED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (gameError) throw gameError;

      // Update all players
      for (const player of players) {
        await supabase
          .from('players')
          .update({
            value: null,
            status: PlayerStatus.NOT_STARTED,
            emoji: null,
          })
          .eq('id', player.id);
      }

      displayMessage('Round reset!', 'info');
    } catch (e) {
      console.error('Error resetting round:', e);
      displayMessage('Failed to reset round.', 'error');
    }
  }, [supabase, t]);

  return { createGame, joinGame, vote, revealVotes, resetRound, statusMessage, clearStatus, displayMessage };
};
