import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faCopy, faAngleLeft, faAngleRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
import MessagePopup from "./MessagePopup"; // Import the MessagePopup component

const ManageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const templatesPerPage = 5;

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem("templates")) || [];
    setTemplates(savedTemplates);
  }, []);

  // Add new template from location.state
  useEffect(() => {
    if (location.state?.template) {
      const newTemplate = location.state.template;
      setTemplates((prevTemplates) => {
        const templateExists = prevTemplates.some((template) => template.id === newTemplate.id);
        if (!templateExists) {
          const updatedTemplates = [...prevTemplates, newTemplate];
          localStorage.setItem("templates", JSON.stringify(updatedTemplates));
          navigate(location.pathname, { replace: true, state: {} });
          return updatedTemplates;
        }
        return prevTemplates;
      });
    }
  }, [location.state, navigate, location.pathname]);

  // Handle delete template
  const handleDelete = (id) => {
    const filteredTemplates = templates.filter((template) => template.id !== id);
    setTemplates(filteredTemplates);
    localStorage.setItem("templates", JSON.stringify(filteredTemplates));
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

  // Close modal
  const closeModal = () => {
    setModal({ type: null, data: null });
  };

  // Pagination logic
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(templates.length / templatesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    const matchesType = selectedType ? template.type === selectedType : true;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Extract unique categories and types
  const categories = [...new Set(templates.map((template) => template.category))];
  const types = [...new Set(templates.map((template) => template.type))];

  return (
    <div className="p-6 bg-gray-100"style={{ fontFamily: "Montserrat" }}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <h2 className="text-3xl font-semibold text-gray-700">Manage Template</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Manage Template</span>
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
            <button className=" text-white px-4 py-2 rounded-md bg-[#DDA853]">
              📺 Watch Tutorial
            </button>
            <button
              onClick={handleCreateTemplate}
              className="text-white px-4 py-2 rounded-md bg-[#DDA853]"
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
            {filteredTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate).map((template, index) => (
              <tr key={template.id} className="border border-gray-300">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{template.templateName}</td>
                <td className="p-3">{template.category}</td>
                <td className="p-3">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                    {template.status}
                  </span>
                </td>
                <td className="p-3">{template.type}</td>
                <td className="p-3">{template.createdOn}</td>
                <td className="p-3 flex space-x-2">
                  <button
                    className="border border-yellow-600 p-1 hover:bg-yellow-100"
                    onClick={() => handlePreview(template)}
                  >
                    <FontAwesomeIcon icon={faEye} className="text-yellow-600" />
                  </button>
                  <button
                    className="border border-yellow-600 p-1 hover:bg-yellow-100"
                    onClick={() => handleCopy(template)}
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-yellow-600" />
                  </button>
                  <button
                    className="border border-yellow-600 p-1 hover:bg-yellow-100"
                    onClick={() => handleDelete(template.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-yellow-600" />
                  </button>
                  <button
                    className="border border-yellow-600 p-1 hover:bg-yellow-100"
                  >
                    <FontAwesomeIcon icon={faAngleLeft} className="text-yellow-600" />
                    <FontAwesomeIcon icon={faAngleRight} className="text-yellow-600 ml-1" />
                  </button>
                  {/* <button
                    className="border border-yellow-600 p-1 hover:bg-yellow-100"
                    onClick={() => setShowMessagePopup(true)}
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="text-yellow-600" />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end mt-4 items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
          >
            <HiChevronLeft className="text-2xl" />
          </button>
          <button className="border border-[#DDA853] px-4 py-2 rounded-md text-black font-medium">
            {currentPage}
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(filteredTemplates.length / templatesPerPage)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
          >
            <HiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {modal.type === "preview" && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 text-lg">&times;</button>
            <div className="flex flex-col items-center">
              <div className="w-35 h-35 bg-gray-300  flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-30 h-30 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
              <div className="mt-4">
                <p className="text-gray-700">{modal.data?.templateName || "No Name"}</p>
                <p className="text-gray-700">{modal.data?.templateBody || "No Body Content"}</p>
                {modal.data?.image && (
                  <img src={modal.data.image} alt="Template Preview" className="max-w-full h-auto" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {modal.type === "create" && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4 pl-64">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Template</h2>
            <div className="grid grid-cols-2 gap-4">
              <div
                key="start-from-scratch"
                className="bg-gray-200 border-2 border-dashed border-green-500 p-4 rounded-lg cursor-pointer"
                onClick={() => {
                  closeModal();
                  navigate("/create-template");
                }}
              >
                <h4 className="text-lg font-semibold text-gray-700">Start from scratch</h4>
                <p className="text-sm text-gray-600">Start from a blank template</p>
              </div>
              <div
                key="use-template"
                className="bg-gray-200 border-2 border-dashed border-green-500 p-4 rounded-lg cursor-pointer"
              >
                <h4 className="text-lg font-semibold text-gray-700">Use a template</h4>
                <p className="text-sm text-gray-600">Use one of our pre-defined templates and edit them</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Popup */}
      {showMessagePopup && (
        <MessagePopup
          templates={templates} // Pass all templates to the MessagePopup
          onClose={() => setShowMessagePopup(false)} // Close the popup
        />
      )}
    </div>
  );
};

export default ManageTemplates;