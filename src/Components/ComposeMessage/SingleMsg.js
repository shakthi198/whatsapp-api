import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import MessagePopup from "./MessagePopup";
import { HiChevronRight } from "react-icons/hi";
import apiEndpoints from "../../apiconfig";

export default function SingleMsg() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Single MSG", "Group", "CSV"];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentPath = location.pathname;
  const activeTab =
    currentPath.includes("compose")
      ? "Single MSG"
      : currentPath.includes("group")
      ? "Group"
      : currentPath.includes("csv")
      ? "CSV"
      : "Single MSG";

  const handleTabClick = (tab) => {
    if (tab === "Single MSG") navigate("/compose");
    else if (tab === "CSV") navigate("/csv");
    else if (tab === "Group") navigate("/group");
  };

  const handleSelectTemplate = (template) => {
    setMessageContent(template.templateBody || template.content || "");
    setSelectedTemplate(template);
    setIsPopupOpen(false);

    // Extract variable placeholders like {{1}}, {{2}}, etc.
    const matches = (template.templateBody || "").match(/{{\d+}}/g) || [];
    const variableFields = matches.map((match) => ({
      placeholder: match,
      value: "",
      type: "text",
    }));

    setTemplateVariables(variableFields);

    if (errors.messageContent) {
      setErrors((prev) => ({ ...prev, messageContent: "" }));
    }
  };

  const handleClear = () => {
    setMessageContent("");
    setMobileNumber("");
    setCountryCode("");
    setSelectedTemplate(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!countryCode) newErrors.countryCode = "Country code is required";
    if (!mobileNumber) newErrors.mobileNumber = "Mobile number is required";
    else if (mobileNumber.length !== 10)
      newErrors.mobileNumber = "Mobile number must be 10 digits";

    if (!messageContent)
      newErrors.messageContent = "Message content is required";
    else if (messageContent.length > 160)
      newErrors.messageContent = "Message content cannot exceed 160 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendWhatsAppMessage = async (isScheduled = false) => {
    try {
      const fullPhoneNumber = countryCode + mobileNumber;

      if (!selectedTemplate) {
        alert("Please select a template before sending.");
        return;
      }

      console.log("selectedTemplate", selectedTemplate);

      const response = await fetch(apiEndpoints.sendmessage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: fullPhoneNumber,
          template_name: selectedTemplate.name,
          template_id: selectedTemplate.id,
          language: selectedTemplate.languageName || "en",
          variables: templateVariables.map((v) => v.value),
          header: selectedTemplate.header || null,
          buttons: selectedTemplate.buttons || [],
          message_content: messageContent, // added for storing message text
        }),
      });

      const result = await response.json();
      console.log("✅ Response from server:", result);

      if (result.status === "success") {
        alert("✅ Message sent & stored successfully!");
        handleClear();
      } else {
        console.error("❌ Error:", result);
        alert(`Failed: ${result.message || "Unable to send message"}`);
      }
    } catch (error) {
      console.error("❌ Exception:", error);
      alert("Something went wrong while sending the message.");
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSendMessage = async (isScheduled = false) => {
    if (!validateForm()) {
      setIsDropdownOpen(false);
      return;
    }

    if (templateVariables.some((v) => !v.value.trim())) {
      alert("Please fill in all variable values before sending.");
      return;
    }

    setLoading(true);
    await sendWhatsAppMessage(isScheduled);
  };

  return (
    <div className="width-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
          Compose Message
        </h2>
        <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
          <div className="flex items-center text-lg text-gray-600 flex-wrap gap-1">
            <span className="hidden md:inline">|</span>
          </div>
          <span className="whitespace-nowrap">Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="whitespace-nowrap">Compose Message</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex overflow-x-auto mb-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 md:px-6 md:py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Country and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Country Code<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 ${
                  errors.countryCode ? "border-red-500" : "border-gray-300"
                }`}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="">Select Country</option>
                <option value="+91">India (+91)</option>
                <option value="+1">USA (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+971">UAE (+971)</option>
              </select>
              {errors.countryCode && (
                <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Mobile Number<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  maxLength="10"
                  placeholder="Enter 10-digit number"
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 ${
                    errors.mobileNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {mobileNumber && (
                  <button
                    onClick={() => setMobileNumber("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Message Content<span className="text-red-500 ml-1">*</span>
              </label>
              {messageContent && (
                <button
                  onClick={() => setMessageContent("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <textarea
              readOnly
              onClick={() => setIsPopupOpen(true)}
              value={messageContent}
              placeholder="Click to select a template"
              className={`w-full p-3 border rounded-md h-40 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-yellow-500 ${
                errors.messageContent ? "border-red-500" : "border-yellow-600"
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Character count: {messageContent.length} / 160
            </p>
          </div>

          {/* Variables */}
          {selectedTemplate && templateVariables.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Variable Samples
              </h3>
              {templateVariables.map((variable, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border p-2 rounded-md bg-gray-50 mb-2"
                >
                  <span className="font-mono text-gray-700 w-16">
                    {variable.placeholder}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter sample value"
                    value={variable.value}
                    onChange={(e) => {
                      const updated = [...templateVariables];
                      updated[index].value = e.target.value;
                      setTemplateVariables(updated);
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Clear All
            </button>

            <div className="relative">
              <button
                onClick={() => handleSendMessage(false)}
                className="px-6 py-2 flex items-center justify-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition disabled:bg-gray-400"
                disabled={!countryCode || !mobileNumber || !messageContent || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Now
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
          <div className="w-full flex justify-center items-start mt-10 md:items-center">
            <MessagePopup
              onClose={() => setIsPopupOpen(false)}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
