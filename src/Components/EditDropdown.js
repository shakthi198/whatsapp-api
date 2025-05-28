import React, { useState, useRef, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const EditDropdown = ({ flowId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle edit action
  const handleEdit = () => {
    navigate(`/flow-chart/${flowId}`); // Navigate to the flow chart page
  };

  // Handle delete action
  const handleDelete = () => {
    onDelete(flowId); // Call the onDelete function passed from the parent
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Edit Icon Button */}
      <button
        onClick={toggleDropdown}
        className="bg-yellow-600 text-white p-3 rounded-full shadow-md cursor-pointer"
      >
        <FaEdit className="text-xl" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white shadow-lg rounded-md py-2 z-50">
          <button
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full cursor-pointer"
            onClick={handleEdit}
          >
            <AiOutlineEdit className="mr-2 text-lg text-gray-500" />
            Edit
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full cursor-pointer"
           onClick={handleDelete}
          >
            <MdDelete className="mr-2 text-lg text-gray-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default EditDropdown;