import React from "react";

const Popover = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md flex items-center">
      <span>{message}</span>
      <button className="ml-2 text-white hover:text-gray-200" onClick={onClose}>
        ✖
      </button>
    </div>
  );
};

export default Popover;