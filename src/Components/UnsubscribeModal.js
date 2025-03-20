import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdSearch } from "react-icons/io";
import { PiPrinterThin } from "react-icons/pi";

const UnsubscribeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Hide modal when isOpen is false

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative cursor-pointer">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Unsubscribe Words</h2>

        {/* Search Bar */}
        <div className="rounded-md px-3 py-2 flex items-center bg-gray-100 border border-[#DDA853]">
          <input
            type="text"
            placeholder="Key Words"
            className="w-full bg-transparent outline-none text-gray-700 "
          />
          <span className="text-gray-500 ml-2 text-xl"><IoMdSearch /></span>
        </div>

        {/* No Data Display */}
        <div className="mt-4 bg-gray-100 p-4 rounded-md flex flex-col items-center">
          <span className="text-5xl text-gray-700"><PiPrinterThin /></span>
          <p className="text-gray-500 mt-3">No data</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 cursor-pointer">
          <button
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="bg-[#DDA853] text-white px-5 py-2 rounded-md" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;