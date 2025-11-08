import React, { useState, useEffect } from "react";
import { Search, FileText, Image, Video, LayoutGrid, X } from "lucide-react";
import { FiLayout } from "react-icons/fi";
import apiEndpoints from "../../apiconfig";

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
        setError("");

        const response = await fetch(apiEndpoints.managetemplate, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch templates (${response.status})`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.data)) {
          // ✅ Normalize Meta template structure for frontend
          const formatted = data.data.map((t) => {
            // Find the BODY component
            const bodyComponent = t.components?.find(
              (comp) => comp.type === "BODY"
            );
            const bodyText = bodyComponent?.text || "No body content";

            // Detect header type (image/video/text/document)
            const header = t.components?.find((c) => c.type === "HEADER");
            let type = "text";
            if (header) {
              if (header.format === "IMAGE") type = "image";
              else if (header.format === "VIDEO") type = "video";
              else if (header.format === "DOCUMENT") type = "file";
              else type = "text";
            }

            return {
              id: t.id,
              name: t.name,
              categoryName: t.category || "Unknown",
              languageName: t.language || "Unknown",
              meta_status: t.status || "PENDING",
              template_json: JSON.stringify({ components: t.components }),
              templateBody: bodyText,
              templateType: type,
            };
          });

          setTemplates(formatted);
        } else {
          throw new Error("No templates found or invalid response");
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError(err.message);
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

  const getTemplateBody = (templateJson) => {
    try {
      const parsed = JSON.parse(templateJson);
      const bodyComponent = parsed.components?.find((comp) => comp.type === "BODY");
      return bodyComponent?.text || "No body content";
    } catch (err) {
      return "Error loading body";
    }
  };

  const getTemplateType = (templateJson) => {
    try {
      const parsed = JSON.parse(templateJson);
      const header = parsed.components?.find((comp) => comp.type === "HEADER");
      if (header?.format === "IMAGE") return "image";
      if (header?.format === "VIDEO") return "video";
      if (header?.format === "DOCUMENT") return "file";
      return "text";
    } catch {
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

  // ✅ Function to return chip colors based on Meta status
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-red-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "PAUSED":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
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
                        {/* Status Chip */}
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(template.meta_status)}`}
                        >
                          {template.meta_status}
                        </span>

                        {/* Type Chip */}
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-medium">
                          {template.templateType || "text"}
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