import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const FlowTypeModal = ({ isOpen, onClose, onSave }) => {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null; // Hide component when isOpen is false

  const handleSave = () => {
    onSave(inputValue); // Pass the input value to the onSave function
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white w-[450px] rounded-lg shadow-lg p-6 relative">
        
        {/* Header with Close Button */}
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-lg font-semibold">Keywords</h2>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            <AiOutlineClose className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#DDA853] cursor-pointer"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Flow Type"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md text-white cursor-pointer"
            style={{ backgroundColor: "#DDA853" }}
            onClick={handleSave}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowTypeModal;