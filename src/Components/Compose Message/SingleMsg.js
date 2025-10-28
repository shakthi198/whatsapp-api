import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import MessagePopup from "../MessagePopup";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
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

  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Single MSG", "Group", "CSV"];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentPath = location.pathname;
  const activeTab = currentPath.includes("compose")
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
    // Clear message content error when template is selected
    if (errors.messageContent) {
      setErrors(prev => ({ ...prev, messageContent: "" }));
    }
  };

  const handleClear = () => {
    setMessageContent("");
    setMobileNumber("");
    setCountryCode("");
    setSelectedTemplate(null);
    setErrors({});
  };

  const validateMobileNumber = (number) => {
    return /^\d*$/.test(number);
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    if (validateMobileNumber(value)) {
      setMobileNumber(value);
      // Clear mobile number error when user types
      if (errors.mobileNumber) {
        setErrors(prev => ({ ...prev, mobileNumber: "" }));
      }
    }
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
    // Clear country code error when user selects
    if (errors.countryCode) {
      setErrors(prev => ({ ...prev, countryCode: "" }));
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    if (!countryCode) {
      newErrors.countryCode = "Country code is required";
    }

    if (!mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!messageContent) {
      newErrors.messageContent = "Message content is required";
    } else if (messageContent.length > 160) {
      newErrors.messageContent = "Message content cannot exceed 160 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to get WhatsApp API credentials
  const getWhatsAppCredentials = async () => {
    try {
      const response = await fetch(apiEndpoints.apiurl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch WhatsApp credentials");
      }

      const data = await response.json();
      
      if (data.status === "success") {
        return data.data;
      } else {
        throw new Error("Failed to load WhatsApp credentials");
      }
    } catch (error) {
      console.error("Error fetching WhatsApp credentials:", error);
      throw error;
    }
  };

  // Function to send WhatsApp message
  const sendWhatsAppMessage = async (credentials, isScheduled = false) => {
    try {
      debugger
      const fullPhoneNumber = countryCode + mobileNumber;
      
      // Prepare the request body for WhatsApp API
      // const requestBody = {
      //   messaging_product: "whatsapp",
      //   to: fullPhoneNumber,
      //   type: "text",
      //   text: {
      //     body: messageContent
      //   }
      // };

      // If using template instead of text message, use this structure:
      const requestBody = {
        messaging_product: "whatsapp",
        to: fullPhoneNumber,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      };

      const response = await fetch(
        `${credentials.base_url}${credentials.number_id}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${credentials.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to send message");
      }

      return result;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  };

  // Function to store message response in your database
  const storeMessageResponse = async (whatsappResponse, isScheduled = false) => {
  try {
    const storeResponse = await fetch(apiEndpoints.fetchmessage, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: countryCode + mobileNumber,
        country_code: countryCode,
        mobile_number: mobileNumber,
        message_content: messageContent,
        template_used: selectedTemplate?.name || null,
        template_id: selectedTemplate?.meta_template_id || null,
        whatsapp_message_id: whatsappResponse.messages?.[0]?.id,
        status: isScheduled ? "scheduled" : "sent",
        message_type: selectedTemplate ? "template" : "text",
        response_data: whatsappResponse,
        sent_at: new Date().toISOString()
      }),
    });

    const result = await storeResponse.json();
    
    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message || "Failed to store message");
    }
  } catch (error) {
    console.error("Error storing message response:", error);
    return null;
  }
};

  const handleSendMessage = async (isScheduled = false) => {
    if (!validateForm()) {
      setIsDropdownOpen(false);
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Get WhatsApp credentials
      const credentials = await getWhatsAppCredentials();
      
      // Step 2: Send WhatsApp message
      const whatsappResponse = await sendWhatsAppMessage(credentials, isScheduled);
      
      // Step 3: Store the response in your database
      await storeMessageResponse(whatsappResponse, isScheduled);
      
      // Step 4: Show success message
      alert(`Message ${isScheduled ? 'scheduled' : 'sent'} successfully!`);
      
      // Step 5: Clear form if it's not scheduled
      if (!isScheduled) {
        handleClear();
      }
      
    } catch (error) {
      console.error("Error in sending message:", error);
      alert(`Failed to ${isScheduled ? 'schedule' : 'send'} message: ${error.message}`);
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSendNow = () => {
    handleSendMessage(false);
  };

  const handleSchedule = () => {
    handleSendMessage(true);
  };

  const handleSendButtonClick = () => {
    // First validate the form when main button is clicked
    if (!validateForm()) {
      setIsDropdownOpen(false);
      return;
    }
    
    // If validation passes, open dropdown
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div
      className="max-w-7xl mx-auto p-4 md:p-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
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
      
      {/* Navigation Tabs */}
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

      {/* White Container */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        {/* Form Content */}
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700">
                Country Code
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className={`w-full p-2 md:p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                  errors.countryCode ? "border-red-500" : "border-gray-300"
                }`}
                value={countryCode}
                onChange={handleCountryCodeChange}
                required
              >
                <option value="">Select Country</option>
                <option value="+91">India (+91)</option>
                <option value="+1">USA (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+971">UAE (+971)</option>
                <option value="+65">Singapore (+65)</option>
                <option value="+60">Malaysia (+60)</option>
              </select>
              {errors.countryCode && (
                <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700">
                Mobile Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  className={`w-full p-2 md:p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base ${
                    errors.mobileNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter 10-digit number"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  maxLength="10"
                  required
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
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message Content
                <span className="text-red-500 ml-1">*</span>
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
              className={`w-full p-3 border bg-gray-50 rounded-md h-40 cursor-pointer focus:ring-2 focus:ring-yellow-500 text-sm md:text-base ${
                errors.messageContent ? "border-red-500" : "border-yellow-600"
              }`}
              readOnly
              onClick={() => setIsPopupOpen(true)}
              value={messageContent}
              placeholder="Click to select a template"
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Character count: {messageContent.length} (Max 160 characters)
              </p>
              {errors.messageContent && (
                <p className="text-red-500 text-xs">{errors.messageContent}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4">
            <button
              onClick={handleClear}
              className="px-4 py-2 md:px-6 md:py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Clear All
            </button>

            <div className="relative">
              <button
                onClick={handleSendButtonClick}
                className="w-full md:w-auto px-4 py-2 md:px-6 md:py-2 flex items-center justify-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!countryCode || !mobileNumber || !messageContent || loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    Send Now
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {isDropdownOpen && !loading && (
                <div className="absolute right-0 mt-1 w-full md:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleSendNow}
                    className="block w-full text-left px-4 py-2 md:py-3 text-gray-700 hover:bg-yellow-50 transition-colors"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={handleSchedule}
                    className="block w-full text-left px-4 py-2 md:py-3 text-gray-700 hover:bg-yellow-50 transition-colors"
                  >
                    Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Template Popup */}
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