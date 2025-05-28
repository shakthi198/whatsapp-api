import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import MessagePopup from "./MessagePopup";

export default function SingleMsg() {
  const [campaignName, setCampaignName] = useState("CAMP-75206");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Single MSG", "Group", "CSV"];
  
  const currentPath = location.pathname;
  const activeTab = currentPath.includes("compose")
    ? "Single MSG"
    : currentPath.includes("group")
    ? "Group"
    : currentPath.includes("csv")
    ? "CSV"
    : "Single MSG";
  
  const handleTabClick = (tab) => {
    if (tab === "Single MSG") {
      navigate("/compose");
    } else if (tab === "CSV") {
      navigate("/csv");
    } else if (tab === "Group") {
      navigate("/group");
    }
  };

  const handleSelectTemplate = (template) => {
    setMessageContent(template.templateBody || template.content);
    setIsPopupOpen(false);
  };

  return (
    <div className="max-w-9xl mx-auto p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium mr-4">Compose Message</h1>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">|</span>
          <span className="text-yellow-600">Home</span>
          <span className="mx-1">›</span>
          <span className="text-yellow-600 font-medium">Compose Message</span>
        </div>
      </div>

      {/* Navigation Tabs - Positioned above white container */}
      <div className="">
        <nav className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus:outline-none ${
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
      <div className="bg-white rounded-b-lg shadow-md border border-gray-200 p-6">
        {/* Form Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Country Code</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="">Select</option>
                <option value="+91">India (+91)</option>
                <option value="+1">USA (+1)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Mobile Number</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter the Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Message Content</label>
            <textarea
              className="w-full p-3 border border-yellow-600 bg-gray-50 rounded-md h-40 cursor-pointer focus:ring-2 focus:ring-yellow-500"
              readOnly
              onClick={() => setIsPopupOpen(true)}
              value={messageContent}
              placeholder="Click to select a template"
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Campaign Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button className="px-6 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50">
              Clear
            </button>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-6 py-2 flex items-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Send Now
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      alert("Send Now Selected");
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => {
                      alert("Schedule Selected");
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50"
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
        <MessagePopup
          onClose={() => setIsPopupOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );
}