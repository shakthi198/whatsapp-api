import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import MessagePopup from "./MessagePopup"; // Import MessagePopup

export default function SingleMsg() {
  
  const [campaignName, setCampaignName] = useState("CAMP-75206");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState(""); // Store selected template

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

  // Function to update message content
  const handleSelectTemplate = (template) => {
    setMessageContent(template.templateBody || template.content); // Use the correct property from the template
    setIsPopupOpen(false); // Close popup after selection
  };

  return (
    <div className="max-w-6xl mx-auto p-6 " style={{ fontFamily: "Montserrat" }}>
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold mr-4">Compose Message</h1>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">|</span>
          <span className="text-yellow-600">Home</span>
          <span className="mx-1">›</span>
          <span className="text-yellow-600 font-medium">Compose Message</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex justify-around border-b border-gray-300 w-90 mt-4 bg-white shadow-md rounded-lg p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === tab
                ? "border-yellow-600 text-yellow-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Form Section */}
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-md mt-2 rounded-lg border border-gray-300 ">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Country Code</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>Select</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Mobile Number</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter the Mobile Number"
            />
          </div>
        </div>

        {/* Message Content (Click to Open Popup) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Message Content</label>
          <textarea
            className="w-full p-2 border border-yellow-600 bg-gray-100 rounded-md h-32 cursor-pointer"
            readOnly
            onClick={() => setIsPopupOpen(true)} // Open Popup
            value={messageContent} // Display selected template
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Campaign Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md border border-gray-300">
            Clear
          </button>

          {/* Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 flex items-center bg-yellow-600 text-white rounded-md border border-gray-300"
            >
              Send Now
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <button
                  onClick={() => alert("Send Now Selected")}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-100"
                >
                  Send Now
                </button>
                <button
                  onClick={() => alert("Schedule Selected")}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-100"
                >
                  Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show MessagePopup and Pass handleSelectTemplate */}
      {isPopupOpen && (
        <MessagePopup
          onClose={() => setIsPopupOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );
}