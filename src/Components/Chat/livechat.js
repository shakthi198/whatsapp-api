import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaWhatsapp,
  FaRegCheckCircle,
  FaRegEye,
  FaRegHandPaper,
  FaArrowLeft,
} from "react-icons/fa";

const API_BASE = "http://localhost/phpValidation/whatsapp"; // ✅ adjust if needed

const LiveChatUI = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chats, setChats] = useState([]);
  const [messageText, setMessageText] = useState("");

  // ✅ Fetch chats (only contacts that have messages)
  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat_history.php`);
      const data = await res.json();
      if (data.status) {
        setChats(data.data || []); // ✅ fixed key
      }
    } catch (err) {
      console.error("Error loading chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // 📱 Detect mobile layout
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) setShowChat(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 💬 Fetch messages for selected contact
  const fetchMessages = async (contactId) => {
    try {
      const res = await fetch(`${API_BASE}/chat_messages.php?contact_id=${contactId}`);
      const data = await res.json();
      if (data.status) {
        setSelectedChat((prev) =>
          prev ? { ...prev, messages: data.data } : null
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // 👈 Select chat
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
    if (isMobileView) setShowChat(true);
  };

  // 🔙 Back in mobile
  const handleBackToChatList = () => {
    setShowChat(false);
    setSelectedChat(null);
  };

  // ✉️ Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    const payload = {
      mobile_number: selectedChat.mobile_number,
      message: messageText,
    };

    try {
      const res = await fetch(`${API_BASE}/send_message.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.status) {
        setMessageText("");
        fetchMessages(selectedChat.id); // reload messages
        fetchChats(); // update history list
      } else {
        console.error("Failed to send:", data.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 🧭 Auto refresh chat messages (like live)
  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => {
      fetchMessages(selectedChat.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // 🔍 Filter chats by search & read/unread
  const filteredChats = chats
    .filter((chat) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "unread") return chat.unread_count > 0;
      if (activeFilter === "read") return chat.unread_count === 0;
      return true;
    })
    .filter((chat) =>
      chat.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 🧱 Chat List UI
  const ChatList = () => (
    <div className="w-full xl:w-96 lg:w-70 bg-white border-r border-gray-200 flex flex-col min-h-[300px] h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            WhatsApp Inbox
          </h2>
          <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 md:mt-0">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Live
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaFilter className="text-sm" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap px-3 pt-2 pb-1 border-b border-gray-200 gap-1">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread", icon: <FaRegEye className="mr-1" /> },
          { id: "read", label: "Read", icon: <FaRegCheckCircle className="mr-1" /> },
          { id: "intervened", label: "Intervened", icon: <FaRegHandPaper className="mr-1" /> },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`flex items-center px-3 py-2 text-xs font-medium rounded-md ${
              activeFilter === id
                ? id === "unread"
                  ? "bg-blue-100 text-blue-800"
                  : id === "read"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat)}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChat?.id === chat.id ? "bg-yellow-50" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm text-gray-800 truncate">
                {chat.contact_name}
              </h3>
              <span className="text-xs text-gray-400">
                {chat.last_message_time || ""}
              </span>
            </div>
            <p className="text-xs mt-1 text-gray-600 truncate">
              {chat.last_message || "No messages yet"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // 💬 Chat View UI
  const ChatView = () => (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {selectedChat ? (
        <>
          <div className="p-3 border-b border-gray-200 bg-white flex items-center flex-shrink-0">
            {isMobileView && (
              <button
                onClick={handleBackToChatList}
                className="mr-3 p-1 hover:bg-gray-100 rounded-full"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
            )}
            <div className="truncate">
              <h3 className="text-sm font-semibold truncate">
                {selectedChat.contact_name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {selectedChat.country_code || ""} {selectedChat.mobile_number}
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] min-h-0 space-y-2">
            {(selectedChat.messages || []).map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.direction === "incoming" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-md text-sm ${
                    msg.direction === "incoming" ? "bg-white" : "bg-green-200"
                  }`}
                >
                  <div className="text-gray-800">{msg.message}</div>
                  <div className="text-gray-500 text-xs text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center"
              >
                <FaWhatsapp />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-4 text-center">
          <div className="bg-green-100 p-5 rounded-full mb-4">
            <FaWhatsapp className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            WhatsApp Communication Platform
          </h2>
          <p className="text-gray-500 text-sm mb-6 truncate">
            Select a chat to start messaging
          </p>
        </div>
      )}
    </div>
  );

  // 📱 Layout Switch
  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen bg-[#f5f5f5] font-['Montserrat']">
        {showChat ? <ChatView /> : <ChatList />}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f5f5f5] font-['Montserrat']">
      <ChatList />
      <ChatView />
    </div>
  );
};

export default LiveChatUI;
