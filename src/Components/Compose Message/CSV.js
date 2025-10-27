import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Upload, X } from "lucide-react";
import MessagePopup from "../MessagePopup";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
export default function SingleMsg() {
  const [campaignName, setCampaignName] = useState("CAMP-" + Math.floor(Math.random() * 100000));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Single MSG", "Group", "CSV"];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

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
    setMessageContent(template.templateBody || template.content || template.templatename);
    setIsPopupOpen(false);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 32 * 1024 * 1024) { // 32MB limit
        alert("File size exceeds 32MB limit");
        return;
      }
      if (!file.name.endsWith('.csv')) {
        alert("Please upload a CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleClear = () => {
    setMessageContent("");
    setSelectedGroup("");
    setSelectedCountry("");
    setSelectedNumber("");
    setSelectedFile(null);
    setCampaignName("CAMP-" + Math.floor(Math.random() * 100000));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
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
      <nav className="flex overflow-x-auto mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-yellow-600 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Form Container */}
      <div className="bg-white rounded-lg md:rounded-b-lg shadow-md border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Message Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Contact Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Select from Contact Groups
              </label>
              <select
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Please select</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
                <option value="group3">Group 3</option>
                <option value="group4">Group 4</option>
                <option value="group5">Group 5</option>
              </select>
            </div>

            {/* Message Content */}
            <div>
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message Content
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
                className="w-full p-3 border border-yellow-500 bg-gray-50 rounded-md h-40 cursor-pointer focus:ring-2 focus:ring-yellow-500 text-sm md:text-base"
                readOnly
                onClick={() => setIsPopupOpen(true)}
                value={messageContent}
                placeholder="Click to select a template"
              />
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-4 pt-2">
              <button
                onClick={handleClear}
                className="px-4 md:px-6 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Clear
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-auto px-4 md:px-6 py-2 flex items-center justify-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm md:text-base"
                >
                  Send Now
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-full md:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        alert("Send Now Selected");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 md:py-3 text-gray-700 hover:bg-yellow-50 text-sm md:text-base"
                    >
                      Send Now
                    </button>
                    <button
                      onClick={() => {
                        alert("Schedule Selected");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 md:py-3 text-gray-700 hover:bg-yellow-50 text-sm md:text-base"
                    >
                      Schedule
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Upload Section */}
          <div className="space-y-4 md:space-y-6">
            {/* Upload Header */}
            <div className="bg-green-50 border border-green-100 rounded-md p-3 text-center">
              <p className="text-xs md:text-sm text-yellow-600 font-medium">
                Upload <span className="font-bold">CSV only</span>, Max file
                size: <span className="font-bold">32 MB</span>
              </p>
            </div>

            {/* File Upload Frame */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-yellow-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label className="cursor-pointer w-full block">
                <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  <p className="text-xs md:text-sm text-gray-600">
                    {selectedFile ? (
                      <span className="font-medium text-green-600">
                        {selectedFile.name}
                      </span>
                    ) : (
                      "Drag & drop your file here or click to browse"
                    )}
                  </p>
                  <span className="text-xs text-gray-500">Supports: .csv</span>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center"
                    >
                      <X size={14} className="mr-1" /> Remove file
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Additional Fields */}
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Country Code
                </label>
                <select
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="+1">USA (+1)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+91">India (+91)</option>
                  <option value="+61">Australia (+61)</option>
                  <option value="+49">Germany (+49)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Mobile Number
                </label>
                <select
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                  value={selectedNumber}
                  onChange={(e) => setSelectedNumber(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="mobile">Mobile</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
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