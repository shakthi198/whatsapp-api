import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { MdOutlineInbox } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import apiEndpoints from "../apiconfig";

const AddContactModal = ({ onClose, refreshContacts }) => {
  // Sample group options - you might want to fetch these from your API
  const [groupOptions] = useState(["Family", "Friends", "Work", "Clients"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    country_code: "+91", // Default to India
    mobile_number: "",
    contact_name: "",
    tags: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  // Validate required fields
  if (!selectedGroup && !searchTerm) {
    setError("Please select or enter a group");
    setIsSubmitting(false);
    return;
  }

  if (!formData.mobile_number || !formData.contact_name) {
    setError("Mobile number and contact name are required");
    setIsSubmitting(false);
    return;
  }

  // Validate mobile number format
  if (!/^\d+$/.test(formData.mobile_number)) {
    setError("Mobile number should contain only digits");
    setIsSubmitting(false);
    return;
  }

  const payload = {
    contact_group: selectedGroup || searchTerm,
    country_code: formData.country_code,
    mobile_number: formData.mobile_number,
    contact_name: formData.contact_name,
    tags: formData.tags || "" // Ensure tags is always a string
  };

  try {
    const response = await fetch(apiEndpoints.addContact, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add contact");
    }

    const result = await response.json();
    
    if (!result.status) {
      throw new Error(result.message || "Failed to add contact");
    }

    alert(result.message || "Contact added successfully!");
    if (refreshContacts) refreshContacts();
    onClose();
  } catch (error) {
    console.error("Error:", error);
    setError(error.message || "Failed to add contact");
  } finally {
    setIsSubmitting(false);
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredOptions = groupOptions.filter((group) =>
    group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50">
      <div className="bg-white w-full max-w-md p-6 shadow-lg rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <AiOutlineClose className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Add Contact</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select or enter group"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                required
              />
              {isFocused ? (
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              ) : (
                <RiArrowDropDownLine className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-8 h-8" />
              )}
            </div>

            {isFocused && (
              <div className="absolute bg-white w-full border border-gray-300 mt-1 shadow-md max-h-60 overflow-y-auto z-50 rounded">
                {filteredOptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <MdOutlineInbox className="mx-auto text-gray-300 mb-2" size={48} />
                    <p>No groups found</p>
                  </div>
                ) : (
                  filteredOptions.map((group, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedGroup(group);
                        setSearchTerm(group);
                        setIsFocused(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {group}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Code <span className="text-red-500">*</span>
              </label>
              <select
                name="country_code"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                value={formData.country_code}
                onChange={handleInputChange}
                required
              >
                <option value="+91">India (+91)</option>
                <option value="+1">USA (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+65">Singapore (+65)</option>
                <option value="+971">UAE (+971)</option>
              </select>
            </div>
            <div className="w-2/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number"
                placeholder="Mobile number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_name"
              placeholder="Contact Name"
              value={formData.contact_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-[#c49a4b] transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;