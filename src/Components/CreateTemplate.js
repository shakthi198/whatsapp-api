import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiEndpoints from "../apiconfig";
import WhatsAppPreview from "./whatsapppreview";
import { Box, Typography, Button, Stack } from "@mui/material";
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
  const [quickReplies, setQuickReplies] = useState([]);
  const [newQuickReply, setNewQuickReply] = useState("");

  const [formData, setFormData] = useState({
    templateName: "",
    categoryName: "", // Changed from categoryGuid to categoryName
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

  // ✅ Global variables available in all templates
  const GLOBAL_ATTRIBUTES = [
    { name: "name", value: "user name" },
    { name: "date", value: "meet date" },
  ];

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiEndpoints.Category);
        const data = await res.json();
        if (res.ok && data.status) {
          setCategories(data.data);
        } else {
          toast.error(data.message || "Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch Languages
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
        } else {
          toast.error(data.message || "Failed to load languages");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading languages");
      }
    };
    fetchLanguages();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (location.state?.template) {
      const { template } = location.state;

      // If template has template_json, use that
      if (template.template_json) {
        const templateJson = template.template_json;

        // Extract components from JSON
        templateJson.components.forEach(component => {
          switch (component.type) {
            case 'BODY':
              setTemplateBody(component.text || '');
              break;
            case 'FOOTER':
              setTemplateFooter(component.text || '');
              break;
            case 'HEADER':
              if (component.format === 'TEXT') {
                setFormData(prev => ({
                  ...prev,
                  headerText: component.text || '',
                  headerType: 'text'
                }));
              }
              break;
            case 'BUTTONS':
              if (component.buttons) {
                const replies = component.buttons
                  .filter(btn => btn.type === 'QUICK_REPLY')
                  .map(btn => ({ text: btn.text }));
                setQuickReplies(replies);
              }
              break;
          }
        });

        setFormData(prev => ({
          ...prev,
          templateName: templateJson.name || template.template_name,
          type: templateJson.category === 'TRANSACTIONAL' ? 'TEXT' : 'MEDIA'
        }));
      } else {
        // Fallback to legacy fields - UPDATED for categoryName
        setFormData({
          templateName: template.template_name,
          categoryName: template.categoryName || "", // Use categoryName instead of categoryGuid
          languageGuid: template.languageGuid,
          type: template.template_type === 1 ? 'TEXT' : 'MEDIA',
          erpCategory: template.erpCategoryGuid,
          status: "Approved",
          createdOn: template.createdOn,
          headerType: "text",
          headerText: "",
        });
        setTemplateBody(template.body);
        setTemplateFooter(template.template_footer);
      }

      // Parse attributes
      let attrs = [];
      try {
        attrs =
          typeof template.attributes === "string"
            ? JSON.parse(template.attributes)
            : template.attributes;
      } catch (err) {
        console.error("Failed to parse attributes:", err);
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

  const handleSaveAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setAttributes([...attributes, newAttribute]);
      insertPlaceholderValue(newAttribute.value);
      setShowAddAttributePopup(false);
    }
  };

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

  const handleDelete = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAddQuickReply = () => {
    if (newQuickReply.trim() && quickReplies.length < 3) {
      setQuickReplies([...quickReplies, { text: newQuickReply.trim() }]);
      setNewQuickReply("");
    }
  };

  const handleRemoveQuickReply = (index) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "templateName",
      "categoryName", // Updated field name
      "languageGuid",
      "type",
    ];
    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    // Prepare data - NO HEADERS since not in target format
    const templateData = {
      name: formData.templateName,
      categoryName: formData.categoryName, // Send category name instead of GUID
      languageGuid: formData.languageGuid,
      typeId: formData.type === "TEXT" ? 1 : 2,
      isFile: formData.type === "MEDIA" ? 1 : 0,
      body: templateBody,
      templateFooter: templateFooter,
      templateHeaders: JSON.stringify({}), // Empty headers
      erpCategoryGuid: formData.erpCategory || null,
      isVariable: attributes.length > 0 ? 1 : 0,
      bodyStyle: "",
      actionId: null,
      actionGuid: null,
      fileGuids: JSON.stringify([]),
      status: formData.status,
      attributes: JSON.stringify(attributes),
      quickReplies: JSON.stringify(quickReplies),
    };

    console.log("Submitting data to backend:", templateData);
    console.log("This will be sent to Meta as:", {
      name: templateData.name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Date.now(),
      category: "UTILITY", // Always UTILITY as per requirement
      language: "en",
      components: [
        {
          type: "BODY",
          text: templateData.body // With variables transformed to {{1}}, {{2}}
        },
        ...(templateData.templateFooter ? [{
          type: "FOOTER",
          text: templateData.templateFooter
        }] : []),
        ...(quickReplies.length > 0 ? [{
          type: "BUTTONS",
          buttons: quickReplies.map(reply => ({
            type: "QUICK_REPLY",
            text: reply.text
          }))
        }] : [])
      ]
    });

    try {
      const response = await fetch(apiEndpoints.managetemplate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save template");
      }

      toast.success("Template saved successfully!");
      navigate("/templates");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.message ||
        "Failed to save template. Please check console for details."
      );
    }
  };

  const previewData = {
    headerType: formData.headerType,
    headerText: formData.headerText,
    body: templateBody,
    footer: templateFooter,
    quickReplies: quickReplies,
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      style={{ fontFamily: "Montserrat" }}
    >
      <Box display="flex" gap={2}>
        {/* Left: Form Section */}
        <Box sx={{ flex: 1 }}>
          <div className="bg-white shadow-md rounded-lg p-6 w-full">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Create New Template
            </h1>

            {/* Top Section - Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded w-full"
                  name="templateName"
                  placeholder="Template Name"
                  value={formData.templateName}
                  onChange={handleChange}
                />
                {!formData.templateName && (
                  <p className="text-red-500 text-xs mt-1">
                    Error Template Name
                  </p>
                )}
              </div>

              {/* Category Select - Updated to use categoryName */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="border border-gray-300 p-2 rounded w-full"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_guid} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
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
              </div>

              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Type
                </label>
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
            </div>

            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Header</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Type
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded w-full"
                    name="headerType"
                    value={formData.headerType}
                    onChange={handleChange}
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Text
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full"
                    name="headerText"
                    placeholder="Header Text"
                    value={formData.headerText}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Body Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Body</h2>
              <p className="text-sm text-gray-600 mb-3">
                Make your messages personal using variables like and get more replies!
              </p>

              <button
                className="border border-yellow-500 text-yellow-500 px-4 py-2 rounded mb-3 hover:bg-yellow-50"
                onClick={() => setShowPopup(true)}
              >
                Add Variable
              </button>

              <div className="border border-gray-300 rounded-md p-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Template Body"
                  className="w-full h-40 border-none outline-none resize-none"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                />
              </div>
              <p className="text-right text-sm text-gray-500 mt-1">
                {templateBody.length}/1024 characters
              </p>
            </div>

            {/* Quick Replies Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Quick Replies (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Add up to 3 quick reply buttons
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded flex-1"
                  placeholder="Quick reply text"
                  value={newQuickReply}
                  onChange={(e) => setNewQuickReply(e.target.value)}
                  maxLength={20}
                />
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-300"
                  onClick={handleAddQuickReply}
                  disabled={!newQuickReply.trim() || quickReplies.length >= 3}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {reply.text}
                    <button
                      onClick={() => handleRemoveQuickReply(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Footer */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Template Footer (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Footers are great to add any disclaimers or to add a thoughtful
                PS and only up to 60 characters are allowed.
              </p>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Template Footer"
                value={templateFooter}
                onChange={(e) => setTemplateFooter(e.target.value)}
                maxLength={60}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50"
                disabled
              >
                Save as draft
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={handleSubmit}
              >
                Submit Template
              </button>
            </div>
          </div>

          {showPopup && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Select Attribute</h2>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-m font-bold"
                  >
                    X
                  </button>
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
                          e.stopPropagation();
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
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
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
        </Box>
        <Box flex={1}>
          <WhatsAppPreview templateData={previewData} />
        </Box>
      </Box>
    </div>
  );
};

export default CreateTemplate;