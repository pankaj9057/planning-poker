import { Users, CheckCircle, Clock, Zap } from 'lucide-react';
import type { Game, Player } from '../types';
import { PlayerStatus, GameStatus } from '../constants';
import { getCardDisplayValue } from '../utils/gameUtils';

interface PlayerListProps {
  players: Player[];
  game: Game | null;
  t: (key: string) => string;
  playerId: string | null;
}

/**
 * PlayerList component displays all players and their voting status.
 */
export const PlayerList = ({ players, game, t, playerId }: PlayerListProps) => {
  const isRevealed = game?.game_status === GameStatus.FINISHED;

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg max-h-[400px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2 border-gray-200 dark:border-gray-700">
        <Users className="w-5 h-5 mr-2 text-indigo-500" />
        {t('PLAYERS')} ({players.length})
      </h2>
      <ul className="space-y-3">
        {players.map(p => {
          const isSelf = p.id === playerId;
          const voteValue = getCardDisplayValue(p.value);

          let statusIcon = null;
          let statusText = '';
          let voteDisplay = '';
          let voteClass = 'bg-gray-100 dark:bg-gray-700 text-gray-500';

          if (isRevealed) {
            voteDisplay = voteValue;
            voteClass = 'bg-indigo-500 text-white';
          } else if (p.status === PlayerStatus.FINISHED) {
            statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />;
            statusText = t('VOTE_STATUS_VOTED');
            voteDisplay = '👍';
          } else {
            statusIcon = <Clock className="w-4 h-4 text-amber-500" />;
            statusText = t('VOTE_STATUS_NOT_VOTED');
            voteDisplay = '...';
          }

          return (
            <li
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                isSelf ? 'bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex flex-col">
                <span className={`font-medium ${isSelf ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {p.name} {isSelf ? `(${t('You')})` : ''} {p.id === game?.created_by_id && <Zap className="inline w-4 h-4 text-yellow-500 ml-1" aria-label="Moderator" />}
                </span>
                <span className={`text-xs flex items-center ${isSelf ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {statusIcon && <span className="mr-1">{statusIcon}</span>}
                  {statusText}
                </span>
              </div>
              <div className={`w-10 h-10 flex items-center justify-center font-bold rounded-full text-sm shadow-md ${voteClass}`}>
                {voteDisplay}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
