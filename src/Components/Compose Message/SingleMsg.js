import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import MessagePopup from "../MessagePopup";

export default function SingleMsg() {
  const [campaignName, setCampaignName] = useState(`CAMP-${Math.floor(Math.random() * 100000)}`);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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
    setIsPopupOpen(false);
  };

  const handleClear = () => {
    setMessageContent("");
    setMobileNumber("");
    setCountryCode("");
    setCampaignName(`CAMP-${Math.floor(Math.random() * 100000)}`);
  };

  const validateMobileNumber = (number) => {
    // Basic validation - allow only numbers
    return /^\d*$/.test(number);
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    if (validateMobileNumber(value)) {
      setMobileNumber(value);
    }
  };

  return (
     <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h1 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Compose Message</h1>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Compose Message</span>
          </div>
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
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700">
                Mobile Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
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
              className="w-full p-3 border border-yellow-600 bg-gray-50 rounded-md h-40 cursor-pointer focus:ring-2 focus:ring-yellow-500 text-sm md:text-base"
              readOnly
              onClick={() => setIsPopupOpen(true)}
              value={messageContent}
              placeholder="Click to select a template"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Character count: {messageContent.length} (Max 160 characters)
            </p>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700">
              Campaign Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4">
            <button 
              onClick={handleClear}
              className="px-4 py-2 md:px-6 md:py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full md:w-auto px-4 py-2 md:px-6 md:py-2 flex items-center justify-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                disabled={!countryCode || !mobileNumber || !messageContent}
              >
                Send Now
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-full md:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      if (!countryCode || !mobileNumber || !messageContent) {
                        alert("Please fill all required fields");
                        return;
                      }
                      alert("Message sent successfully!");
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 md:py-3 text-gray-700 hover:bg-yellow-50 transition-colors"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => {
                      if (!countryCode || !mobileNumber || !messageContent) {
                        alert("Please fill all required fields");
                        return;
                      }
                      alert("Message scheduled successfully!");
                      setIsDropdownOpen(false);
                    }}
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