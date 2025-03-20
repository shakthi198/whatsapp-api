import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

const CreateAttributeModal = ({ isOpen, onClose, onCreateAttribute }) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  // Reset input fields when the modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setName(""); // Reset name field
      setValue(""); // Reset value field
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onCreateAttribute({ name, value });
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative cursor-pointer">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
          onClick={onClose}
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Create User Attribute</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-medium">Name</label>
            <input
              type="text"
              placeholder="Flow Name"
              className="w-3/5 border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:border-[#DDA853] bg-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-medium">Value (Optional)</label>
            <input
              type="text"
              placeholder="Flow Name"
              className="w-3/4 border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:border-[#DDA853] bg-gray-100"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#DDA853] text-white px-5 py-2 rounded-md cursor-pointer"
            onClick={handleSubmit}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAttributeModal;