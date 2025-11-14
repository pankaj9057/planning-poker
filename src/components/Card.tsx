import type { CardProps } from '../types';

/**
 * Card component for planning poker voting.
 * Displays a single card with value and handles selection state.
 */
export const Card = ({ value, isSelected, onClick, isRevealed, isDisabled }: CardProps) => {
  const isSpecial = value === '?' || value === '☕';
  const cardStyle = isSpecial
    ? 'bg-amber-500 hover:bg-amber-600 text-white'
    : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600';

  const displayValue = value;
  let classes = `h-20 w-16 md:h-28 md:w-20 lg:h-32 lg:w-24 flex items-center justify-center font-extrabold text-2xl md:text-3xl lg:text-4xl rounded-xl shadow-lg transition-all duration-150 transform cursor-pointer border-4 ${cardStyle}`;

  if (isSelected) {
    classes += ' ring-4 ring-offset-2 ring-indigo-500 scale-105';
  } else {
    classes += ' border-transparent';
  }
    
  // Added disabled styling
  if (isDisabled) {
    classes += ' opacity-50 cursor-not-allowed pointer-events-none';
  } else {
    classes += ' hover:scale-105';
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
      {displayValue}
    </button>
  );
};
