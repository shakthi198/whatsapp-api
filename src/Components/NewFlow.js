import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const categories = ["Lead generation", "Marketing", "Sales", "Support"];

const NewFlow = ({ isOpen, onClose, onCreateFlow }) => {
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null; // Hide modal when isOpen is false

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleSelectCategory = (category) => {
    if (!selectedCategory.includes(category)) {
      setSelectedCategory([...selectedCategory, category]);
    }
    setShowDropdown(false); // Close dropdown after selection
  };

  const handleRemoveCategory = (category) => {
    setSelectedCategory(selectedCategory.filter((item) => item !== category));
  };

  const handleCreate = () => {
    if (name.trim() === "") {
      setError("Name is required.");
      return;
    }
    if (name.length > 200) {
      setError("Name cannot exceed 200 characters.");
      return;
    }
    if (selectedCategory.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    // Create new flow object
    const newFlow = {
      id: Math.floor(Math.random() * 100000), // Generate a random ID
      name,
      flowId: Math.floor(Math.random() * 100000000000000).toString(), // Generate a random Flow ID
      status: "DRAFT",
    };

    // Pass the new flow to the parent component
    onCreateFlow(newFlow);

    // Reset form and close modal
    setName("");
    setSelectedCategory([]);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer" onClick={onClose}>
          <AiOutlineClose className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">New Flow</h2>

        {/* Input Field */}
        <label className="text-gray-600 text-sm">Name</label>
        <div className="relative mt-1">
          <input
            type="text"
            placeholder=""
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:border-yellow-600 bg-white"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(""); // Clear error on input change
            }}
          />
          <span className="absolute right-3 top-2 text-gray-500 text-sm">{name.length} / 200</span>
        </div>
        {error && name.length > 200 && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}

        {/* Dropdown - Categories */}
        <label className="text-gray-600 text-sm mt-4 block">Categories</label>
        <div className="relative mt-1">
          <div
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white flex flex-wrap items-center gap-2 cursor-pointer"
            onClick={toggleDropdown}
          >
            {selectedCategory.length > 0 ? (
              selectedCategory.map((cat) => (
                <div key={cat} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                  {cat}
                  <button className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from opening
                    handleRemoveCategory(cat);
                  }}>
                    ✖
                  </button>
                </div>
              ))
            ) : (
              <span className="text-gray-500">Select a category</span>
            )}
            <span className="ml-auto text-gray-500">&#9662;</span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute w-full bg-white border border-gray-300 mt-1 rounded-md shadow-md z-10">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && selectedCategory.length === 0 && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-yellow-600 text-white px-5 py-2 rounded-md cursor-pointer" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFlow;