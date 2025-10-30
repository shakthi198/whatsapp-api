import React, { useState, useEffect } from "react";
import {
  FiSearch, FiFilter, FiMessageSquare, FiCheck, FiEye,
  FiUser, FiArrowLeft, FiArrowRight
} from "react-icons/fi";
import {
  BsWhatsapp, BsThreeDotsVertical, BsEmojiSmile,
  BsPaperclip, BsCheck2All
} from "react-icons/bs";

const HistoryLive = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // ✅ Fetch chat list from backend
  useEffect(() => {
    const checkScreen = () => setIsMobileView(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    fetch("http://localhost/phpValidation/whatsapp/chat_history.php")
      .then(res => res.json())
      .then(data => {
        if (data.status) setChats(data.data);
        else console.error("Error loading chats:", data.message);
      })
      .catch(err => console.error("Fetch error:", err));

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ Select a chat & fetch its messages
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetch(`http://localhost/phpValidation/whatsapp/chat_messages.php?contact_id=${chat.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) setMessages(data.data);
        else console.error("Error loading messages:", data.message);
      })
      .catch(err => console.error("Message fetch error:", err));

    if (isMobileView) setShowChat(true);
  };

  const handleBackToChatList = () => {
    setShowChat(false);
    setSelectedChat(null);
    setMessages([]);
  };

  // ✅ Filter chats
  const filteredChats = chats.filter(chat =>
    chat.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.mobile_number?.includes(searchQuery)
  );

  const filteredByTab = filteredChats.filter(chat => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return chat.unread_count > 0;
    if (activeTab === "read") return chat.unread_count === 0;
    return true;
  });

  // ✅ Chat List Panel
  const ChatList = () => (
    <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-semibold text-gray-800">WABA: 91938301443</h1>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-600">LIVE</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">Quality: <span className="text-green-600 font-medium">GREEN</span></div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chat"
            className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FiFilter />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 pb-2 border-b border-gray-200">
        {[
          { key: "all", label: "All", icon: <FiMessageSquare size={16} /> },
          { key: "unread", label: "Unread", icon: <FiEye size={16} /> },
          { key: "read", label: "Read", icon: <FiCheck size={16} /> }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center px-2 py-2 text-sm rounded-lg transition-all ${activeTab === key
                ? "bg-green-100 text-green-800 shadow-inner"
                : "text-gray-500 hover:bg-gray-100"
              }`}
          >
            <span className="mr-2">{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredByTab.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No chats found</div>
        ) : (
          filteredByTab.map(chat => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`p-3 border-b border-gray-200 cursor-pointer transition-all ${selectedChat?.id === chat.id ? "bg-green-50 border-l-4 border-green-400" : "hover:bg-gray-50"
                }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">{chat.contact_name || chat.mobile_number}</h3>
                <span className="text-xs text-gray-400">
                  {chat.last_message_time
                    ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className={`text-sm truncate w-4/5 ${chat.unread_count > 0 ? "text-gray-800 font-medium" : "text-gray-500"
                  }`}>
                  {chat.last_message || "No messages yet"}
                </p>
                {chat.unread_count > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-center text-sm text-gray-600 bg-white">
        WhatsApp Communication Platform Inbox
      </div>
    </div>
  );

  // ✅ Chat View Panel
  const ChatView = () => (
    <div className="flex-1 flex flex-col h-full">
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="p-3 border-b flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
              {isMobileView && (
                <button
                  onClick={handleBackToChatList}
                  className="mr-3 p-1 hover:bg-gray-100 rounded-full"
                >
                  <FiArrowLeft className="text-gray-600" size={20} />
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <FiUser className="text-gray-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{selectedChat.contact_name || selectedChat.mobile_number}</h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <BsThreeDotsVertical />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-[#e5ddd5] bg-opacity-30">
            <div className="space-y-2 max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center mt-6">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg p-3 ${msg.direction === "outgoing" ? "bg-green-100" : "bg-white"
                        } shadow-sm`}
                    >
                      <p className="text-gray-800">{msg.message}</p>
                      <div className="flex justify-end items-center mt-1 space-x-1">
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.direction === "outgoing" && (
                          <BsCheck2All
                            className={`text-xs ${msg.status === "read" ? "text-blue-500" : "text-gray-400"
                              }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input */}
          {/* <div className="p-3 border-t bg-white">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <BsEmojiSmile />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <BsPaperclip />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div> */}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center">
          <div className="bg-green-50 p-6 rounded-full mb-6">
            <BsWhatsapp className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">WhatsApp Business Inbox</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Select a conversation from the sidebar to view messages or start a new chat.
          </p>
        </div>
      )}
    </div>
  );

  // ✅ Render Layout
  return isMobileView ? (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {showChat ? <ChatView /> : <ChatList />}
    </div>
  ) : (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans">
      <ChatList />
      <ChatView />
    </div>
  );
};

export default HistoryLive;
