import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import MessagePopup from "./MessagePopup";

export default function GroupMsg() {
  const [campaignName, setCampaignName] = useState("CAMP-75206");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

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
    setMessageContent(template.templateBody || template.content || template.templatename);
    setIsPopupOpen(false);
  };

  return (
    <div className="max-w-9xl mx-auto p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Breadcrumb Header */}
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium mr-4">Compose Message</h1>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">|</span>
          <span className="text-yellow-600">Home</span>
          <span className="mx-1">›</span>
          <span className="text-yellow-600 font-medium">Compose Message</span>
        </div>
      </div>

      {/* Navigation Tabs - Moved above the white container */}
      <nav className=" ">
      
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

      {/* White Container */}
      <div className="bg-white rounded-b-lg shadow-md border border-gray-200 border-t-0 p-6">
        {/* Form Content */}
        <div className="space-y-6">
          {/* Contact Groups Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select from Contact Groups
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Please select</option>
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
              <option value="group3">Group 3</option>
            </select>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Message Content
            </label>
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
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Campaign Name
            </label>
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