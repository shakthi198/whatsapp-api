import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { HiChevronRight } from "react-icons/hi";
import MessagePopup from "../MessagePopup";
import apiEndpoints from "../../apiconfig";

export default function GroupMsg() {
  const [campaignName, setCampaignName] = useState("CAMP-" + Math.floor(Math.random() * 100000));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Single MSG", "Group", "CSV"];

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // ✅ Fetch all group names on page load
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

  // 🔹 Fetch contacts in selected group
  const getGroupContacts = async (groupName) => {
    try {
      const res = await fetch(apiEndpoints.getGroups, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: groupName }),
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setContacts(data.data);
        return data.data;
      } else {
        setContacts([]);
        throw new Error("Failed to load contacts");
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      throw err;
    }
  };

  const handleSelectTemplate = (template) => {
    setMessageContent(template.templateBody || template.content || "");
    setSelectedTemplate(template);
    setIsPopupOpen(false);
  };

  const handleClear = () => {
    setMessageContent("");
    setSelectedGroup("");
    setContacts([]);
    setSelectedTemplate(null);
    setErrors({});
    setProgress("");
    setCampaignName("CAMP-" + Math.floor(Math.random() * 100000));
  };

  // Validate before sending
  const validateForm = () => {
    const newErrors = {};
    if (!selectedGroup) newErrors.group = "Please select a group";
    if (!selectedTemplate) newErrors.template = "Please select a template";
    if (!messageContent) newErrors.message = "Message content cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Fetch WhatsApp API credentials
  const getWhatsAppCredentials = async () => {
    try {
      const response = await fetch(apiEndpoints.apiurl);
      const data = await response.json();
      if (data.status === "success") return data.data;
      throw new Error("Failed to load WhatsApp credentials");
    } catch (error) {
      console.error("Error fetching credentials:", error);
      throw error;
    }
  };

  // 🔹 Build and send WhatsApp message dynamically
  const sendWhatsAppMessage = async (credentials, phoneNumber) => {
    try {
      if (!selectedTemplate) throw new Error("No template selected");

      // Parse template JSON
      let templateComponents;
      try {
        templateComponents = JSON.parse(selectedTemplate.template_json);
      } catch {
        throw new Error("Invalid template JSON");
      }

      // Build WhatsApp API components
      const processedComponents = [];
      if (templateComponents.components && Array.isArray(templateComponents.components)) {
        templateComponents.components.forEach((component) => {
          const { type } = component;
          const newComponent = { type };

          // Handle HEADER text/media
          if (type === "HEADER") {
            if (component.format === "TEXT" && component.example?.header_text?.length) {
              newComponent.parameters = [
                { type: "text", text: component.example.header_text[0] },
              ];
            } else if (component.format === "IMAGE" && component.example?.header_handle) {
              newComponent.parameters = [
                { type: "image", image: { link: component.example.header_handle } },
              ];
            }
          }

          // Handle BODY placeholders
          if (type === "BODY" && component.example?.body_text?.length) {
            newComponent.parameters = component.example.body_text[0].map((textValue) => ({
              type: "text",
              text: textValue,
            }));
          }

          // Handle BUTTONS (Quick Reply / URL)
          if (type === "BUTTONS" && Array.isArray(component.buttons)) {
            component.buttons.forEach((btn, index) => {
              const btnComponent = {
                type: "BUTTON",
                sub_type: btn.type === "URL" ? "URL" : "QUICK_REPLY",
                index: index.toString(),
                parameters: [],
              };

              if (btn.type === "URL" && btn.example?.length) {
                btnComponent.parameters.push({ type: "text", text: btn.example[0] });
              } else if (btn.type === "QUICK_REPLY") {
                btnComponent.parameters.push({
                  type: "payload",
                  payload: btn.text || `button_${index + 1}`,
                });
              }

              processedComponents.push(btnComponent);
            });
            return;
          }

          if (newComponent.parameters && newComponent.parameters.length > 0) {
            processedComponents.push(newComponent);
          }
        });
      }

      // Build final payload
      const requestBody = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateComponents.name || selectedTemplate.name,
          language: { code: templateComponents.language || "en" },
          ...(processedComponents.length > 0 ? { components: processedComponents } : {}),
        },
      };

      const response = await fetch(
        `${credentials.base_url}${credentials.number_id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Failed to send message");
      return result;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  };

  // 🔹 Store message in DB
  const storeMessageResponse = async (responseData, phoneNumber, isScheduled = false) => {
    try {
      const storeResponse = await fetch(apiEndpoints.fetchmessage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phoneNumber,
          country_code: phoneNumber.slice(0, 3),
          mobile_number: phoneNumber.replace(/^\+91/, ""),
          message_content: messageContent,
          template_used: selectedTemplate?.name || null,
          template_id: selectedTemplate?.meta_template_id || null,
          whatsapp_message_id: responseData.messages?.[0]?.id,
          status: isScheduled ? "scheduled" : "sent",
          message_type: "template",
          response_data: responseData,
          sent_at: new Date().toISOString(),
        }),
      });
      return await storeResponse.json();
    } catch (error) {
      console.error("Error storing message response:", error);
    }
  };

  // 🔹 Send to all group contacts
  const handleSendMessage = async (isScheduled = false) => {
    if (!validateForm()) return;

    setLoading(true);
    setProgress("Preparing to send group messages...");

    try {
      const credentials = await getWhatsAppCredentials();
      const contactsList = await getGroupContacts(selectedGroup);

      if (!contactsList.length) {
        alert("No contacts found in this group.");
        return;
      }

      let sentCount = 0;

      for (const contact of contactsList) {
        const fullNumber = contact.mobile_number.startsWith("+")
          ? contact.mobile_number
          : `+91${contact.mobile_number}`;

        try {
          const responseData = await sendWhatsAppMessage(credentials, fullNumber);
          await storeMessageResponse(responseData, fullNumber, isScheduled);
          sentCount++;
          setProgress(`✅ Sent to ${contact.mobile_number} (${sentCount}/${contactsList.length})`);
        } catch (err) {
          console.error("Send failed:", err);
          setProgress(`⚠️ Failed for ${contact.mobile_number}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      alert(`🎉 ${sentCount}/${contactsList.length} messages sent successfully.`);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSendNow = () => handleSendMessage(false);
  const handleSchedule = () => handleSendMessage(true);

  return (
    <div className="width-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">Group Message</h2>
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

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        <div className="space-y-6">
          {/* Group Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Select Group</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              value={selectedGroup}
              onChange={async (e) => {
                const groupName = e.target.value;
                setSelectedGroup(groupName);
                if (groupName) {
                  setProgress("Fetching contacts...");
                  await getGroupContacts(groupName);
                  setProgress("");
                } else setContacts([]);
              }}
            >
              <option value="">Please select</option>
              {groups.map((group) => (
                <option key={group.id} value={group.groupname}>
                  {group.groupname} ({group.total_contacts || 0})
                </option>
              ))}
            </select>
            {errors.group && <p className="text-red-500 text-xs mt-1">{errors.group}</p>}
          </div>

          {/* Contact Summary */}
          {contacts.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 border p-2 rounded">
              <strong>{contacts.length}</strong> contacts found in <strong>{selectedGroup}</strong>.
            </div>
          )}

          {/* Message Template */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Message Template</label>
              {messageContent && (
                <button onClick={() => setMessageContent("")} className="text-gray-400 hover:text-gray-600">
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
            {errors.template && <p className="text-red-500 text-xs mt-1">{errors.template}</p>}
          </div>

          {/* Progress */}
          {progress && (
            <div className="p-2 text-sm bg-gray-50 border rounded text-gray-700">{progress}</div>
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

            <div className="relative">
              <button
                onClick={() => {
                  if (validateForm()) setIsDropdownOpen(!isDropdownOpen);
                }}
                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
                <ChevronDown className="inline w-4 h-4 ml-2" />
              </button>

              {isDropdownOpen && !loading && (
                <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg">
                  <button
                    onClick={handleSendNow}
                    className="block w-full text-left px-4 py-2 hover:bg-yellow-50"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={handleSchedule}
                    className="block w-full text-left px-4 py-2 hover:bg-yellow-50"
                  >
                    Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
          <div className="w-full flex justify-center items-start mt-10 md:items-center">
            <MessagePopup onClose={() => setIsPopupOpen(false)} onSelectTemplate={handleSelectTemplate} />
          </div>
        </div>
      )}
    </div>
  );
}
