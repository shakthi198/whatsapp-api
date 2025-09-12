import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faCopy,
  faAngleLeft,
  faAngleRight,
  faEnvelope,
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


  // Load templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiEndpoints.managetemplate);
        const data = await response.json();

        if (data.status === "success") {
          // Transform data to match expected structure
          // In your fetchTemplates function:
          // In your fetchTemplates function:
          const formattedTemplates = data.data.map((template) => ({
            id: template.id,
            guid: template.guid,
            templateName: template.template_name, // Changed from name to template_name
            category: template.category,
            status: template.isActive ? "Active" : "Inactive",
            type:
              template.template_type === "1" ? "Transactional" : "Promotional",
            createdOn: template.createdOn,
            templateBody: template.body,
            templateFooter: template.template_footer,
            attributes: (() => {
              try {
                // if it's a stringified JSON, parse it
                if (typeof template.templateHeaders === "string") {
                  return JSON.parse(template.templateHeaders);
                }
                // if it's already an array, return as-is
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

  // Handle new template from navigation state
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete template");
        }

        if (data.status === "success") {
          setTemplates((prev) => prev.filter((template) => template.id !== id));
          alert("Template deleted successfully!");
        } else {
          throw new Error(data.message || "Unknown error occurred");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Handle copy template
  const handleCopy = (template) => {
    navigate("/create-template", { state: { template } });
  };

  // Handle preview template
  const handlePreview = (template) => {
    setModal({ type: "preview", data: template });
  };

  // Handle create template modal
  const handleCreateTemplate = () => {
    setModal({ type: "create", data: null });
  };
  
const handleShowCurl = (template, values = {}) => {
  // values is an object like { name: "Shakthi", date: "2025-09-10" }

  const bodyComponent = { type: "body" };

  // Check if template.attributes exists
  if (template.attributes && typeof template.attributes === "object") {
    // Convert object to array if needed
    const attributesArray = Array.isArray(template.attributes)
      ? template.attributes
      : [template.attributes];

    bodyComponent.parameters = attributesArray.map((attr, index) => {
      const key =
        attr?.text || attr?.value || attr?.name || `value-${index + 1}`;
      return {
        type: attr?.type || "text",
        text: values[key] || key, // inject real value if provided
      };
    });
  }

  const curlJSON = {
    to: "<sample-number-with-country-code>", // replace with real number
    type: "template",
    template: {
      language: { policy: "deterministic", code: "en" },
      name: template.templateName || template.name || "defaultTemplate",
      components: [bodyComponent],
    },
  };

  console.log("Generated cURL JSON 👉", curlJSON);

  // Optional: open modal with cURL command
  const curlCommand = `curl --location 'http://localhost/whatsapp?token=<sample-token>' \\
--header 'Content-Type: application/json' \\
--data '${JSON.stringify(curlJSON, null, 2)}'`;

  setCurlModal({ open: true, data: curlCommand });
};


  // Close modal
  const closeModal = () => {
    setModal({ type: null, data: null });
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.templateName &&
      template.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? template.category === selectedCategory
      : true;
    const matchesType = selectedType ? template.type === selectedType : true;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Pagination logic
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = filteredTemplates.slice(
    indexOfFirstTemplate,
    indexOfLastTemplate
  );
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Extract unique categories and types
  const categories = [
    ...new Set(templates.map((template) => template.category)),
  ];
  const types = [...new Set(templates.map((template) => template.type))];

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100" style={{ fontFamily: "Montserrat" }}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100" style={{ fontFamily: "Montserrat" }}>
        <div className="bg-white p-4 rounded-lg shadow-md border border-red-300">
          <div className="text-red-500 font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-gray-100" style={{ fontFamily: "Montserrat" }}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <h2 className="text-3xl font-semibold text-gray-700">
          Manage Template
        </h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-yellow-600 text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-yellow-600">Manage Template</span>
        </div>
      </div>

      {/* Table and Filters */}
      <div className="bg-white p-4 shadow rounded-lg border border-gray-300">
        <div className="flex justify-end items-center pb-4 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search Template"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border text-gray-500 border-gray-300 px-3 py-2 rounded-md"
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
              className="border text-gray-500 border-gray-300 px-3 py-2 rounded-md"
            >
              <option value="">Select Type</option>
              {types.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button className="text-white px-4 py-2 rounded-md bg-yellow-600">
              📺 Watch Tutorial
            </button>
            <button
              onClick={handleCreateTemplate}
              className="text-white px-4 py-2 rounded-md bg-yellow-600"
            >
              + Create New Template
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-gray-600 font-medium">S.No.</th>
              <th className="p-3 text-gray-600 font-medium">Template Name</th>
              <th className="p-3 text-gray-600 font-medium">Category</th>
              <th className="p-3 text-gray-600 font-medium">Status</th>
              <th className="p-3 text-gray-600 font-medium">Type</th>
              <th className="p-3 text-gray-600 font-medium">Created On</th>
              <th className="p-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTemplates.length > 0 ? (
              currentTemplates.map((template, index) => (
                <tr
                  key={template.id}
                  className="border border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-3">{indexOfFirstTemplate + index + 1}</td>
                  <td className="p-3">{template.templateName}</td>
                  <td className="p-3">{template.category}</td>
                  <td className="p-3">
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
                  <td className="p-3">{template.type}</td>
                  <td className="p-3">
                    {new Date(template.createdOn).toLocaleString()}
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button
                      className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                      onClick={() => handlePreview(template)}
                      title="Preview"
                    >
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-yellow-600"
                      />
                    </button>
                    <button
                      className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                      onClick={() => handleCopy(template)}
                      title="Copy"
                    >
                      <FontAwesomeIcon
                        icon={faCopy}
                        className="text-yellow-600"
                      />
                    </button>
                    <button
                      className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                      onClick={() => handleDelete(template.id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-yellow-600"
                      />
                    </button>
                    <button
                      className="border border-yellow-600 p-1 hover:bg-yellow-100 rounded"
                      title="Show cURL"
                      onClick={() => handleShowCurl(template)}
                    >
                      <FontAwesomeIcon
                        icon={faAngleLeft}
                        className="text-yellow-600"
                      />
                      <FontAwesomeIcon
                        icon={faAngleRight}
                        className="text-yellow-600 ml-1"
                      />
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstTemplate + 1} to{" "}
            {Math.min(indexOfLastTemplate, filteredTemplates.length)} of{" "}
            {filteredTemplates.length} entries
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

      {/* Preview Modal */}
      {modal.type === "preview" && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-300 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {modal.data?.templateName || "Template Preview"}
            </h2>
            <div className="border border-gray-300 p-4 rounded-md bg-gray-50">
              <div className="whitespace-pre-wrap mb-4">
                {modal.data?.templateBody || "No content available"}
              </div>
              {modal.data?.templateFooter && (
                <div className="text-sm text-gray-500 border-t pt-2 mt-2">
                  {modal.data.templateFooter}
                </div>
              )}
              {modal.data?.attributes?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Attributes:</h3>
                  <ul className="space-y-1">
                    {modal.data.attributes.map((attr, index) => (
                      <li key={index} className="flex">
                        <span className="font-medium w-24">{attr.name}:</span>
                        <span>{attr.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {modal.type === "create" && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Create New Template
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="bg-gray-100 border-2 border-dashed border-green-500 p-6 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => {
                  closeModal();
                  navigate("/create-template");
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">
                    Start from scratch
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Start from a blank template
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 border-2 border-dashed border-green-500 p-6 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7v8m4-8v8m4-8v8"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700">
                    Use a template
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use one of our pre-defined templates and edit them
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* cURL Modal */}
      {curlModal.open && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl border border-gray-300 relative">
            <button
              onClick={() => setCurlModal({ open: false, data: null })}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Generated cURL Command
            </h2>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
              {curlModal.data}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(curlModal.data);
                alert("Copied to clipboard!");
              }}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Message Popup */}
      {showMessagePopup && (
        <MessagePopup
          templates={templates}
          onClose={() => setShowMessagePopup(false)}
        />
      )}
    </div>
  );
};

export default ManageTemplates;
