import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export const QRCodeModal = ({ url, onClose }: QRCodeModalProps) => {
  const bgColor = '#FFFFFF'; // White background for the QR code
  const fgColor = '#1a202c'; // Dark gray for the QR code modules

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400">Scan to Join</h2>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-center">
            <QRCodeSVG
              value={url}
              size={220} // Slightly smaller for better padding
              bgColor={bgColor}
              fgColor={fgColor}
              level={"L"} // Error correction level
              includeMargin={false}
            />
        </div>
        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400 break-words">{url}</p>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};
