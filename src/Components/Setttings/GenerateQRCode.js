import { QRCodeCanvas } from "qrcode.react";
import { AiOutlineQrcode } from "react-icons/ai";
import { AiOutlineCopy } from "react-icons/ai";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const GenerateQRCode = ({ qrCode, onClear }) => {
  // Copy QR Code to Clipboard
  const handleCopy = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.toBlob((blob) => {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        alert("QR code copied to clipboard!");
      });
    }
  };

  // Download QR Code as PNG
  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qrcode_${Date.now()}.png`;
      link.click();
    }
  };
  return (
    <div className="bg-white p-6 shadow-md rounded-md text-center">
      <h2 className="text-lg font-semibold mb-4 text-left">Generated QR Code</h2>
      <div className="-mx-6">
        <hr className="border-t border-gray-300 w-full mb-4" />
      </div>
      {qrCode ? (
        <div className="flex flex-col justify-center items-center">
          <div className="p-4 rounded-md shadow-sm relative ">
            <QRCodeCanvas value={qrCode.message} size={120} bgColor="#ffffff" fgColor="#000000" includeMargin={false} />
            <div className="absolute inset-0 flex justify-center items-center">
              <FaWhatsapp className="w-8 h-8 text-gray-900 bg-white rounded-full p-1 shadow-md" />
            </div>
          </div>
          <div className="flex mt-3 space-x-2">
            <button className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer" onClick={handleCopy}>
              <AiOutlineCopy size={20} />
            </button>
            <button className="p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer" onClick={handleDownload}>
              <MdOutlineFileDownload size={20} />
            </button>
          </div>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer" onClick={onClear}>
            Clear
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500 mt-5">
          <AiOutlineQrcode size={40} className="mb-2" />
          <p>Generated QR code will appear here</p>
        </div>
      )}
    </div>
  );
};

export default GenerateQRCode;