import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export const QRCodeModal = ({ url, onClose }: QRCodeModalProps) => {
  const bgColor = '#FFFFFF'; // White background for the QR code
  const fgColor = '#1e293b'; // Slate 800 for the QR code modules

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 animate-slide-up">
        <h2 className="text-2xl font-heading font-extrabold mb-5 text-center bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          Scan to Join
        </h2>
        
        <div className="p-5 bg-white dark:bg-white rounded-2xl flex justify-center shadow-inner border border-slate-100 dark:border-slate-800">
          <QRCodeSVG
            value={url}
            size={220} // Slightly smaller for better padding
            bgColor={bgColor}
            fgColor={fgColor}
            level={"L"} // Error correction level
            includeMargin={false}
          />
        </div>
        
        <p className="mt-5 text-xs text-center text-slate-500 dark:text-slate-400 bg-slate-100/55 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 break-all select-all font-mono">
          {url}
        </p>
        
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3.5 rounded-xl font-heading font-semibold text-base transition-all duration-200 transform active:scale-95 hover:shadow-lg hover:shadow-indigo-500/25 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
