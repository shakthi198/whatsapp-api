import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { HiChevronRight } from "react-icons/hi";
import MessagePopup from "./MessagePopup";
import apiEndpoints from "../../apiconfig";

export default function GroupMsg() {
  const [campaignName, setCampaignName] = useState("CAMP-" + Math.floor(Math.random() * 100000));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [groups, setGroups] = useState([]);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();
  const tabs = ["Single MSG", "Group", "CSV"];

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tabs
  const activeTab = location.pathname.includes("group")
    ? "Group"
    : location.pathname.includes("csv")
    ? "CSV"
    : "Single MSG";

  const handleTabClick = (tab) => {
    if (tab === "Single MSG") navigate("/compose");
    else if (tab === "CSV") navigate("/csv");
    else navigate("/group");
  };

  // Fetch all groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(apiEndpoints.getGroups);
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          setGroups(data.data);
        } else {
          console.warn("No groups found");
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, []);

  // Select template and extract variables {{1}}, {{2}}, etc.
  const handleSelectTemplate = (template) => {
    setMessageContent(template.templateBody || template.content || "");
    setSelectedTemplate(template);
    setIsPopupOpen(false);

    const matches = (template.templateBody || "").match(/{{\d+}}/g) || [];
    const variableFields = matches.map((match) => ({
      placeholder: match,
      value: "",
    }));
    setTemplateVariables(variableFields);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!selectedGroup) newErrors.group = "Please select a group";
    if (!selectedTemplate) newErrors.template = "Please select a template";
    if (!messageContent) newErrors.message = "Message cannot be empty";
    if (templateVariables.some((v) => !v.value.trim()))
      newErrors.variables = "Please fill all variable values";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear form
  const handleClear = () => {
    setMessageContent("");
    setSelectedGroup("");
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setErrors({});
    setProgress("");
    setCampaignName("CAMP-" + Math.floor(Math.random() * 100000));
  };

  // Send group message (via unified PHP)
  const handleSendMessage = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setProgress("Sending messages to group...");

    try {
      console.log("Sending to selectedTemplate:", selectedTemplate);
      const response = await fetch(apiEndpoints.sendmessage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: selectedGroup,
          template_name: selectedTemplate.name,
          template_id: selectedTemplate.id,
          language: selectedTemplate.languageName || "en",
          variables: templateVariables.map((v) => v.value),
          message_content: messageContent,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setProgress(
          `✅ ${result.summary.success} sent, ❌ ${result.summary.failed} failed.`
        );
        alert(
          `✅ ${result.summary.success} messages sent, ${result.summary.failed} failed.`
        );
      } else {
        alert(`❌ ${result.message}`);
        setProgress("Error sending messages.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending messages: " + error.message);
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="width-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
          Group Message
        </h2>
        <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span>Group Message</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex overflow-x-auto mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 md:px-6 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? "border-yellow-600 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        <div className="space-y-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Group
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Please select</option>
              {groups.map((group) => (
                <option key={group.id} value={group.groupname}>
                  {group.groupname} ({group.total_contacts || 0})
                </option>
              ))}
            </select>
            {errors.group && (
              <p className="text-red-500 text-xs mt-1">{errors.group}</p>
            )}
          </div>

          {/* Template Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message Template
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
              className="w-full p-3 border border-yellow-600 bg-gray-50 rounded-md h-40 cursor-pointer focus:ring-2 focus:ring-yellow-500"
              readOnly
              onClick={() => setIsPopupOpen(true)}
              value={messageContent}
              placeholder="Click to select a template"
            />
            {errors.template && (
              <p className="text-red-500 text-xs mt-1">{errors.template}</p>
            )}
          </div>

          {/* Variable Inputs */}
          {templateVariables.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Template Variables
              </h3>
              <div className="space-y-2">
                {templateVariables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">
                      {variable.placeholder}
                    </span>
                    <input
                      type="text"
                      value={variable.value}
                      onChange={(e) => {
                        const updated = [...templateVariables];
                        updated[index].value = e.target.value;
                        setTemplateVariables(updated);
                      }}
                      placeholder={`Value for ${variable.placeholder}`}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                ))}
              </div>
              {errors.variables && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.variables}
                </p>
              )}
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="p-2 text-sm bg-gray-50 border rounded text-gray-700">
              {progress}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>

            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              {loading ? "Sending..." : "Send Message"}
              <ChevronDown className="inline w-4 h-4 ml-2" />
            </button>
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
