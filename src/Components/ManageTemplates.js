import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faCopy,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
import MessagePopup from "./MessagePopup";
import apiEndpoints from "../apiconfig";

const ManageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const templatesPerPage = 5;
  const [curlModal, setCurlModal] = useState({ open: false, data: null });

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiEndpoints.managetemplate);
        const data = await response.json();
        if (data.status === "success") {
          const formattedTemplates = data.data.map((template) => ({
            id: template.id,
            guid: template.guid,
            templateName: template.template_name,
            category: template.category,
            status: template.isActive ? "Active" : "Inactive",
            type: template.template_type === "1" ? "Transactional" : "Promotional",
            createdOn: template.createdOn,
            templateBody: template.body,
            templateFooter: template.template_footer,
            attributes: (() => {
              try {
                if (typeof template.templateHeaders === "string") {
                  return JSON.parse(template.templateHeaders);
                }
                return template.templateHeaders || [];
              } catch {
                return [];
              }
            })(),
            isFile: template.isFile,
            isVariable: template.isVariable,
          }));
          setTemplates(formattedTemplates);
        } else {
          setError(data.message || "Error fetching templates");
        }
      } catch (error) {
        setError("Failed to fetch templates: " + error.message);
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Handle new template from navigation
  useEffect(() => {
    if (location.state?.template) {
      const newTemplate = location.state.template;
      setTemplates((prev) => [newTemplate, ...prev]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const response = await fetch(apiEndpoints.managetemplate, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to delete template");
        if (data.status === "success") {
          setTemplates((prev) => prev.filter((template) => template.id !== id));
          alert("Template deleted successfully!");
        } else throw new Error(data.message || "Unknown error occurred");
      } catch (error) {
        console.error("Delete error:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleCopy = (template) => {
    navigate("/create-template", { state: { template } });
  };

  const handlePreview = (template) => {
    setModal({ type: "preview", data: template });
  };

  const handleCreateTemplate = () => {
    setModal({ type: "create", data: null });
  };

  const handleShowCurl = (template, values = {}) => {
    const bodyComponent = { type: "body" };
    if (template.attributes && typeof template.attributes === "object") {
      const attributesArray = Array.isArray(template.attributes)
        ? template.attributes
        : [template.attributes];
      bodyComponent.parameters = attributesArray.map((attr, index) => {
        const key = attr?.text || attr?.value || attr?.name || `value-${index + 1}`;
        return { type: attr?.type || "text", text: values[key] || key };
      });
    }
    const curlJSON = {
      to: "<sample-number-with-country-code>",
      type: "template",
      template: {
        language: { policy: "deterministic", code: "en" },
        name: template.templateName || template.name || "defaultTemplate",
        components: [bodyComponent],
      },
    };
    const curlCommand = `curl --location 'http://localhost/whatsapp?token=<sample-token>' \\ --header 'Content-Type: application/json' \\ --data '${JSON.stringify(curlJSON, null, 2)}'`;
    setCurlModal({ open: true, data: curlCommand });
  };

  const closeModal = () => setModal({ type: null, data: null });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.templateName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    const matchesType = selectedType ? template.type === selectedType : true;
    return matchesSearch && matchesCategory && matchesType;
  });

  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = filteredTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const categories = [...new Set(templates.map((template) => template.category))];
  const types = [...new Set(templates.map((template) => template.type))];

  if (isLoading)
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center font-montserrat">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center font-montserrat">
        <div className="bg-white p-4 rounded-lg shadow-md border border-red-300 text-center">
          <div className="text-red-500 font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen font-montserrat">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-4 gap-2 md:gap-4 flex-wrap">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 truncate">
          Manage Template
        </h2>
        <div className="flex items-center text-yellow-600 text-sm md:text-md flex-wrap gap-1">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-yellow-600 truncate">Manage Template</span>
        </div>
      </div>

      {/* Table and Filters */}
      <div className="bg-white p-4 md:p-6 shadow rounded-lg border border-gray-300 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search Template"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-full md:w-auto"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border text-gray-500 border-gray-300 px-3 py-2 rounded-md w-full md:w-auto"
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border text-gray-500 border-gray-300 px-3 py-2 rounded-md w-full md:w-auto"
            >
              <option value="">Select Type</option>
              {types.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button className="text-white px-4 py-2 rounded-md bg-yellow-600 w-full md:w-auto hover:bg-yellow-700">
              📺 Watch Tutorial
            </button>
            <button
              onClick={handleCreateTemplate}
              className="text-white px-4 py-2 rounded-md bg-yellow-600 w-full md:w-auto hover:bg-yellow-700"
            >
              + Create New Template
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse border border-gray-300 min-w-[600px] md:min-w-full">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-2 md:p-3 text-gray-600 font-medium">S.No.</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Template Name</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Category</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Status</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Type</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Created On</th>
                <th className="p-2 md:p-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTemplates.length > 0 ? (
                currentTemplates.map((template, index) => (
                  <tr key={template.id} className="border border-gray-300 hover:bg-gray-50">
                    <td className="p-2 md:p-3">{indexOfFirstTemplate + index + 1}</td>
                    <td className="p-2 md:p-3 truncate max-w-[150px]">{template.templateName}</td>
                    <td className="p-2 md:p-3 truncate max-w-[100px]">{template.category}</td>
                    <td className="p-2 md:p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          template.status === "Approved"
                            ? "bg-green-500 text-white"
                            : template.status === "Pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {template.status}
                      </span>
                    </td>
                    <td className="p-2 md:p-3">{template.type}</td>
                    <td className="p-2 md:p-3 truncate max-w-[120px]">
                      {new Date(template.createdOn).toLocaleString()}
                    </td>
                    <td className="p-2 md:p-3 flex flex-wrap gap-2">
                      <button
                        className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                        onClick={() => handlePreview(template)}
                        title="Preview"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                      </button>
                      <button
                        className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                        onClick={() => handleCopy(template)}
                        title="Copy"
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-yellow-600" />
                      </button>
                      <button
                        className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                        onClick={() => handleDelete(template.id)}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-yellow-600" />
                      </button>
                      <button
                        className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded flex items-center gap-1"
                        title="Show cURL"
                        onClick={() => handleShowCurl(template)}
                      >
                        <FontAwesomeIcon icon={faAngleLeft} className="text-yellow-600" />
                        <FontAwesomeIcon icon={faAngleRight} className="text-yellow-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No templates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2 md:gap-0 flex-wrap">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstTemplate + 1} to {Math.min(indexOfLastTemplate, filteredTemplates.length)} of {filteredTemplates.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
            >
              <HiChevronLeft className="text-2xl" />
            </button>
            <button className="border border-yellow-600 px-4 py-2 rounded-md text-black font-medium">
              {currentPage}
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
            >
              <HiChevronRight className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Keep your modals unchanged */}
      {modal.type === "preview" && <div className="...">...</div>}
      {modal.type === "create" && <div className="...">...</div>}
      {curlModal.open && <div className="...">...</div>}
      {showMessagePopup && <MessagePopup templates={templates} onClose={() => setShowMessagePopup(false)} />}
    </div>
  );
};

export default ManageTemplates;
