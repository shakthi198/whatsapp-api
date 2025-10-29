import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiEndpoints from "../apiconfig";
import WhatsAppPreview from "./whatsapppreview";
import { Box } from "@mui/material";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import {
  FaUpload,
  FaTimes,
  FaFileImage,
  FaFileVideo,
  FaFilePdf,
  FaFileAudio,
} from "react-icons/fa";

const CreateTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [templateBody, setTemplateBody] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAttributePopup, setShowAddAttributePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });
  const [quickReplies, setQuickReplies] = useState([]);
  const [newQuickReply, setNewQuickReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // New states for template buttons and format
  const [templateButtons, setTemplateButtons] = useState([]);
  const [newButton, setNewButton] = useState({
    type: "URL",
    text: "",
    url: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    templateName: "",
    categoryName: "",
    languageGuid: "",
    type: "",
    erpCategory: "",
    status: "Approved",
    createdOn: new Date().toLocaleString(),
    headerType: "text",
    headerText: "",
    templateCategory: "UTILITY",
  });

  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaId, setMediaId] = useState(null);

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

  // Reset header and media when template type changes
  useEffect(() => {
    if (formData.type === "MEDIA") {
      setFormData((prev) => ({
        ...prev,
        headerType: "text", // Reset to text header for MEDIA type
        headerText: "", // Clear header text
      }));
      setMediaFile(null);
      setMediaType("");
      setMediaId(null);
    }
  }, [formData.type]);

  // Auto-detect media type when file is selected
  useEffect(() => {
    if (mediaFile) {
      const fileType = mediaFile.type.split("/")[0];
      if (fileType === "image") {
        setMediaType("image");
      } else if (fileType === "video") {
        setMediaType("video");
      } else if (mediaFile.type === "application/pdf") {
        setMediaType("document");
      } else if (fileType === "audio") {
        setMediaType("audio");
      } else {
        setMediaType("document");
      }
    }
  }, [mediaFile]);

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

  // New button handlers
  const handleAddButton = () => {
    if (templateButtons.length < 3) {
      const buttonData = {
        type: newButton.type,
        text: newButton.text.trim(),
      };

      if (newButton.type === "URL") {
        buttonData.url = newButton.url;
      } else if (newButton.type === "PHONE_NUMBER") {
        buttonData.phone = newButton.phone;
      }

      setTemplateButtons([...templateButtons, buttonData]);
      setNewButton({ type: "URL", text: "", url: "", phone: "" });
    }
  };

  const handleRemoveButton = (index) => {
    setTemplateButtons(templateButtons.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SEPARATE MEDIA UPLOAD FUNCTION
  const uploadMediaToServer = async (file) => {
    try {
      setIsUploadingMedia(true);
      const formData = new FormData();
      formData.append("media_file", file);

      console.log("Uploading media file separately...", file);

      const response = await fetch(apiEndpoints.managetemplate, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Media upload failed");
      }

      if (!data.media_id) {
        throw new Error("No media ID received from server");
      }

      return data.media_id;
    } catch (error) {
      console.error("Media upload error:", error);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // SEPARATE TEMPLATE SUBMISSION FUNCTION
  const submitTemplateToServer = async (templateData) => {
    try {
      console.log("Submitting template data:", templateData);

      const response = await fetch(apiEndpoints.managetemplate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Template submission failed");
      }

      return data;
    } catch (error) {
      console.error("Template submission error:", error);
      throw error;
    }
  };

  // Media handling - Auto-upload when file is selected
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      try {
        setMediaFile(file);
        toast.info("Uploading media file...");

        const uploadedMediaId = await uploadMediaToServer(file);

        setMediaId(uploadedMediaId);
        toast.success("Media uploaded successfully!");
        console.log("Media uploaded with ID:", uploadedMediaId);
      } catch (error) {
        console.error("Media upload failed:", error);
        toast.error("Media upload failed: " + error.message);
        setMediaFile(null);
        setMediaId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const removeMediaFile = () => {
    setMediaFile(null);
    setMediaType("");
    setMediaId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case "image":
        return <FaFileImage className="text-green-500 text-xl" />;
      case "video":
        return <FaFileVideo className="text-red-500 text-xl" />;
      case "document":
        return <FaFilePdf className="text-red-500 text-xl" />;
      case "audio":
        return <FaFileAudio className="text-purple-500 text-xl" />;
      default:
        return <FaFileImage className="text-green-500 text-xl" />;
    }
  };

  // Main submit handler - Only submits template data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate required fields
    const requiredFields = [
      "templateName",
      "categoryName",
      "languageGuid",
      "type",
    ];
    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    // Validate media for MEDIA type
    if (formData.type === "MEDIA" && !mediaId) {
      toast.error("Please upload a media file first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare template data
      const templateData = {
        name: formData.templateName,
        categoryName: formData.categoryName,
        languageGuid: formData.languageGuid,
        typeId: formData.type === "TEXT" ? 1 : 2, // 1 for TEXT, 2 for MEDIA
        isFile: formData.type === "MEDIA" ? 1 : 0,
        body: templateBody,
        templateFooter: templateFooter,
        templateHeaders: JSON.stringify({
          headerType: formData.headerType,
          headerText: formData.headerText,
        }),
        erpCategoryGuid: formData.erpCategory || null,
        isVariable: attributes.length > 0 ? 1 : 0,
        bodyStyle: "",
        actionId: null,
        actionGuid: null,
        fileGuids: JSON.stringify([]),
        status: formData.status,
        attributes: JSON.stringify(attributes),
        quickReplies: JSON.stringify(quickReplies),
        templateButtons: JSON.stringify(templateButtons),
        templateCategory: formData.templateCategory,
        media_id: mediaId, // Include the uploaded media ID
      };

      console.log("Submitting template with data:", templateData);

      // Submit template data (SEPARATE API CALL - JSON format)
      const result = await submitTemplateToServer(templateData);

      toast.success("Template created successfully!");

      if (result.warning) {
        toast.warning(result.warning);
      }

      if (result.data?.meta_status === "FAILED") {
        toast.warning("Template saved locally but Meta submission failed");
      }

      console.log("Template creation result:", result);
      navigate("/templates");
    } catch (error) {
      console.error("Template submission error:", error);
      toast.error(error.message || "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update preview data
  const previewData = {
    headerType: formData.headerType,
    headerText: formData.headerText,
    body: templateBody,
    footer: templateFooter,
    quickReplies: quickReplies,
    templateButtons: templateButtons,
    mediaFile: mediaFile,
    mediaType: mediaType,
    mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : null,
    fileName: mediaFile ? mediaFile.name : "",
    templateType: formData.type, // Add template type to preview
  };

  return (
    <div
      className="min-h-screen xl:w-full lg:w-2xl md:w-md bg-gray-50 p-6"
      style={{ fontFamily: "Montserrat" }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", lg: "row" }}
        gap={2}
        className="w-full"
      >
        {/* Left: Form Section */}
        <Box sx={{ flex: 1 }} className="w-full">
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

              {/* Category Select */}
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

              {/* Template Category (for Meta) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Category
                </label>
                <select
                  className="border border-gray-300 p-2 rounded w-full"
                  name="templateCategory"
                  value={formData.templateCategory}
                  onChange={handleChange}
                >
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                  <option value="MARKETING">Marketing</option>
                </select>
              </div>
            </div>

            {/* Media Section - Show only for MEDIA type */}
            {formData.type === "MEDIA" && (
              <div className="mb-8 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-blue-50">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Media Upload *
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Media File
                    {mediaId && (
                      <span className="text-green-600 ml-2">✓ Uploaded</span>
                    )}
                    {isUploadingMedia && (
                      <span className="text-yellow-600 ml-2">Uploading...</span>
                    )}
                  </label>

                  {!mediaFile ? (
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: Images, Videos, Documents, Audio (Max
                        10MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleMediaUpload}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,audio/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploadingMedia}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getMediaIcon()}
                          <div>
                            <p className="font-medium text-gray-800">
                              {mediaFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                              {mediaType}
                            </p>
                            {mediaId && (
                              <p className="text-xs text-green-600 font-mono">
                                Media ID: {mediaId}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeMediaFile}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500"
                          disabled={isUploadingMedia}
                        >
                          <FaTimes className="text-lg" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header Section - Show only for TEXT type */}
            {formData.type === "TEXT" && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  Header
                </h2>
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
                      <option value="video">Video</option>
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
            )}

            {/* Body Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Body</h2>
              <p className="text-sm text-gray-600 mb-3">
                Make your messages personal using variables like and get more
                replies!
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

            {/* Template Buttons Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Template Buttons (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Add buttons for URL, Phone, or Quick Reply actions
              </p>

              {/* Add Button Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <select
                  className="border border-gray-300 p-2 rounded"
                  value={newButton.type}
                  onChange={(e) =>
                    setNewButton({ ...newButton, type: e.target.value })
                  }
                >
                  <option value="URL">URL Button</option>
                  <option value="PHONE_NUMBER">Call Button</option>
                  <option value="QUICK_REPLY">Quick Reply</option>
                </select>

                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded"
                  placeholder="Button text"
                  value={newButton.text}
                  onChange={(e) =>
                    setNewButton({ ...newButton, text: e.target.value })
                  }
                  maxLength={20}
                />

                {newButton.type === "URL" && (
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded"
                    placeholder="URL"
                    value={newButton.url}
                    onChange={(e) =>
                      setNewButton({ ...newButton, url: e.target.value })
                    }
                  />
                )}

                {newButton.type === "PHONE_NUMBER" && (
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded"
                    placeholder="Phone number"
                    value={newButton.phone}
                    onChange={(e) =>
                      setNewButton({ ...newButton, phone: e.target.value })
                    }
                  />
                )}

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
                  onClick={handleAddButton}
                  disabled={
                    !newButton.text ||
                    (newButton.type === "URL" && !newButton.url) ||
                    (newButton.type === "PHONE_NUMBER" && !newButton.phone)
                  }
                >
                  Add Button
                </button>
              </div>

              {/* Display Added Buttons */}
              <div className="space-y-2">
                {templateButtons.map((button, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded"
                  >
                    <div>
                      <span className="font-medium">{button.type}: </span>
                      <span>{button.text}</span>
                      {button.url && (
                        <span className="text-blue-600 ml-2">
                          → {button.url}
                        </span>
                      )}
                      {button.phone && (
                        <span className="text-green-600 ml-2">
                          📞 {button.phone}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveButton(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Replies Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Quick Replies (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Add up to 3 quick reply buttons
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
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
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
                onClick={handleSubmit}
                disabled={
                  isSubmitting || (formData.type === "MEDIA" && !mediaId)
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Template"}
              </button>
            </div>
          </div>

          {/* Popups remain the same */}
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
                {/* Global Variables Section */}
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

                {/* Template Variables Section */}
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
        <Box
          flex={1}
          className="w-full mt-6 md:mt-0"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <WhatsAppPreview templateData={previewData} />
        </Box>
      </Box>
    </div>
  );
};

export default CreateTemplate;
