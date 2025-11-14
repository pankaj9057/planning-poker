import { useState, useEffect } from 'react';
import type { Game, Player } from '../types';
import { Card } from './Card';
import { PlayerStatus, GameStatus, DECK_FIBONACCI } from '../constants';
import { getCardDisplayValue } from '../utils/gameUtils';

interface CardPickerProps {
  game: Game | null;
  playerId: string | null;
  vote: (gameId: string, playerId: string, card: string | number) => Promise<void>;
  currentPlayer: Player | undefined;
}

/**
 * CardPicker component displays the deck of cards and handles voting.
 */
export const CardPicker = ({ game, playerId, vote, currentPlayer }: CardPickerProps) => {
  const [selectedCard, setSelectedCard] = useState<string | number | null>(null);
  
  const isFinished = currentPlayer?.status === PlayerStatus.FINISHED;
  const isGameRevealed = game?.game_status === GameStatus.FINISHED;

  // Sync selectedCard with player's current value
  useEffect(() => {
    if (currentPlayer?.value) {
      setSelectedCard(getCardDisplayValue(currentPlayer.value));
    }
  }, [currentPlayer?.value]);

  // Clear selection when game is reset
  useEffect(() => {
    if (game?.game_status === GameStatus.STARTED) {
      setSelectedCard(null);
    }
  }, [game?.game_status]);

  const handleCardClick = (card: string | number) => {
    if (isGameRevealed || !game || !playerId) return; // Cannot vote after reveal
    setSelectedCard(card);
    vote(game.id, playerId, card);
  };

  const deck = game?.cards || DECK_FIBONACCI;

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4 md:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
      {deck.map(card => (
        <Card
          key={card}
          value={card}
          isSelected={selectedCard === card && isFinished}
          onClick={() => handleCardClick(card)}
          isRevealed={isGameRevealed}
          isDisabled={isGameRevealed}
        />
      ))}
    </div>
  );
};
