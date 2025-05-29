import React, { useState } from "react";

const AddTagModal = ({ onClose, onAdd, position }) => {
  const [tag, setTag] = useState("");

  return (
    <>
      {/* Overlay - Click outside to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      ></div>
    <div
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)", // Centers and moves above
      }}
    >
      {/* Modal Container */}
      <div className="bg-white w-82 p-6 shadow-lg relative">
        {/* Modal Header */}
        <h2 className="text-lg font-medium mb-4">Add New Tag</h2>

        {/* Input Field */}
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Enter new tag"
          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 text-sm"
        />

        {/* Add Button */}
        <button
          onClick={() => {
            if (tag.trim()) {
              onAdd(tag);
              setTag(""); // Clear input after adding
            }
          }}
          disabled={!tag.trim()}
          className={`mt-4 w-1/5 py-1 text-sm font-medium ${
            tag.trim()
              ? "bg-yellow-600 text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Add
        </button>
        {/* Downside Triangle */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
      </div>
    </div>
    </>
  );
};

export default AddTagModal;