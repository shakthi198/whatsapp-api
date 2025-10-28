import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiEndpoints from "../apiconfig";
import WhatsAppPreview from "./whatsapppreview";
import { Box } from "@mui/material";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef(null);
  const [templateBody, setTemplateBody] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAttributePopup, setShowAddAttributePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });

  const [formData, setFormData] = useState({
    templateName: "",
    categoryGuid: "",
    languageGuid: "",
    type: "",
    erpCategory: "",
    status: "Approved",
    createdOn: new Date().toLocaleString(),
    headerType: "text",
    headerText: "",
  });

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const GLOBAL_ATTRIBUTES = [
    { name: "name", value: "user name" },
    { name: "date", value: "meet date" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiEndpoints.Category);
        const data = await res.json();
        if (res.ok && data.status) setCategories(data.data);
        else toast.error(data.message || "Failed to load categories");
      } catch {
        toast.error("Error loading categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch(apiEndpoints.language);
        const data = await res.json();
        if (res.ok && data.status) {
          setLanguages(
            data.data.map((lang) => ({
              guid: lang.guid,
              name: lang.languageName,
            }))
          );
        } else toast.error(data.message || "Failed to load languages");
      } catch {
        toast.error("Error loading languages");
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (location.state?.template) {
      const { template } = location.state;
      setFormData({
        templateName: template.templateName,
        categoryGuid: template.categoryGuid,
        languageGuid: template.languageGuid,
        type: template.type,
        erpCategory: template.erpCategory,
        status: template.status,
        createdOn: template.createdOn || new Date().toLocaleString(),
        headerType: template.headerType || "text",
        headerText: template.headerText || "",
      });
      setTemplateBody(template.templateBody);
      setTemplateFooter(template.templateFooter);
      let attrs = [];
      try {
        attrs =
          typeof template.attributes === "string"
            ? JSON.parse(template.attributes)
            : template.attributes;
      } catch {
        attrs = [];
      }
      setAttributes(Array.isArray(attrs) ? attrs : []);
    }
  }, [location.state]);

  const handleAddAttribute = () => {
    setNewAttribute({ name: "", value: "" });
    setShowAddAttributePopup(true);
  };

  const handleCloseAddPopup = () => setShowAddAttributePopup(false);

  const insertPlaceholderValue = (value) => {
    const placeholder = `{{${value}}}`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updatedText =
        templateBody.substring(0, start) +
        placeholder +
        templateBody.substring(end);
      setTemplateBody(updatedText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };

  const handleSaveAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setAttributes([...attributes, newAttribute]);
      insertPlaceholderValue(newAttribute.value);
      setShowAddAttributePopup(false);
    }
  };

  const handleDelete = (index) =>
    setAttributes(attributes.filter((_, i) => i !== index));

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["templateName", "categoryGuid", "languageGuid", "type"];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length)
      return toast.error(`Please fill: ${missing.join(", ")}`);

    const templateData = {
      name: formData.templateName,
      categoryGuid: formData.categoryGuid,
      languageGuid: formData.languageGuid,
      typeId: formData.type === "TEXT" ? 1 : 2,
      isFile: formData.type === "MEDIA" ? 1 : 0,
      body: templateBody,
      templateFooter,
      templateHeaders: JSON.stringify({
        type: formData.headerType,
        text: formData.headerText,
      }),
      erpCategoryGuid: formData.erpCategory || null,
      isVariable: attributes.length > 0 ? 1 : 0,
      bodyStyle: "",
      actionId: null,
      actionGuid: null,
      fileGuids: JSON.stringify([]),
      status: formData.status,
      attributes: JSON.stringify(attributes),
    };

    try {
      const res = await fetch(apiEndpoints.managetemplate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Template saved successfully!");
      navigate("/templates");
    } catch (err) {
      toast.error(err.message || "Failed to save template");
    }
  };

  const previewData = {
    headerType: formData.headerType,
    headerText: formData.headerText,
    body: templateBody,
    footer: templateFooter,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-[Montserrat]">
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        {/* Left Section */}
        <Box flex={1}>
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 w-full">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
              Create New Template
            </h1>

            {/* Grid Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  name="templateName"
                  placeholder="Template Name"
                  className="border border-gray-300 p-2 rounded w-full"
                  value={formData.templateName}
                  onChange={handleChange}
                />
              </div>

              <select
                className="border border-gray-300 p-2 rounded w-full"
                name="categoryGuid"
                value={formData.categoryGuid}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.category_guid} value={cat.category_guid}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 p-2 rounded w-full"
                name="languageGuid"
                value={formData.languageGuid}
                onChange={handleChange}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.guid} value={lang.guid}>
                    {lang.name}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 p-2 rounded w-full"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="TEXT">Text</option>
                <option value="MEDIA">Media</option>
              </select>
            </div>

            {/* Body */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Body</h2>
              <p className="text-sm text-gray-600 mb-3">
                Make your messages personal using variables.
              </p>

              <button
                className="border border-yellow-500 text-yellow-500 px-3 py-2 rounded mb-3 hover:bg-yellow-50"
                onClick={() => setShowPopup(true)}
              >
                Add Variable
              </button>

              <div className="border border-gray-300 rounded-md p-3">
                <textarea
                  ref={textareaRef}
                  placeholder="Template Body"
                  className="w-full h-40 border-none outline-none resize-none"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                />
              </div>
              <p className="text-right text-xs sm:text-sm text-gray-500 mt-1">
                {templateBody.length}/1024 characters
              </p>
            </div>

            {/* Footer */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Template Footer</h2>
              <input
                type="text"
                placeholder="Template Footer"
                className="border border-gray-300 p-2 rounded w-full"
                value={templateFooter}
                onChange={(e) => setTemplateFooter(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-50">
                Save as Draft
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={handleSubmit}
              >
                Submit Template
              </button>
            </div>
          </div>
        </Box>

        {/* Right Section (Preview) */}
        <Box flex={1} className="mt-6 md:mt-0 ">
          <WhatsAppPreview templateData={previewData} />
        </Box>
      </Box>

      {/* Popups (Responsive Widths) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-3/4 md:w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Attribute</h2>
              <button onClick={() => setShowPopup(false)}>✕</button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="🔍 Search attributes..."
                className="w-89 border p-2 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-[#D2B887] text-white py-2 px-4 rounded flex ml-20"
                onClick={handleAddAttribute}
              >
                + Add Attribute
              </button>
            </div>
            {/* ✅ Global Variables Section */}
            <h3 className="font-semibold mt-4">Global Variables</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {GLOBAL_ATTRIBUTES.map((attr, index) => (
                <div
                  key={`global-${index}`}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full border border-blue-400 cursor-pointer"
                  onClick={() => insertPlaceholderValue(attr.value)}
                >
                  {attr.name}: {attr.value}
                </div>
              ))}
            </div>

            {/* ✅ Template Variables Section */}
            <h3 className="font-semibold mt-4">Template Variables</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {attributes.map((attr, index) => (
                <div
                  key={`local-${index}`}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-full border border-green-400 cursor-pointer"
                  onClick={() => insertPlaceholderValue(attr.value)}
                >
                  {attr.name}: {attr.value}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent insert when delete clicked
                      handleDelete(index);
                    }}
                    className="ml-2 bg-white text-red-500 p-1 rounded-full"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div className="flex mt-4 items-center gap-2">
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronLeft className="text-2xl" />
              </button>
              <button className="border border-yellow-600 px-4 py-2 rounded-md text-black font-medium">
                1
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronRight className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAttributePopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-3/4 md:w-1/3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Add User Attribute</h2>
              <button onClick={handleCloseAddPopup}>&times;</button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter Attribute Name"
                className="w-full border p-2 rounded mt-1"
                value={newAttribute.name}
                onChange={(e) =>
                  setNewAttribute({ ...newAttribute, name: e.target.value })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Value</label>
              <input
                type="text"
                placeholder="Enter Attribute Value"
                className="w-full border p-2 rounded mt-1"
                value={newAttribute.value}
                onChange={(e) =>
                  setNewAttribute({
                    ...newAttribute,
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="border px-4 py-2 rounded"
                onClick={handleCloseAddPopup}
              >
                Cancel
              </button>
              <button
                className="bg-[#D2B887] text-white px-4 py-2 rounded"
                onClick={handleSaveAttribute}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTemplate;
