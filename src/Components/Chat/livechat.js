import React, { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaWhatsapp,
  FaRegCheckCircle,
  FaRegEye,
  FaRegHandPaper,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const LiveChatUI = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    { id: 1, name: "John Doe", lastMessage: "Hello, I need help with...", time: "10:30 AM", unread: true },
    { id: 2, name: "Amazon Support", lastMessage: "Your order has been shipped", time: "Yesterday", unread: false },
    { id: 3, name: "Sarah Smith", lastMessage: "Thanks for your response!", time: "2 days ago", unread: false },
  ];

  return (
 <div className="flex flex-col md:flex-row h-screen bg-[#f5f5f5] font-['Montserrat']">
  {/* Sidebar */}
  <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col min-h-[300px]">
    {/* Header */}
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-800 truncate">WhatsApp Inbox</h2>
        <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 md:mt-0">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          Live
        </div>
      </div>
      <div className="text-xs text-gray-500 truncate">
        WABA: 919383013413 • Quality: <span className="text-green-600 font-medium">@GREEN</span>
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">file_1: MSO_1000 LIMIT</div>
    </div>

    {/* Search */}
    <div className="p-3 border-b border-gray-200">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search chat"
          className="w-full pl-9 pr-9 py-2 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaFilter className="text-sm" />
        </button>
      </div>
    </div>

    {/* Filter Tabs */}
    <div className="flex flex-wrap px-3 pt-2 pb-1 border-b border-gray-200 gap-1">
      {[{ id: "all", label: "All" }, { id: "unread", label: "Unread", icon: <FaRegEye className="mr-1" /> },
        { id: "read", label: "Read", icon: <FaRegCheckCircle className="mr-1" /> },
        { id: "intervened", label: "Intervened", icon: <FaRegHandPaper className="mr-1" /> }].map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setActiveFilter(id)}
          className={`flex items-center px-3 py-2 text-xs font-medium rounded-md ${
            activeFilter === id
              ? id === "unread"
                ? "bg-blue-100 text-blue-800"
                : id === "read"
                ? "bg-green-100 text-green-800"
                : id === "intervened"
                ? "bg-purple-100 text-purple-800"
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
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => setSelectedChat(chat)}
          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
            selectedChat?.id === chat.id ? "bg-yellow-50" : ""
          } ${chat.unread ? "font-semibold" : ""}`}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-sm text-gray-800 truncate">{chat.name}</h3>
            <span className="text-xs text-gray-400">{chat.time}</span>
          </div>
          <p className={`text-xs mt-1 truncate ${chat.unread ? "text-gray-800" : "text-gray-500"}`}>
            {chat.lastMessage}
          </p>
          {chat.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="p-3 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
      <div className="text-xs text-gray-500">Eicodamics</div>
      <div className="flex items-center text-xs text-gray-500">
        <button className="p-1 rounded hover:bg-gray-100">
          <IoIosArrowBack />
        </button>
        <span className="mx-2">1/3</span>
        <button className="p-1 rounded hover:bg-gray-100">
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 flex flex-col min-h-0">
    {selectedChat ? (
      <>
        {/* Chat Header */}
        <div className="p-3 border-b border-gray-200 bg-white flex items-center flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0"></div>
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate">{selectedChat.name}</h3>
            <p className="text-xs text-gray-500 truncate">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] min-h-0">
          <div className="text-sm text-gray-700">No messages yet.</div>
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            <button className="ml-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
              <FaWhatsapp />
            </button>
          </div>
        </div>
      </>
    ) : (
      // Empty State
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
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 shadow-sm transition-colors">
          Start New Chat
        </button>
      </div>
    )}
  </div>
</div>

  );
};

export default LiveChatUI;
