import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";


const CreateFlowModal = ({ isOpen, onClose, addFlow}) => {
    const [flowName, setFlowName] = useState("");
  const [selectedFlow, setSelectedFlow] = useState("Select Flow Type")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null; // Hide modal when isOpen is false

  const handleCreateFlow = () => {
    if (!flowName || selectedFlow === "Select Flow Type") {
      alert("Please fill in all fields.");
      return;
    }

    const newFlow = {
      id: Date.now(), // Unique ID
      name: flowName,
      type: selectedFlow.toLowerCase(),
      status: false,
      default: false,
      keywords: "", // Empty initially
      explanation: "", // Empty initially
    };

    addFlow(newFlow); // Pass the new flow to the parent component
    onClose(); // Close the modal
    setFlowName(""); // Reset input fields
    setSelectedFlow("Select Flow Type");


}

 

return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative cursor-pointer">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Create Flow</h2>

        {/* Flow Name Input */}
        <input
          type="text"
          placeholder="Flow Name"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:border-yellow-600 bg-gray-100 mb-4"
        />

        {/* Flow Type Dropdown */}
        <div className="relative">
          <div
            className="w-full border border-yellow-600 rounded-md px-3 py-2 text-gray-700 bg-white cursor-pointer flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedFlow}
            <span className="text-gray-500">&#9662;</span>
          </div>
          {isDropdownOpen && (
            <ul className="absolute left-0 w-full bg-white mt-2 shadow-md z-10">
              <li
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedFlow("Whatsapp Flow");
                  setIsDropdownOpen(false);
                }}
              >
                Whatsapp Flow
              </li>
              {/* Add more flow types if needed */}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-600 text-white px-5 py-2 rounded-md"
            onClick={handleCreateFlow}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFlowModal;