import React, { useState, useEffect } from "react";
import { Search, FileText, Image, Video, LayoutGrid, X } from "lucide-react";
import { FiLayout } from "react-icons/fi";
import apiEndpoints from "../apiconfig";

const MessagePopup = ({ onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        debugger
        const response = await fetch(apiEndpoints.fetchTemplate, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }

        debugger
        const data = await response.json();
        
        if (data.status === "success") {
          setTemplates(data.data);
        } else {
          throw new Error("Failed to load templates");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching templates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Extract unique categories and languages for filters
  const categories = ["all", ...new Set(templates.map(t => t.categoryName))];
  const languages = ["all", ...new Set(templates.map(t => t.languageName))];

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.categoryName === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || template.languageName === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Function to extract template body text from template_json
  const getTemplateBody = (templateJson) => {
    try {
      const parsed = JSON.parse(templateJson);
      const bodyComponent = parsed.components?.find(comp => comp.type === "BODY");
      return bodyComponent?.text || "No content available";
    } catch (err) {
      console.error("Error parsing template JSON:", err);
      return "Error loading template content";
    }
  };

  // Determine template type based on components (you might need to adjust this logic)
  const getTemplateType = (templateJson) => {
    try {
      const parsed = JSON.parse(templateJson);
      const components = parsed.components || [];
      
      if (components.some(comp => comp.type === "HEADER" && comp.format === "IMAGE")) {
        return "image";
      } else if (components.some(comp => comp.type === "HEADER" && comp.format === "VIDEO")) {
        return "video";
      } else if (components.some(comp => comp.type === "CAROUSEL")) {
        return "carousel";
      } else if (components.some(comp => comp.type === "DOCUMENT")) {
        return "file";
      }
      return "text";
    } catch (err) {
      return "text";
    }
  };

  const renderIcon = (templateType) => {
    const iconProps = {
      size: 32,
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
        return <FileText {...iconProps} />;
    }
  };

  const handleTemplateSelect = (template) => {
    const templateBody = getTemplateBody(template.template_json);
    onSelectTemplate({
      ...template,
      templateBody
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLanguage("all");
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
          {/* Filter Buttons - Categories */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <span className="text-gray-600 font-medium ml-2">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              {languages.map(language => (
                <option key={language} value={language}>
                  {language === "all" ? "All Languages" : language}
                </option>
              ))}
            </select>

            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-600 hover:text-gray-800 underline ml-2"
            >
              Clear Filters
            </button>
          </div>

          {/* Search + Close */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-400 rounded-md pl-8 pr-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 w-full sm:w-52"
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                Retry
              </button>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredTemplates.map((template) => {
                const templateType = getTemplateType(template.template_json);
                const templateBody = getTemplateBody(template.template_json);
                
                return (
                  <div
                    key={template.id}
                    className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="bg-gray-100 h-28 sm:h-32 flex flex-col items-center justify-center rounded-md p-2">
                      {renderIcon(templateType)}
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.meta_status === "SUBMITTED" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {template.meta_status}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {templateType}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 mt-2 font-semibold text-sm sm:text-base truncate">
                      {template.name || "No Name"}
                    </p>
                    <p className="text-gray-600 mt-1 text-xs sm:text-sm line-clamp-2">
                      {templateBody}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{template.categoryName}</span>
                      <span>{template.languageName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found matching your criteria.</p>
              {(searchTerm || selectedCategory !== "all" || selectedLanguage !== "all") && (
                <button
                  onClick={handleClearFilters}
                  className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center rounded-b-lg border-t border-gray-300 p-3 sticky bottom-0 bg-white">
          <div className="text-sm text-gray-600">
            {!loading && !error && (
              <>
                Showing {filteredTemplates.length} of {templates.length} templates
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition text-sm"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;