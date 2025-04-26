import React, { useState, useEffect } from "react";
import { Image, FileText, Video, LayoutGrid,  } from "lucide-react"; // Imported once
import { FiLayout } from "react-icons/fi";


const MessagePopup = ({ templates = [], onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localTemplates, setLocalTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState("all"); // State to track selected template type

  // Load templates from local storage when the component mounts
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem("templates")) || [];
    setLocalTemplates(savedTemplates);
  }, []);

  // Save templates to local storage whenever the `templates` prop changes
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("templates", JSON.stringify(templates));
      setLocalTemplates(templates);
    }
  }, [templates]);

  // Filter templates based on search input and selected type
  const filteredTemplates = localTemplates.filter((template) => {
    const matchesSearch = template.templateName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || template.templateType === selectedType;
    return matchesSearch && matchesType;
  });

  const renderIcon = (templateType) => {
    const iconProps = {
      size: 32, // Adjust size as needed
      className: "text-green-500",
    };

    switch (templateType) {
      case "text":
        return <FileText {...iconProps} />;
      case "image":
        return <Image {...iconProps} />;
      case "video":
        return <Video {...iconProps} />;
      case "file":
        return <FileText {...iconProps} />;
      case "carousel":
        return <LayoutGrid {...iconProps} />;
      default:
        return (
          <svg
            className="w-8 h-8 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3v18h18M3 3l18 18M3 3l18 18"
            />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4"  style={{ fontFamily: "Montserrat" }}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl border border-gray-300 relative">
        {/* Header */}
        <div className="pb-2 border-b border-gray-400 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("all")}
            >
              <LayoutGrid size={16} /> All
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("text")}
            >
              <FileText size={16} /> Text
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("image")}
            >
              <Image size={16} /> Image
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("file")}
            >
              <FileText size={16} /> File
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("video")}
            >
              <Video size={16} /> Video
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-700"
              onClick={() => setSelectedType("carousel")}
            >
              <FiLayout  size={16} /> Carousel
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search Template"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-400 rounded-md pl-3 ml-20 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-500 text-lg hover:text-red-600"
          >
            &times;
          </button>
        </div>

        {/* Template List */}
        <div className="mt-4 max-h-96 overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="bg-gray-200 h-32 flex items-center justify-center rounded-t-lg">
                    {renderIcon(template.templateType)} {/* Render the appropriate icon */}
                  </div>
                  <p className="text-gray-700 mt-2 font-semibold">
                    {template.templateName || "No Name"}
                  </p>
                  <p className="text-gray-700 mt-2 text-sm">
                    {template.templateBody || "No Body Content"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No templates found</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4 pt-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg mr-2 hover:bg-gray-400 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;