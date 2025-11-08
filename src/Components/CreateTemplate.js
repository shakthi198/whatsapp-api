// CreateTemplate.js (updated)
// NOTE: keep your existing imports at top (I kept them identical)
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiEndpoints from "../apiconfig";
import WhatsAppPreview from "./whatsapppreview";
import { Box, useMediaQuery, useTheme } from "@mui/material";
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

  // MUI theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const viewMode = location.state?.view || false;
  const isReadOnly = viewMode;
  const templateId = location.state?.id || null;
  const templateName = location.state?.name || "";

  const [templateBody, setTemplateBody] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAttributePopup, setShowAddAttributePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
    type: "name",
  });
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
  const [placeholderValues, setPlaceholderValues] = useState([]); // sample values for each {{n}}
  const [variableMeta, setVariableMeta] = useState([]);

  const [formData, setFormData] = useState({
    templateName: "",
    // categoryName: "",
    languageGuid: "",
    type: "TEXT",
    erpCategory: "",
    status: "Approved",
    createdOn: new Date().toLocaleString(),
    headerType: "text",
    headerText: "",
    templateCategory: "UTILITY", // UTILITY | AUTHENTICATION | MARKETING
  });

  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaId, setMediaId] = useState(null);
  // after variableMeta state
  const [sampleErrors, setSampleErrors] = useState({}); // { index: "error message" }

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [fetchedTemplate, setFetchedTemplate] = useState(null);

  // Category-specific restrictions
  const CATEGORY_RULES = {
    UTILITY: {
      allowMedia: false,
      allowButtons: true,
      allowQuickReplies: true,
      allowedTypes: ["TEXT"],
      allowHeader: true,
      allowFooter: true,
    },
    AUTHENTICATION: {
      allowMedia: false,
      allowButtons: false,
      allowQuickReplies: false,
      allowedTypes: ["TEXT"],
      allowHeader: false,
      allowFooter: false,
    },
    MARKETING: {
      allowMedia: true,
      allowButtons: true,
      allowQuickReplies: true,
      allowedTypes: ["TEXT", "MEDIA"],
      allowHeader: true,
      allowFooter: true,
    },
  };

  // ✅ Global variables available in all templates
  const GLOBAL_ATTRIBUTES = [
    { name: "name", value: "user name" },
    { name: "date", value: "meet date" },
  ];


  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        console.log("📡 Fetching template details for:", templateId);
        const res = await fetch(`${apiEndpoints.managetemplate}?templateId=${templateId}`);
        const data = await res.json();

        if (data.status === "success" && data.data) {
          const t = data.data;

          // Extract header, body, footer, and buttons from Meta components
          const headerComp = t.components?.find((c) => c.type === "HEADER");
          const bodyComp = t.components?.find((c) => c.type === "BODY");
          const footerComp = t.components?.find((c) => c.type === "FOOTER");
          const buttonsComp = t.components?.find((c) => c.type === "BUTTONS");

          // Try to match the language returned by API with your dropdown list
          const langCode = (t.language || "").toLowerCase();
          const langName = (t.language_name || "").toLowerCase();

          // Find matching language in your fetched list
          let matchedLang = null;
          if (languages && languages.length > 0) {
            matchedLang = languages.find(
              (l) =>
                l.code.toLowerCase() === langCode ||
                l.name.toLowerCase() === langName
            );
          }

          // Set form data with correct mapping
          setFormData((prev) => ({
            ...prev,
            templateName: t.name || "",
            templateCategory: t.category || "UTILITY",
            languageGuid: matchedLang?.guid || "",
            languageName: matchedLang?.name || t.language_name || t.language || "English",
            type: headerComp?.format ? "MEDIA" : "TEXT",
            headerType: (headerComp?.format || "text").toLowerCase(),
            headerText: headerComp?.text || "",
          }));



          setTemplateBody(bodyComp?.text || "");
          setTemplateFooter(footerComp?.text || "");

          // Handle variables (examples)
          if (bodyComp?.example?.body_text?.[0]) {
            const samples = bodyComp.example.body_text[0];
            setPlaceholderValues(samples);
            setVariableMeta(
              samples.map((s, i) => ({
                placeholder: `{{${i + 1}}}`,
                sample: s,
                type: "text",
              }))
            );
          }

          // Handle buttons (if any)
          if (buttonsComp?.buttons?.length) {
            setTemplateButtons(
              buttonsComp.buttons.map((b) => ({
                type: b.type,
                text: b.text,
                url: b.url || "",
                phone: b.phone_number || "",
              }))
            );
          }

          setFetchedTemplate({
            headerType: headerComp?.format?.toLowerCase() || "text",
            headerText: headerComp?.text || "",
            body: bodyComp?.text || "",
            footer: footerComp?.text || "",
            quickReplies: [],
            templateButtons:
              buttonsComp?.buttons?.map((b) => ({
                type: b.type,
                text: b.text,
                url: b.url || "",
                phone: b.phone_number || "",
              })) || [],
            mediaType:
              headerComp?.format?.toLowerCase() === "image" ||
                headerComp?.format?.toLowerCase() === "video"
                ? headerComp.format.toLowerCase()
                : "",
            mediaFile: null,
            mediaUrl: "",
          });


          toast.success(`Template "${t.name}" loaded successfully!`);
        } else {
          toast.error(data.message || "Failed to load template details");
        }
      } catch (err) {
        console.error("❌ Fetch template details error:", err);
        toast.error("Error fetching template details");
      }
    };

    if (viewMode && templateId) {
      fetchTemplateDetails();
    }
  }, [viewMode, templateId]);

  useEffect(() => {
    if (viewMode && languages.length && formData.languageName && !formData.languageGuid) {
      const matchedLang = languages.find(
        (l) =>
          l.name.toLowerCase() === formData.languageName.toLowerCase() ||
          l.code.toLowerCase() === formData.languageName.toLowerCase()
      );
      if (matchedLang) {
        setFormData((prev) => ({
          ...prev,
          languageGuid: matchedLang.guid,
        }));
      }
    }
  }, [languages, formData.languageName, viewMode]);


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
              code: lang.code,
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

  // When templateCategory changes, enforce rules (hide/clear fields)
  useEffect(() => {
    const rules =
      CATEGORY_RULES[formData.templateCategory] || CATEGORY_RULES.UTILITY;

    // if category doesn’t allow media and current type is MEDIA => switch to TEXT
    if (!rules.allowMedia && formData.type === "MEDIA") {
      setFormData((prev) => ({ ...prev, type: "TEXT" }));
      setMediaFile(null);
      setMediaId(null);
      setMediaType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // Clear header/footer/buttons/quickReplies if not allowed
    if (!rules.allowHeader) {
      setFormData((prev) => ({ ...prev, headerType: "text", headerText: "" }));
    }
    if (!rules.allowFooter) {
      setTemplateFooter("");
    }
    if (!rules.allowButtons) {
      setTemplateButtons([]);
    }
    if (!rules.allowQuickReplies) {
      setQuickReplies([]);
    }

    // If category is AUTHENTICATION, ensure body contains a single placeholder
    if (formData.templateCategory === "AUTHENTICATION") {
      let b = templateBody || "";
      // If there's any placeholder, reduce all placeholders to a single {{1}}
      if (/\{\{[^}]+\}\}/.test(b)) {
        // replace every placeholder with {{1}} and keep only one occurrence
        b = b.replace(/\{\{[^}]+\}\}/g, "{{1}}");
        // if multiple, collapse them to single {{1}} (keep first)
        b = b.replace(/(\{\{1\}\})+/g, "{{1}}");
      } else {
        // no placeholder: insert default OTP placeholder
        b = "Your OTP is {{1}}";
      }
      setTemplateBody(b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.templateCategory]);

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
    setNewAttribute({ name: "", value: "", type: "name" });
    setShowAddAttributePopup(true);
  };

  const handleCloseAddPopup = () => setShowAddAttributePopup(false);

  const handleSaveAttribute = () => {
    const name = (newAttribute.name || "").trim();
    if (!name) {
      toast.error("Attribute name required");
      return;
    }
    if (attributes.some((a) => a.name === name)) {
      toast.error("Attribute name already exists");
      return;
    }

    setAttributes((prev) => [
      ...prev,
      {
        name,
        value: newAttribute.value || "",
        type: newAttribute.type || "name",
      },
    ]);
    setNewAttribute({ name: "", value: "", type: "name" });
    setShowAddAttributePopup(false);
  };

  const insertPlaceholderValue = (arg) => {
    // Build attribute object: accept index, object or string
    let attrObj = null;
    if (typeof arg === "number") {
      attrObj = attributes[arg] ?? { name: "", value: "", type: "text" };
    } else if (
      typeof arg === "object" &&
      arg !== null &&
      arg.hasOwnProperty("name")
    ) {
      attrObj = arg;
    } else if (typeof arg === "string") {
      // global attribute sample passed as string
      attrObj = { name: "", value: arg, type: "name" };
    } else {
      attrObj = { name: "", value: `Sample`, type: "text" };
    }

    // AUTHENTICATION: only one placeholder allowed
    if (
      formData.templateCategory === "AUTHENTICATION" &&
      placeholderValues.length >= 1
    ) {
      toast.error(
        "Authentication templates allow only one placeholder ({{1}})"
      );
      return;
    }

    const placeholderNumber = placeholderValues.length + 1;
    const placeholder = `{{${placeholderNumber}}}`;

    // Insert placeholder at caret position if textareaRef available
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const before = templateBody.slice(0, start);
      const after = templateBody.slice(end);
      const newBody = before + placeholder + after;
      setTemplateBody(newBody);

      // Put caret after inserted placeholder
      setTimeout(() => {
        el.focus();
        const pos = start + placeholder.length;
        el.selectionStart = el.selectionEnd = pos;
      }, 0);
    } else {
      setTemplateBody((prev) =>
        prev ? prev + " " + placeholder : placeholder
      );
    }

    // Save sample & metadata
    const sample = attrObj?.value || `Sample ${placeholderNumber}`;
    setPlaceholderValues((prev) => [...prev, sample]);
    setVariableMeta((prev = []) => [
      ...prev,
      {
        placeholder,
        name: attrObj?.name || "",
        sample,
        type: attrObj?.type || "text",
      },
    ]);
  };

  const handleBodyChange = (text) => {
    const nonNumericRegex = /\{\{\s*([^\d\}][^}]*)\s*\}\}/g;
    let metaAdded = [];
    let newText = text.replace(nonNumericRegex, (_, inner) => {
      const placeholderNumber = placeholderValues.length + metaAdded.length + 1;
      const placeholder = `{{${placeholderNumber}}}`;
      metaAdded.push({
        placeholder,
        sample: inner.trim(),
        name: "",
        type: "text",
      });
      return placeholder;
    });

    // ✅ Live validation: variable cannot be at start or end
    const startsWithVariable = /^\s*\{\{\d+\}\}/.test(newText);
    const endsWithVariable = /\{\{\d+\}\}\s*$/.test(newText);
    if (startsWithVariable || endsWithVariable) {
      toast.error(
        startsWithVariable
          ? "Variable cannot be at the start of the message body."
          : "Variable cannot be at the end of the message body."
      );
    }

    setTemplateBody(newText);

    if (metaAdded.length) {
      setPlaceholderValues((prev) => [
        ...prev,
        ...metaAdded.map((m) => m.sample),
      ]);
      setVariableMeta((prev = []) => [...prev, ...metaAdded]);
      toast.info("Converted named placeholders to numeric placeholders.");
    }
  };


  // 🧹 Keep variable samples & names in sync with placeholders
  useEffect(() => {
    // Extract placeholders from the current body text
    const matches = templateBody.match(/\{\{\d+\}\}/g) || [];
    const uniquePlaceholders = [...new Set(matches)];

    // Cleanup placeholderValues (samples)
    setPlaceholderValues((prev) => {
      // Keep only as many samples as we have placeholders
      const next = prev.slice(0, uniquePlaceholders.length);
      // Add empty slots for new placeholders (if added)
      while (next.length < uniquePlaceholders.length) {
        next.push("");
      }
      return next;
    });

    // Cleanup variableMeta (samples + names)
    setVariableMeta((prev) => {
      const next = prev.slice(0, uniquePlaceholders.length);
      // Add any missing placeholder metadata
      while (next.length < uniquePlaceholders.length) {
        const index = next.length + 1;
        next.push({
          placeholder: `{{${index}}}`,
          name: "",
          sample: "",
          type: "text",
        });
      }
      // Update placeholder numbers in case you changed order
      return next.map((m, i) => ({
        ...m,
        placeholder: `{{${i + 1}}}`,
      }));
    });
  }, [templateBody]);

  const getPreviewBody = () => {
    if (!templateBody) return "";
    return templateBody.replace(/\{\{(\d+)\}\}/g, (match, g1) => {
      const idx = parseInt(g1, 10) - 1;
      const sample = placeholderValues[idx];
      if (
        sample !== undefined &&
        sample !== null &&
        String(sample).trim() !== ""
      ) {
        return String(sample);
      }
      return match; // fallback leave placeholder visible
    });
  };

  const handleDelete = (index) => {
    // If attribute has been used to create placeholders (present in variableMeta by name/value),
    // prevent deletion to avoid mismatch between templateBody and placeholderValues.
    const attr = attributes[index];
    const used = variableMeta.some(
      (v) => v.name === attr?.name || v.sample === attr?.value
    );
    if (used) {
      toast.error(
        "This attribute is used in the template. Remove placeholder from body first."
      );
      return;
    }
    setAttributes((prev) => prev.filter((_, i) => i !== index));
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
      const form = new FormData();
      form.append("media_file", file);

      const response = await fetch(apiEndpoints.managetemplate, {
        method: "POST",
        body: form,
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
  const gatherMatches = (text) => (text || "").match(/\{\{\d+\}\}/g) || [];

  const bodyMatches = gatherMatches(templateBody);
  const headerMatches = gatherMatches(formData.headerText);
  const footerMatches = gatherMatches(templateFooter);

  // combine and unique by placeholder text in order of appearance (left-to-right)
  const allMatches = [...bodyMatches, ...headerMatches, ...footerMatches];
  const uniquePlaceholders = [...new Set(allMatches)];

  const validateSamplesBeforeSubmit = () => {
    const placeholderMatches = (templateBody || "").match(/\{\{\d+\}\}/g) || [];
    const uniquePlaceholders = [...new Set(placeholderMatches)];
    const errs = {};

    for (let i = 0; i < uniquePlaceholders.length; i++) {
      const sample = (placeholderValues[i] || "").toString().trim();
      if (!sample) {
        errs[i] = `Please enter sample content for ${uniquePlaceholders[i]}`;
      } else if (sample.length > 512) {
        errs[i] = `Sample too long for ${uniquePlaceholders[i]}`;
      }
    }

    setSampleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateWhatsAppTemplate = () => {
    // Template Name
    const nameRegex = /^[a-z0-9_]+$/;
    if (!formData.templateName || !nameRegex.test(formData.templateName)) {
      throw new Error(
        "Template name must contain only lowercase letters, numbers, and underscores."
      );
    }

    // Body Text
    const body = templateBody.trim();
    if (!body) throw new Error("Template body cannot be empty.");
    if (body.length > 1024)
      throw new Error("Template body exceeds 1024 characters.");
    if (body.includes("http://") || body.includes("https://")) {
      throw new Error(
        "Body text cannot contain URLs. Use a URL button instead."
      );
    }

    // Placeholders
    const placeholderMatches = body.match(/\{\{\d+\}\}/g) || [];
    const uniquePlaceholders = [...new Set(placeholderMatches)];
    // Ensure sample present for every placeholder
    if (uniquePlaceholders.length > 0) {
      if (placeholderValues.length < uniquePlaceholders.length) {
        throw new Error(
          "Please add sample text for each variable in Variable Samples."
        );
      }
      for (let i = 0; i < uniquePlaceholders.length; i++) {
        if (!placeholderValues[i] || placeholderValues[i].trim() === "") {
          throw new Error(`Please provide sample for ${uniquePlaceholders[i]}`);
        }
      }
    }

    if (formData.templateCategory === "AUTHENTICATION") {
      if (uniquePlaceholders.length !== 1)
        throw new Error(
          "Authentication templates must contain exactly one placeholder {{1}}."
        );
    } else {
      // Sequential check
      for (let i = 0; i < uniquePlaceholders.length; i++) {
        if (uniquePlaceholders[i] !== `{{${i + 1}}}`)
          throw new Error(
            `Placeholders must be sequential starting from {{1}} without skipping numbers.`
          );
      }
    }

    // Header
    if (showHeader && formData.headerType === "text") {
      if (formData.headerText.length > 60)
        throw new Error("Header text cannot exceed 60 characters.");
    }

    // Footer
    if (showFooter && templateFooter.length > 60)
      throw new Error("Footer text cannot exceed 60 characters.");

    // Buttons
    if (templateButtons.length > 3)
      throw new Error("Maximum of 3 buttons allowed.");
    const urlButtons = templateButtons.filter((b) => b.type === "URL");
    if (urlButtons.length > 1)
      throw new Error("Only one URL button is allowed.");
    const callButtons = templateButtons.filter(
      (b) => b.type === "PHONE_NUMBER"
    );
    if (callButtons.length > 1)
      throw new Error("Only one Call button is allowed.");
    templateButtons.forEach((b) => {
      if (b.text.length > 20)
        throw new Error("Button text cannot exceed 20 characters.");
    });

    // Quick replies
    if (quickReplies.length > 3)
      throw new Error("Maximum 3 quick replies allowed.");
    quickReplies.forEach((q) => {
      if (q.text.length > 20)
        throw new Error("Quick reply text cannot exceed 20 characters.");
    });

    // Media
    if (formData.type === "MEDIA") {
      if (!mediaId) throw new Error("Please upload a media file.");
      if (!showMediaSection)
        throw new Error("Media is not allowed for this category.");
    }
  };

  // Main submit handler - Only submits template data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // sanitize & normalize template name
    let sanitized = (formData.templateName || "").trim().toLowerCase();
    // replace invalid characters with underscore, collapse multiple underscores
    sanitized = sanitized
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    if (!sanitized) {
      toast.error(
        "Template name is required and must contain letters or numbers."
      );
      return;
    }
    const nameRegex = /^[a-z0-9_]+$/;
    if (!nameRegex.test(sanitized)) {
      toast.error(
        "Invalid template name after sanitization. Use only lowercase letters, numbers, and underscores."
      );
      return;
    }

    const rules =
      CATEGORY_RULES[formData.templateCategory] || CATEGORY_RULES.UTILITY;

    // Prevent media if not allowed
    if (formData.type === "MEDIA" && !rules.allowMedia) {
      toast.error(
        `${formData.templateCategory} templates cannot include media`
      );
      return;
    }

    // Prevent quick replies if not allowed
    if (!rules.allowQuickReplies && quickReplies.length > 0) {
      toast.error(
        `${formData.templateCategory} templates cannot have quick replies`
      );
      return;
    }

    if (isSubmitting) return;

    // Validate required fields
    const requiredFields = [
      "templateName",
      "templateCategory",
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
      if (!validateSamplesBeforeSubmit()) {
        toast.error("Please fill sample text for all variables.");
        setIsSubmitting(false);
        return;
      }

      // then run other template validations
      validateWhatsAppTemplate();
      const selectedLang = languages.find(
        (l) => l.guid === formData.languageGuid
      );
      const languageCode = selectedLang?.code || "en";

      // Prepare body text and placeholder normalization
      let bodyText = (templateBody || "").trim();

      // For AUTHENTICATION templates: only one numeric placeholder allowed -> ensure single {{1}}
      if (formData.templateCategory === "AUTHENTICATION") {
        if (!/\{\{[^}]+\}\}/.test(bodyText)) {
          bodyText = "Your OTP is {{1}}";
        } else {
          // normalize every placeholder to {{1}} and leave only one
          bodyText = bodyText.replace(/\{\{[^}]+\}\}/g, "{{1}}");
          bodyText = bodyText.replace(/(\{\{1\}\})+/g, "{{1}}");
        }
      } else {
        // For UTILITY/MARKETING: try to keep user placeholders but clean stray quotes
        bodyText = bodyText.replace(/\"+/g, '"').replace(/\r\n/g, " ").trim();
      }

      // Prepare template headers JSON
      let templateHeaders = {
        headerType: formData.headerType || "text",
        headerText: formData.headerText || "",
      };

      // If category forbids header, clear header
      if (!rules.allowHeader) {
        templateHeaders = { headerType: "text", headerText: "" };
      }

      const components = [];

      // HEADER
      if (showHeader && formData.headerText.trim()) {
        components.push({
          type: "HEADER",
          format: formData.headerType
            ? formData.headerType.toUpperCase()
            : "TEXT",
          text: formData.headerText.trim(),
        });
      }

      // BODY
      components.push({
        type: "BODY",
        text: bodyText,
      });

      // FOOTER
      if (showFooter && templateFooter.trim()) {
        components.push({
          type: "FOOTER",
          text: templateFooter.trim(),
        });
      }

      // BUTTONS
      if (showButtons && templateButtons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: templateButtons.map((b) => ({
            type: b.type,
            text: b.text,
            ...(b.url ? { url: b.url } : {}),
            ...(b.phone ? { phone: b.phone } : {}),
          })),
        });
      }

      // ✅ Final formatted JSON
      const templateData = {
        // Required by Meta and backend
        name: sanitized,
        language: languageCode, // for Meta submission
        category: formData.templateCategory, // readable category

        // ✅ Required by backend
        templateCategory: formData.templateCategory,
        languageGuid: formData.languageGuid,
        languageCode: languageCode,
        typeId: formData.type === "TEXT" ? 1 : 2,

        // Optional but consistent with backend expectations
        isFile: formData.type === "MEDIA" ? 1 : 0,
        body: bodyText,
        templateFooter: templateFooter || "",
        templateHeaders: JSON.stringify({
          headerType: formData.headerType,
          headerText: formData.headerText,
        }),
        quickReplies: JSON.stringify(quickReplies),
        templateButtons: JSON.stringify(templateButtons),
        variableSamples: JSON.stringify(
          variableMeta.length
            ? variableMeta.map((m, i) => ({
              placeholder: m.placeholder || `{{${i + 1}}}`,
              name: m.name || "",
              sample: m.sample || placeholderValues[i] || "",
              type: m.type || "text",
            }))
            : placeholderValues.map((v, i) => ({
              placeholder: `{{${i + 1}}}`,
              name: "",
              sample: v,
              type: "text",
            }))
        ),
        media_id: mediaId,
        components: components, // keep WhatsApp JSON
      };


      console.log("✅ Final WhatsApp Template JSON:", templateData);

      console.log("Submitting template with data:", templateData);

      // Submit template data
      const result = await submitTemplateToServer(templateData);

      toast.success("Template created successfully!");

      if (result.warning) {
        toast.warning(result.warning);
      }

      if (result.data?.meta_status === "FAILED") {
        toast.warning("Template saved locally but Meta submission failed");
      }

      navigate("/templates");
    } catch (error) {
      console.error("Template submission error:", error);
      toast.error(error.message || "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview data
  const previewData = viewMode && fetchedTemplate
    ? {
      headerType: fetchedTemplate.headerType,
      headerText: fetchedTemplate.headerText,
      body: fetchedTemplate.body,
      footer: fetchedTemplate.footer,
      quickReplies: fetchedTemplate.quickReplies,
      templateButtons: fetchedTemplate.templateButtons,
      mediaFile: fetchedTemplate.mediaFile,
      mediaType: fetchedTemplate.mediaType,
      mediaUrl: fetchedTemplate.mediaUrl,
      fileName: fetchedTemplate.fileName || "",
      templateType: formData.type,
    }
    : {
      headerType: formData.headerType,
      headerText: formData.headerText,
      body: getPreviewBody(),
      footer: templateFooter,
      quickReplies: quickReplies,
      templateButtons: templateButtons,
      mediaFile: mediaFile,
      mediaType: mediaType,
      mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : null,
      fileName: mediaFile ? mediaFile.name : "",
      templateType: formData.type,
    };


  // Helper booleans for UI visibility
  const currentRules =
    CATEGORY_RULES[formData.templateCategory] || CATEGORY_RULES.UTILITY;
  const showHeader = formData.type === "TEXT" && currentRules.allowHeader;
  const showFooter = currentRules.allowFooter;
  const showButtons = currentRules.allowButtons;
  const showMediaSection = formData.type === "MEDIA" && currentRules.allowMedia;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
      />
      <div
        className="min-h-screen bg-gray-50 p-4 md:p-6"
        style={{ fontFamily: "Montserrat" }}
      >
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={isMobile ? 3 : 2}
        >
          <Box sx={{ flex: 1, order: isMobile ? 1 : 0 }}>
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 w-full">
              <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">
                Create New Template
              </h1>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                    name="templateName"
                    placeholder="e.g., otp_verification"
                    value={formData.templateName}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  />
                </div>

                {/* <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
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
                </div> */}

                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                    name="languageGuid"
                    value={formData.languageGuid}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">Select language</option>
                    {languages.map((lang) => (
                      <option key={lang.guid} value={lang.guid}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Type
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="TEXT">Text</option>
                    <option value="MEDIA" disabled={!currentRules.allowMedia}>
                      Media
                    </option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Category
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                    name="templateCategory"
                    value={formData.templateCategory}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
              </div>

              {/* Media Section */}
              {showMediaSection && (
                <div className="mb-6 md:mb-8 p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg bg-blue-50">
                  <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
                    Media Upload *
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Media File
                      {mediaId && (
                        <span className="text-green-600 ml-2">✓ Uploaded</span>
                      )}
                      {isUploadingMedia && (
                        <span className="text-yellow-600 ml-2">
                          Uploading...
                        </span>
                      )}
                    </label>
                    {!mediaFile ? (
                      <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 md:p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <FaUpload className="mx-auto text-2xl md:text-3xl text-gray-400 mb-2 md:mb-3" />
                        <p className="text-gray-600 mb-2 text-sm md:text-base">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          Supported formats: Images, Videos, Documents, Audio
                          (Max 10MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleMediaUpload}
                          accept="image/*,video/*,.pdf,.doc,.docx,.txt,audio/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploadingMedia || isReadOnly}
                        />
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 md:p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            {getMediaIcon()}
                            <div>
                              <p className="font-medium text-gray-800 text-sm md:text-base">
                                {mediaFile.name}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB
                                • {mediaType}
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
                            className="p-1 md:p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500"
                            disabled={isUploadingMedia || isReadOnly}
                          >
                            <FaTimes className="text-lg" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Header Section (only if allowed) */}
              {showHeader && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">
                    Header
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Type
                      </label>
                      <select
                        className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                        name="headerType"
                        value={formData.headerType}
                        onChange={handleChange}
                        disabled={isReadOnly}
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
                        className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                        name="headerText"
                        placeholder="Header Text"
                        value={formData.headerText}
                        onChange={handleChange}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Body Section */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">
                  Body
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mb-3">
                  Make your messages personal using variables and get more
                  replies!
                </p>

                <button
                  className={`border border-yellow-500 text-yellow-500 px-3 md:px-4 py-2 rounded mb-3 text-sm md:text-base ${isReadOnly
                    ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300"
                    : "hover:bg-yellow-50"
                    }`}
                  onClick={() => !isReadOnly && setShowPopup(true)}
                  disabled={isReadOnly}
                >
                  Add Variable
                </button>


                <div className="border border-gray-300 rounded-md p-3 md:p-4">
                  <textarea
                    ref={textareaRef}
                    placeholder="Template Body"
                    className="w-full h-32 md:h-40 border-none outline-none resize-none text-sm md:text-base"
                    value={templateBody}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <p className="text-right text-xs md:text-sm text-gray-500 mt-1">
                  {templateBody.length}/1024 characters
                </p>
              </div>
              {/* Variable Samples Section */}
              {(placeholderValues.length > 0 ||
                (variableMeta && variableMeta.length > 0)) && (
                  <div className="mt-4 border-t pt-3">
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-2">
                      Variable Samples
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Enter sample content and type for each variable. These
                      samples are required by Meta for review.
                    </p>

                    {Array.from({
                      length: Math.max(
                        placeholderValues.length,
                        variableMeta.length || 0
                      ),
                    }).map((_, i) => {
                      const sample =
                        placeholderValues[i] ?? variableMeta[i]?.sample ?? "";
                      const meta = variableMeta[i] ?? {};
                      return (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <div className="w-20 text-xs md:text-sm font-mono text-gray-700">
                            {`{{${i + 1}}}`}
                          </div>
                          <input
                            type="text"
                            className={`border rounded p-2 flex-1 text-sm md:text-base ${sampleErrors[i]
                              ? "border-red-500"
                              : "border-gray-300"
                              }`}
                            placeholder={`Enter sample for {{${i + 1}}}`}
                            value={sample}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const v = e.target.value;
                              const currentType = variableMeta[i]?.type || "name";
                              let errorMsg = "";

                              // ✅ Type-based validation
                              if (currentType === "number") {
                                if (v && !/^\d+$/.test(v.trim())) {
                                  errorMsg =
                                    "Sample value must be numeric for type 'number'.";
                                }
                              } else if (currentType === "name") {
                                if (v && /\d/.test(v.trim())) {
                                  errorMsg =
                                    "Sample value must not contain numbers for type 'name'.";
                                }
                              }

                              if (errorMsg) {
                                toast.error(errorMsg);
                              }

                              setPlaceholderValues((prev) => {
                                const next = [...prev];
                                next[i] = v;
                                return next;
                              });

                              setVariableMeta((prev = []) => {
                                const next = [...prev];
                                next[i] = { ...(next[i] || {}), sample: v };
                                return next;
                              });

                              setSampleErrors((prev) => {
                                const next = { ...prev };
                                if (errorMsg) {
                                  next[i] = errorMsg;
                                } else {
                                  delete next[i];
                                }
                                return next;
                              });
                            }}
                          />
                          {sampleErrors[i] && (
                            <div className="text-xs text-red-600 mt-1">
                              {sampleErrors[i]}
                            </div>
                          )}

                          <select
                            className="border border-gray-300 rounded p-2 text-sm"
                            value={meta.type || "name"}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              const typ = e.target.value;
                              setVariableMeta((prev = []) => {
                                const next = [...prev];
                                next[i] = { ...(next[i] || {}), type: typ };
                                return next;
                              });
                            }}
                          >
                            <option value="name">Name</option>
                            <option value="number">Number</option>
                            <option value="text">Text</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Template Buttons Section (only if allowed) */}
              {showButtons && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">
                    Template Buttons (Optional)
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-3">
                    Add buttons for URL, Phone, or Quick Reply actions
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <select
                      className="border border-gray-300 p-2 rounded text-sm md:text-base col-span-1 md:col-span-1"
                      value={newButton.type}
                      disabled={isReadOnly}
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
                      className="border border-gray-300 p-2 rounded text-sm md:text-base col-span-1 md:col-span-1"
                      placeholder="Button text"
                      value={newButton.text}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        setNewButton({ ...newButton, text: e.target.value })
                      }
                      maxLength={20}
                    />

                    {newButton.type === "URL" && (
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded text-sm md:text-base col-span-1 md:col-span-1"
                        placeholder="URL"
                        value={newButton.url}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          setNewButton({ ...newButton, url: e.target.value })
                        }
                      />
                    )}

                    {newButton.type === "PHONE_NUMBER" && (
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded text-sm md:text-base col-span-1 md:col-span-1"
                        placeholder="Phone number"
                        value={newButton.phone}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          setNewButton({ ...newButton, phone: e.target.value })
                        }
                      />
                    )}

                    <button
                      className="bg-green-500 text-white px-3 md:px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 text-sm md:text-base col-span-1 md:col-span-1"
                      onClick={handleAddButton}
                      disabled={
                        !newButton.text ||
                        (newButton.type === "URL" && !newButton.url) ||
                        (newButton.type === "PHONE_NUMBER" && !newButton.phone || isReadOnly)
                      }
                    >
                      Add Button
                    </button>
                  </div>

                  <div className="space-y-2">
                    {templateButtons.map((button, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 p-2 md:p-3 rounded"
                      >
                        <div className="overflow-hidden">
                          <span className="font-medium text-xs md:text-sm">
                            {button.type}:{" "}
                          </span>
                          <span className="text-xs md:text-sm">
                            {button.text}
                          </span>
                          {button.url && (
                            <span className="text-blue-600 ml-1 md:ml-2 text-xs md:text-sm">
                              → {button.url}
                            </span>
                          )}
                          {button.phone && (
                            <span className="text-green-600 ml-1 md:ml-2 text-xs md:text-sm">
                              📞 {button.phone}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveButton(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {currentRules.allowQuickReplies && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">
                    Quick Replies (Optional)
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-3">
                    Add up to 3 quick reply buttons
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded flex-1 text-sm md:text-base"
                        placeholder="Quick reply text"
                        value={newQuickReply}
                        onChange={(e) => setNewQuickReply(e.target.value)}
                        maxLength={20}
                        disabled={isReadOnly}
                      />
                      <button
                        className="bg-yellow-500 text-white px-3 md:px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-300 text-sm md:text-base sm:w-auto w-full"
                        onClick={handleAddQuickReply}
                        disabled={
                          !newQuickReply.trim() || quickReplies.length >= 3 || isReadOnly
                        }
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, index) => (
                        <div
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full flex items-center gap-1 md:gap-2 text-xs md:text-sm"
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
                </div>
              )}

              {/* Footer */}
              {showFooter && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-800">
                    Template Footer (Optional)
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-3">
                    Footers are great to add any disclaimers (up to 60
                    characters).
                  </p>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full text-sm md:text-base"
                    placeholder="Template Footer"
                    value={templateFooter}
                    onChange={(e) => setTemplateFooter(e.target.value)}
                    maxLength={60}
                    disabled={isReadOnly}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
                {!isReadOnly && (
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400 text-sm md:text-base order-1 sm:order-2"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || (formData.type === "MEDIA" && !mediaId)
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Submit Template"}
                  </button>
                )}
              </div>
            </div>
          </Box>

          <Box flex={1} sx={{ order: isMobile ? 0 : 1 }}>
            <div className={isMobile ? "mb-4" : ""}>
              <WhatsAppPreview templateData={previewData} />
            </div>
          </Box>
        </Box>
      </div>

      {/* Popups (attributes, etc.) */}
      {showPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4 z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold">
                Select Attribute
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-lg md:text-xl font-bold"
              >
                X
              </button>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="🔍 Search attributes..."
                className="w-full sm:w-64 border p-2 rounded text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isReadOnly}
              />
              <button
                className="bg-[#D2B887] text-white py-2 px-3 md:px-4 rounded flex text-sm md:text-base w-full sm:w-auto justify-center mt-2 sm:mt-0 sm:ml-4"
                onClick={handleAddAttribute}
              >
                + Add Attribute
              </button>
            </div>

            <h3 className="font-semibold mt-4 text-sm md:text-base">
              Global Variables
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {GLOBAL_ATTRIBUTES.map((attr, index) => (
                <div
                  key={`global-${index}`}
                  className="flex items-center bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full border border-blue-400 cursor-pointer text-xs md:text-sm"
                  onClick={() =>
                    insertPlaceholderValue({
                      name: attr.name,
                      value: attr.value,
                      type: "name",
                    })
                  }
                >
                  {attr.name}: {attr.value}
                </div>
              ))}
            </div>

            <h3 className="font-semibold mt-4 text-sm md:text-base">
              Template Variables
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {attributes.map((attr, index) => (
                <div
                  key={`local-${index}`}
                  className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full cursor-pointer"
                  onClick={() => insertPlaceholderValue(index)}
                >
                  {attr.name}: {attr.value}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="ml-1 bg-white text-red-500 p-0.5 rounded-full text-xs"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div className="flex mt-4 items-center gap-2 justify-center">
              <button className="p-1 md:p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronLeft className="text-xl md:text-2xl" />
              </button>
              <button className="border border-yellow-600 px-3 md:px-4 py-1 md:py-2 rounded-md text-black font-medium text-sm md:text-base">
                1
              </button>
              <button className="p-1 md:p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronRight className="text-xl md:text-2xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAttributePopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4 z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-base md:text-lg font-semibold">
                Add User Attribute
              </h2>
              <button
                onClick={handleCloseAddPopup}
                className="text-lg md:text-xl"
              >
                &times;
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter Attribute Name"
                className="w-full border p-2 rounded mt-1 text-sm md:text-base"
                value={newAttribute.name}
                disabled={isReadOnly}
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
                className="w-full border p-2 rounded mt-1 text-sm md:text-base"
                value={newAttribute.value}
                disabled={isReadOnly}
                onChange={(e) =>
                  setNewAttribute({ ...newAttribute, value: e.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="border px-3 md:px-4 py-2 rounded text-sm md:text-base"
                onClick={handleCloseAddPopup}
              >
                Cancel
              </button>
              <button
                className="bg-[#D2B887] text-white px-3 md:px-4 py-2 rounded text-sm md:text-base"
                onClick={handleSaveAttribute}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTemplate;
