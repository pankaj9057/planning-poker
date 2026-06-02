import { Users, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import type { Game, Player } from '../types';
import { PlayerStatus, GameStatus } from '../constants';
import { getCardDisplayValue } from '../utils/gameUtils';

interface PlayerListProps {
  players: Player[];
  game: Game | null;
  t: (key: string) => string;
  playerId: string | null;
}

// Helper to generate initials
const getInitials = (name: string) => {
  return name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
};

// Helper to get consistent gradient based on name hash
const getAvatarGradient = (name: string) => {
  const hash = name.split('').reduce((acc, char) => accChar(acc, char), 0);
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-rose-500',
    'from-fuchsia-500 to-pink-600',
  ];
  return gradients[hash % gradients.length];
};

const accChar = (acc: number, char: string) => acc + char.charCodeAt(0);

/**
 * PlayerList component displays all players and their voting status.
 */
export const PlayerList = ({ players, game, t, playerId }: PlayerListProps) => {
  const isRevealed = game?.game_status === GameStatus.FINISHED;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl transition-all duration-300">
      <h2 className="text-xl font-heading font-bold mb-6 flex items-center justify-between border-b pb-3 border-slate-200/50 dark:border-slate-800/40 text-slate-800 dark:text-slate-100">
        <span className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-500" />
          {t('PLAYERS')}
        </span>
        <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
          {players.length} online
        </span>
      </h2>
      
      <ul className="space-y-4">
        {players.map(p => {
          const isSelf = p.id === playerId;
          const isModerator = p.id === game?.created_by_id;
          const voteValue = getCardDisplayValue(p.value);
          const hasVoted = p.status === PlayerStatus.FINISHED;

          let statusText = '';
          if (hasVoted) {
            statusText = t('VOTE_STATUS_VOTED');
          } else {
            statusText = t('VOTE_STATUS_NOT_VOTED');
          }

          const avatarGradient = getAvatarGradient(p.name);
          const initials = getInitials(p.name);

          return (
            <li
              key={p.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                isSelf
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 shadow-md shadow-indigo-500/5'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-heading font-bold text-sm shadow-md`}>
                  {initials}
                </div>
                
                <div className="flex flex-col">
                  <span className={`font-semibold flex items-center ${isSelf ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {p.name}
                    {isSelf && <span className="text-xs ml-1.5 font-normal opacity-70">({t('You')})</span>}
                    {isModerator && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Mod
                      </span>
                    )}
                  </span>
                  
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center mt-0.5">
                    {hasVoted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mr-1 animate-pulse" />
                    )}
                    {statusText}
                  </span>
                </div>
              </div>

              {/* 3D Vote Card Flip */}
              <div className="perspective-1000 w-11 h-14">
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d ${
                    isRevealed ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front (Hidden State) */}
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500">
                    {hasVoted ? (
                      <span className="text-lg font-bold text-emerald-500 animate-bounce">👍</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-300 dark:text-slate-700">...</span>
                    )}
                  </div>
                  
                  {/* Card Back (Revealed State) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center rounded-xl shadow-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-heading font-black text-lg">
                    {hasVoted ? voteValue || '—' : '—'}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
