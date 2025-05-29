import React, { useState } from 'react';
import {
  FiSearch, FiFilter, FiChevronDown, FiMessageSquare, 
  FiCheck, FiEye, FiUser, FiArrowRight
} from 'react-icons/fi';
import {
  BsWhatsapp, BsThreeDotsVertical, BsEmojiSmile, 
  BsPaperclip, BsCheck2All
} from 'react-icons/bs';

const HistoryLive = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const chats = [
    { 
      id: 1, 
      number: '91981163737', 
      lastMessage: 'Good to see you', 
      date: '24/04/2025', 
      unread: true, 
      status: 'green',
      time: '10:30 AM'
    },
    { 
      id: 2, 
      number: '9134536263', 
      lastMessage: '345346 is your verification code', 
      date: '02/04/2025', 
      followUp: '02/04/2025', 
      unread: false,
      time: '09:15 AM'
    },
    { 
      id: 3, 
      number: '91980820589', 
      lastMessage: 'Good to see you', 
      date: '28/02/2025', 
      unread: false,
      time: 'Yesterday'
    },
    { 
      id: 4, 
      number: '919042489025', 
      lastMessage: 'Codomics is more than just code - We\'re a...', 
      date: '20/01/2025', 
      unread: true, 
      status: 'yellow',
      time: '01/20/2025'
    },
    { 
      id: 5, 
      number: '91995216887', 
      lastMessage: 'Good to see you', 
      date: '04/01/2025', 
      unread: false,
      time: '01/04/2025'
    },
    { 
      id: 6, 
      number: '918010000524', 
      lastMessage: 'Good to see you', 
      date: '25/12/2024', 
      unread: false,
      time: '12/25/2024'
    },
    { 
      id: 7, 
      name: '~MRIDHUL~', 
      lastMessage: 'Good to see you', 
      date: '12/12/2024', 
      unread: false, 
      status: 'red',
      time: '12/12/2024'
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.number?.includes(searchQuery) ||
    chat.name?.includes(searchQuery) ||
    chat.lastMessage?.includes(searchQuery)
  );

  const filteredByTab = filteredChats.filter(chat => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return chat.unread;
    if (activeTab === 'read') return !chat.unread;
    return true;
  });

  // Sample messages for the selected chat
  const sampleMessages = [
    { id: 1, text: 'Hello there!', sent: true, time: '10:30 AM', status: 'read' },
    { id: 2, text: 'Hi! How can I help you today?', sent: false, time: '10:32 AM' },
    { id: 3, text: 'I was wondering about your services', sent: true, time: '10:33 AM', status: 'delivered' },
    { id: 4, text: 'We offer a wide range of services. What specifically are you interested in?', sent: false, time: '10:35 AM' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-lg font-semibold text-gray-800">WABA: 91938301443</h1>
            <div className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${selectedChat ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className="text-xs text-gray-600">LIVE</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="mr-1">Quality:</span>
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              <span className="font-medium text-green-600">GREEN</span>
            </div>
            <span>Iler_1.MEG_1000 LIMIT</span>
          </div>
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
            { key: 'all', label: 'All', icon: <FiMessageSquare size={16} /> },
            { key: 'unread', label: 'Unread', icon: <FiEye size={16} /> },
            { key: 'read', label: 'Read', icon: <FiCheck size={16} /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center px-4 py-2 mr-2 text-sm rounded-lg transition-all ${
                activeTab === key
                  ? `bg-${key === 'read' ? 'green' : key === 'unread' ? 'blue' : 'green'}-100 text-${key === 'read' ? 'green' : key === 'unread' ? 'blue' : 'green'}-800 shadow-inner`
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredByTab.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3  border-b border-gray-200  cursor-pointer transition-all ${
                selectedChat?.id === chat.id ? 'bg-green-50 border-l-4 border-green-400' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {chat.status && (
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      chat.status === 'green' ? 'bg-green-500' :
                      chat.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  )}
                  <h3 className="font-medium text-gray-800">{chat.name || chat.number}</h3>
                </div>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              {chat.lastMessage && (
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-sm truncate w-4/5 ${
                    chat.unread ? 'text-gray-800 font-medium' : 'text-gray-500'
                  }`}>{chat.lastMessage}</p>
                  {chat.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              )}
              {chat.followUp && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <span>{chat.date}</span>
                  <FiArrowRight className="mx-1" size={12} />
                  <span>{chat.followUp}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center text-sm text-gray-600 bg-white">
          WhatsApp Communication Platform Inbox
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b flex justify-between items-center bg-white shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <FiUser className="text-gray-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedChat.name || selectedChat.number}</h2>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <BsThreeDotsVertical />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] bg-opacity-30">
              <div className="max-w-3xl mx-auto text-center text-xs text-gray-500 py-2 bg-white rounded-full inline-block px-4 mb-4">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              {/* Message bubbles */}
              <div className="space-y-2 max-w-3xl mx-auto">
                {sampleMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sent ? 'bg-green-100' : 'bg-white'} shadow-sm`}
                    >
                      <p className="text-gray-800">{message.text}</p>
                      <div className="flex justify-end items-center mt-1 space-x-1">
                        <span className="text-xs text-gray-500">{message.time}</span>
                        {message.sent && (
                          <BsCheck2All 
                            className={`text-xs ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
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
                <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                  <BsWhatsapp />
                </button>
              </div>
            </div>
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
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 shadow-sm transition-colors">
              Start New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryLive;