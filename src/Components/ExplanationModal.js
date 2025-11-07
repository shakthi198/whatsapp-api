import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

const ExplanationModal = ({ isOpen, onClose, onSave, initialValue }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Edit Flow Explanation
        </h2>

        <textarea
          rows={5}
          placeholder="Enter flow explanation..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:border-yellow-600 bg-gray-100 mb-4"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-600 text-white px-5 py-2 rounded-md"
            onClick={() => {
              onSave(value);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;