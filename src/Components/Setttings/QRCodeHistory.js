import { QRCodeCanvas } from "qrcode.react";
import { AiOutlineCopy } from "react-icons/ai";
import { MdOutlineFileDownload, MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";

const QRCodeHistory = ({ history, setHistory }) => {
  // Copy QR Code Message
  const handleCopy = (message) => {
    navigator.clipboard.writeText(message);
    alert("Message copied to clipboard!");
  };

  // Download QR Code
  const handleDownload = (message) => {
    const canvas = document.createElement("canvas");
    const qrCode = new QRCodeCanvas(canvas, { value: message, size: 120 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qrcode_${Date.now()}.png`;
    link.click();
  };

  // Edit QR Code Message
  const handleEdit = (id, newMessage) => {
    const updatedHistory = history.map((item) =>
      item.id === id ? { ...item, name: newMessage } : item
    );
    setHistory(updatedHistory);
  };

  // Delete QR Code
  const handleDelete = (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">QR Code History</h2>
      <div className="-mx-6">
        <hr className="border-t border-gray-300 w-full mb-4" />
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">No QR codes generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div key={item.id} className="p-4 rounded-md shadow-md flex flex-col justify-center items-center">
              {/* QR Code Display */}
              <div className="p-2 rounded-md shadow-sm relative">
                <QRCodeCanvas value={item.name} size={120} bgColor="#ffffff" fgColor="#000000" includeMargin={false} />
                {/* WhatsApp Icon Overlay */}
                <div className="absolute inset-0 flex justify-center items-center">
                  <FaWhatsapp className="w-8 h-8 text-gray-900 bg-white rounded-full p-1 shadow-md" />
                </div>
              </div>

              {/* Message and Timestamp */}
              <div className="mt-4 text-center">
                <p className="text-sm text-black">
                  <span className="font-semibold">Message:</span> {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Created:</span> {item.created}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-3">
                <button onClick={() => handleCopy(item.name)} className="p-2 bg-green-500 text-white rounded-md cursor-pointer">
                  <AiOutlineCopy size={18} />
                </button>
                <button onClick={() => handleDownload(item.name)} className="p-2 bg-gray-300 text-gray-700 rounded-md cursor-pointer">
                  <MdOutlineFileDownload size={18} />
                </button>
                <button onClick={() => handleEdit(item.id, prompt("Edit message:", item.name))} className="p-2 bg-gray-300 text-gray-700 rounded-md cursor-pointer">
                  <CiEdit size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-gray-300 text-gray-700 rounded-md cursor-pointer">
                  <MdDeleteOutline size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodeHistory;