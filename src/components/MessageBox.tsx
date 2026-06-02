import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import type { StatusMessage } from '../types';

interface MessageBoxProps {
  message: string;
  type: StatusMessage['type'];
  onClose: () => void;
}

/**
 * MessageBox component displays status messages (info, error, success).
 */
export const MessageBox = ({ message, type, onClose }: MessageBoxProps) => {
  if (!message) return null;

  const baseClasses = "fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between z-50 border max-w-sm w-full transition-all duration-300 animate-slide-in";
  
  let typeClasses = '';
  let Icon = Info;

  switch (type) {
    case 'error':
      typeClasses = 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 shadow-red-500/10';
      Icon = AlertCircle;
      break;
    case 'success':
      typeClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10';
      Icon = CheckCircle;
      break;
    case 'info':
    default:
      typeClasses = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/10';
      Icon = Info;
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center flex-1 mr-3">
        <Icon className="w-5 h-5 mr-3 shrink-0" />
        <p className="font-heading font-semibold text-sm">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Close message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
