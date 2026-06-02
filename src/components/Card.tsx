import type { CardProps } from '../types';

/**
 * Card component for planning poker voting.
 * Displays a single card with value and handles selection state.
 */
export const Card = ({ value, isSelected, onClick, isRevealed, isDisabled }: CardProps) => {
  const isSpecial = value === '?' || value === '☕';
  
  // Custom theme classes based on card type
  const baseCardStyle = isSpecial
    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20'
    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-slate-500/10 dark:shadow-black/30 border border-slate-200/60 dark:border-slate-700/50';

  let classes = `h-20 w-16 md:h-28 md:w-20 lg:h-32 lg:w-24 flex items-center justify-center font-heading font-black text-2xl md:text-3xl lg:text-4xl rounded-2xl shadow-lg transition-all duration-300 transform cursor-pointer ${baseCardStyle}`;

  if (isSelected) {
    classes += ' -translate-y-4 ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 shadow-xl shadow-indigo-500/30 scale-105';
  } else {
    if (!isDisabled) {
      classes += ' hover:-translate-y-2 hover:shadow-xl hover:scale-105';
    }
  }
    
  if (isDisabled) {
    classes += ' opacity-40 cursor-not-allowed pointer-events-none';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      aria-pressed={isSelected}
      title={String(value)}
      disabled={isDisabled}
    >
      <span className={isSpecial ? 'drop-shadow-md' : 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent'}>
        {value}
      </span>
    </button>
  );
};
