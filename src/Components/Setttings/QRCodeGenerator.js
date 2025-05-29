import { useState, useEffect } from "react";
import GenerateQRCode from "./GenerateQRCode";
import QRCodeHistory from "./QRCodeHistory";
import { AiOutlineQrcode } from "react-icons/ai";

const QRCodeGenerator = () => {
  const [name, setName] = useState(""); // User-entered name
  const [format, setFormat] = useState("PNG"); // Default format
  const [qrCode, setQRCode] = useState(null); // Current QR code
  const [history, setHistory] = useState([]); // History of QR codes

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("qrHistory")) || [];
    setHistory(savedHistory);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }, [history]);

  // Generate QR Code
  const generateQRCode = () => {
    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }

    // Create a new QR code object
    const newQr = {
      id: Date.now(), // Unique ID
      name,
      format,
      created: new Date().toLocaleString(), // Timestamp
    };

    // Add to history
    setHistory([newQr, ...history]);
    setQRCode(newQr); // Set the current QR code
    setName(""); // Clear the input field
  };

  // Clear the current QR code
  const handleClear = () => {
    setQRCode(null);
  };


  return (
    <div className="p-6">
      {/* Grid Layout for QR Code Generation & Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Form */}
        <div className="bg-white p-6 shadow-md rounded-md">
          <h2 className="text-lg font-semibold mb-4">Generate WhatsApp QR Code</h2>
          <div className="-mx-6">
        <hr className="border-t border-gray-300 w-full mb-4" />
      </div>

          {/* Enter Message Field */}
          <label className="block text-sm font-medium mb-1 text-gray-700">
            <span className="text-red-500 mr-1">*</span> Enter Message
          </label>
          <input
            type="text"
            placeholder="Enter message for QR"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4 "
          />

          {/* Select Format Field */}
          <label className="block text-sm font-medium mb-1 text-gray-700">Select Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            <option>PNG</option>
            <option>JPG</option>
            <option>SVG</option>
            <option>PDF</option>
            <option>WEBP</option>
          </select>

          <button
            onClick={generateQRCode}
            className="w-1/3 bg-green-600 text-white px-3 py-2 rounded-sm hover:bg-green-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span><AiOutlineQrcode /></span> Generate QR Code
          </button>
        </div>

        {/* Right Column - Generated QR Code */}
        <GenerateQRCode qrCode={qrCode} onClear={handleClear} />
      </div>

      {/* QR Code History (Full Width) */}
      <QRCodeHistory history={history} setHistory={setHistory} />
    </div>
  );
};

export default QRCodeGenerator;