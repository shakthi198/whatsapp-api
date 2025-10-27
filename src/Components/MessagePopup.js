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
  <div
    className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-2 sm:p-4 md:p-6"
    style={{ fontFamily: "Montserrat" }}
  >
    {/* Popup Container */}
    <div className="bg-white w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg border border-gray-300 flex flex-col max-h-[90vh]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between rounded-t-lg gap-3 border-b border-gray-400 p-3 sticky top-0 bg-white z-10">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "all" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("all")}
          >
            <LayoutGrid size={16} /> All
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "text" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("text")}
          >
            <FileText size={16} /> Text
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "image" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("image")}
          >
            <Image size={16} /> Image
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "file" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("file")}
          >
            <FileText size={16} /> File
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "video" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("video")}
          >
            <Video size={16} /> Video
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              selectedType === "carousel" ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedType("carousel")}
          >
            <FiLayout size={16} /> Carousel
          </button>
        </div>

        {/* Search + Close */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Template"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-400 rounded-md pl-3 pr-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 w-full sm:w-52"
          />
          {/* <button
            onClick={onClose}
            className="text-gray-500 text-xl hover:text-red-600"
          >
            &times;
          </button> */}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="p-3 overflow-y-auto flex-1">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredTemplates.map((template, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="bg-gray-200 h-28 sm:h-32 flex items-center justify-center rounded-md">
                  {renderIcon(template.templateType)}
                </div>
                <p className="text-gray-800 mt-2 font-semibold text-sm sm:text-base truncate">
                  {template.templateName || "No Name"}
                </p>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm line-clamp-2">
                  {template.templateBody || "No Body Content"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">No templates found</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 rounded-b-lg border-t border-gray-300 p-3 sticky bottom-0 bg-white">
        <button
          className="px-4 py-2 bg-gray-300  hover:bg-gray-400 transition"
          onClick={onClose}
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition">
          OK
        </button>
      </div>
    </div>
  </div>
);

};

export default MessagePopup;