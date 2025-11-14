import { AlertCircle, CheckCircle, Zap } from 'lucide-react';
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

  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl transition-opacity duration-300 flex items-center z-50";
  let colorClasses = '';
  let Icon = AlertCircle;

  switch (type) {
    case 'error':
      colorClasses = 'bg-red-500 text-white';
      Icon = AlertCircle;
      break;
    case 'success':
      colorClasses = 'bg-green-500 text-white';
      Icon = CheckCircle;
      break;
    case 'info':
    default:
      colorClasses = 'bg-indigo-500 text-white';
      Icon = Zap;
      break;
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <Icon className="w-5 h-5 mr-3" />
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100 font-bold">
        &times;
      </button>
    </div>
  );
};
