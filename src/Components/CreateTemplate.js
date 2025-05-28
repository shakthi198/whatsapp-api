import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiEndpoints from "../apiconfig";
import WhatsAppPreview from "./whatsapppreview";
import { Box, Typography, Button, Stack } from "@mui/material";
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';


const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [templateBody, setTemplateBody] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAttributePopup, setShowAddAttributePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });

  const [formData, setFormData] = useState({
    templateName: "",
    categoryGuid: "", // Changed from 'category'
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
  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiEndpoints.Category);
        const data = await res.json();
        if (res.ok && data.status) {
          setCategories(data.data);
        } else {
          toast.error(data.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch Languages
  // useEffect(() => {
  //   const fetchLanguages = async () => {
  //     try {
  //       const res = await fetch(apiEndpoints.language);
  //       const data = await res.json();
  //       if (res.ok && data.status) {
  //         setLanguages(data.data.map(lang => ({
  //           guid: lang.guid,
  //           name: lang.languageName,
  //         })));
  //       } else {
  //         toast.error(data.message || 'Failed to load languages');
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       toast.error('Error loading languages');
  //     }
  //   };
  //   fetchLanguages();
  // }, []);

  // Populate form when editing
  useEffect(() => {
    if (location.state?.template) {
      const { template } = location.state;
      setFormData({
        templateName: template.templateName,
        category: template.category,
        language: template.language,
        type: template.type,
        erpCategory: template.erpCategory,
        status: template.status,
        createdOn: template.createdOn || new Date().toLocaleString(),
        headerType: template.headerType || "text",
        headerText: template.headerText || "",
      });
      setTemplateBody(template.templateBody);
      setTemplateFooter(template.templateFooter);
      setAttributes(template.attributes || []);
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
      setShowAddAttributePopup(false);
    }
  };

  const handleDelete = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  const requiredFields = ['templateName', 'categoryGuid', 'languageGuid', 'type'];
  const missing = requiredFields.filter(field => !formData[field]);
  if (missing.length) {
    toast.error(`Please fill: ${missing.join(', ')}`);
    return;
  }

  // Prepare data matching backend structure
  const templateData = {
    name: formData.templateName,
    categoryGuid: formData.categoryGuid,
    languageGuid: formData.languageGuid,
    typeId: formData.type === 'TEXT' ? 1 : 2,
    isFile: formData.type === 'MEDIA' ? 1 : 0,
    body: templateBody,
    templateFooter: templateFooter,
    templateHeaders: JSON.stringify({  // Stringify the headers object
      type: formData.headerType,
      text: formData.headerText,
    }),
    erpCategoryGuid: formData.erpCategory || null,
    isVariable: attributes.length > 0 ? 1 : 0,
    bodyStyle: "",
    actionId: null,
    actionGuid: null,
    fileGuids: JSON.stringify([]),  // Stringify empty array
    status: formData.status,
    attributes: JSON.stringify(attributes)  // Stringify attributes array
  };

  console.log("Submitting data:", templateData); // Debug log

  try {
    const response = await fetch(apiEndpoints.templates, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save template');
    }

    toast.success('Template saved successfully!');
    navigate("/templates");
  } catch (error) {
    console.error('Submission error:', error);
    toast.error(error.message || 'Failed to save template. Please check console for details.');
  }
};

  const previewData = {
    headerType: formData.headerType,
    headerText: formData.headerText,
    body: templateBody,
    footer: templateFooter,
    buttons: attributes.map(attr => attr.value),
    Box,
    Typography,
    Stack,
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "Montserrat" }}>
      <Box display="flex" gap={2}>
        {/* Left: Form Section - flex grows to occupy available space */}
        <Box sx={{ flex: 1 }}>
          <div className="bg-white shadow-md rounded-lg p-6 w-full">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Template</h1>

            {/* Top Section - Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded w-full"
                  name="templateName"
                  placeholder="Template Name"
                  value={formData.templateName}
                  onChange={handleChange}
                />
                {!formData.templateName && (
                  <p className="text-red-500 text-xs mt-1">Error Template Name</p>
                )}
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

              {/* Language Select */}
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
              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
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

            {/* Interactive Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Interactive Actions (Optional)</h2>
              <select className="border border-gray-300 p-2 rounded w-full max-w-xs">
                <option value="">Select action</option>
                <option value="CTA">Call To Action</option>
                <option value="QUICK_REPLY">Quick Reply</option>
              </select>
            </div>

            {/* Template Footer */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Template Footer (Optional)</h2>
              <p className="text-sm text-gray-600 mb-3">
                Footers are great to add any disclaimers or to add a thoughtful PS and only up to 60 characters are allowed.
              </p>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Template Footer"
                value={templateFooter}
                onChange={(e) => setTemplateFooter(e.target.value)}
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
                  <button onClick={() => setShowPopup(false)} className="text-m font-bold">X</button>
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
                <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
                  {attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-green-500 text-white px-4 py-2 rounded-full border border-green-400"
                    >
                      {attr.name}: {attr.value}
                      <button
                        onClick={() => handleDelete(index)}
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
                    onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium">Value</label>
                  <input
                    type="text"
                    placeholder="Enter Attribute Value"
                    className="w-full border p-2 rounded mt-1"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button className="border px-4 py-2 rounded" onClick={handleCloseAddPopup}>
                    Cancel
                  </button>
                  <button className="bg-[#D2B887] text-white px-4 py-2 rounded" onClick={handleSaveAttribute}>
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