import { useState, useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Game, Player } from '../types';
import { PlayerStatus, GameStatus } from '../constants';
import { calculateAverage } from '../utils/gameUtils';

interface UseGameDataReturn {
  game: Game | null;
  players: Player[];
  currentPlayer: Player | undefined;
  loading: boolean;
  error: string | null;
  finishedCount: number;
  totalPlayers: number;
  isModerator: boolean;
  canReveal: boolean;
  canReset: boolean;
  canRevealOrReset: boolean;
}

/**
 * Hook to subscribe to Game and Player data for a specific session.
 * Manages real-time subscriptions to game state and player list.
 */
export const useGameData = (
  supabase: SupabaseClient | null,
  gameId: string | null,
  playerId: string | null,
  t: (key: string) => string
): UseGameDataReturn => {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Subscribe to Game Document
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setError(t('GAME_NOT_FOUND') || 'Game not found.');
            setGame(null);
          } else {
            setGame((payload.new || payload.old) as Game);
          }
        }
      )
      .subscribe();

    // Initial game fetch
    const fetchGame = async () => {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();

      if (fetchError || !data) {
        setError(t('GAME_NOT_FOUND') || 'Game not found.');
      } else {
        setGame(data as Game);
      }
      setLoading(false);
    };

    fetchGame();

    // 2. Subscribe to Players Collection
    const playersChannel = supabase
      .channel(`players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        async () => {
          // Fetch all players when changes occur
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId);

          if (data) {
            const formattedPlayers: Player[] = data.map(p => ({
              id: p.id,
              game_id: p.game_id,
              name: p.name,
              status: p.status,
              value: p.value,
              emoji: p.emoji
            }));
            setPlayers(formattedPlayers);

            // Auto-reveal check
            if (game?.auto_reveal && game?.game_status !== GameStatus.FINISHED && formattedPlayers.length > 0) {
              const allFinished = formattedPlayers.every(p => p.status === PlayerStatus.FINISHED);
              if (allFinished) {
                const newAverage = calculateAverage(formattedPlayers);
                await supabase
                  .from('games')
                  .update({
                    average: newAverage,
                    game_status: GameStatus.FINISHED,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', gameId);
              }
            }
          }
        }
      )
      .subscribe();

    // Initial players fetch
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId);

      if (data) {
        setPlayers(data.map(p => ({
          id: p.id,
          game_id: p.game_id,
          name: p.name,
          status: p.status,
          value: p.value,
          emoji: p.emoji
        })));
      }
    };

    fetchPlayers();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [supabase, gameId, playerId, t]);

  // Compute derived state
  const currentPlayer = players.find(p => p.id === playerId);
  const finishedCount = players.filter(p => p.status === PlayerStatus.FINISHED).length;
  const totalPlayers = players.length;
  const isModerator = game?.created_by_id === playerId;
  const canRevealOrReset = isModerator || game?.is_allow_members_to_manage_session;
  const canReveal = game?.game_status !== GameStatus.FINISHED && canRevealOrReset;
  const canReset = game?.game_status === GameStatus.FINISHED && canRevealOrReset;

  return {
    game,
    players,
    currentPlayer,
    loading,
    error,
    finishedCount,
    totalPlayers,
    isModerator,
    canReveal,
    canReset,
    canRevealOrReset,
  };
};
