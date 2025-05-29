import {
  Home,
  Send,
  MessageSquare,
  Users,
  FileText,
  BarChart,
  Settings,
  CreditCard,
  BookOpen,
  Zap,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import el from "../assets/el2.png";
const Sidebar = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    chat: false,
    contacts: false,
    reports: false,
    catalog: false,
    settings: false,
  });
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const toggleDropdown = (key) => {
    setDropdowns((prev) => {
      // Close all dropdowns first
      const updatedDropdowns = Object.keys(prev).reduce((acc, dropdownKey) => {
        acc[dropdownKey] = false;
        return acc;
      }, {});
      // Toggle the selected dropdown
      updatedDropdowns[key] = !prev[key];
      return updatedDropdowns;
    });
  };
  return (
    <>
      <style>
      {`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px; /* Scrollbar width */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F1F1; /* Track color */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888; /* Thumb color */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555; /* Hover effect */
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #F1F1F1;
        }
      `}
      </style>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-9 left-6 z-50 bg-blue-500 text-white p-2 rounded-md"
        >
          <Menu size={24} />
        </button>
      )}
      <div
      className={`fixed top-0 left-0 h-screen w-64 shadow-lg flex flex-col p-4 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto custom-scrollbar ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-700"
      } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
        {/* Logo */}
        <div className="flex justify-center items-center mb-6 ">
          <img src={el} alt="Codamics" className="h-8" />
        </div>
        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2 mb-15">
          <NavItem icon={<Home size={20} />} label="Dashboard" path="/" closeSidebar={closeSidebar} />
          <NavItem icon={<Send size={20} />} label="Compose Message" path="/compose" closeSidebar={closeSidebar} />
          {/* Chat with Dropdown */}
          <DropdownItem
            icon={<MessageSquare size={20} />}
            label="Chat"
            isOpen={dropdowns.chat}
            toggleDropdown={() => toggleDropdown("chat")}
            subItems={[
              { label: "Live Chat", path: "LiveChatUI" },
              { label: "History", path: "/history" },
              { label: "Chat Agent", path: "/chatagent" },
            ]}
          />
          {/* Contacts with Dropdown */}
          <DropdownItem
            icon={<Users size={20} />}
            label="Contacts"
            isOpen={dropdowns.contacts}
            toggleDropdown={() => toggleDropdown("contacts")}
            subItems={[
              { label: "Contacts", path: "/allcontacts" },
              { label: "UI Contacts", path: "/contacts/uicontact" },
              { label: "Un Subscribe", path: "/contacts/unsubscribe" },
            ]}
          />
          <NavItem icon={<FileText size={20} />} label="Manage Template" path="/templates" closeSidebar={closeSidebar} />
          {/* Reports with Dropdown */}
          <DropdownItem
            icon={<BarChart size={20} />}
            label="Reports"
            isOpen={dropdowns.reports}
            toggleDropdown={() => toggleDropdown("reports")}
            subItems={[
              { label: "Broadcast Logs", path: "/broadcast-logs" },
              { label: "API Logs", path: "/api-logs" },
              { label: "Schedule Logs", path: "/schedule-logs" },
            ]}
          />
          <NavItem icon={<CreditCard size={20} />} label="Billing" path="/billing" closeSidebar={closeSidebar} />
          <NavItem icon={<Zap size={20} />} label="Flow" path="/flow" closeSidebar={closeSidebar} />
          <NavItem icon={<MessageSquare size={20} />} label="Chatbot Builder" path="/chatbot" closeSidebar={closeSidebar} />
          <NavItem icon={<Zap size={20} />} label="Whatsapp Flows" path="/whatsappflow" closeSidebar={closeSidebar} />
          <NavItem icon={<Zap size={20} />} label="Integration" path="/integration" closeSidebar={closeSidebar} />
          <NavItem icon={<Zap size={20} />} label="Payments" path="/payments" closeSidebar={closeSidebar} />
          {/* Catalog with Dropdown */}
          <DropdownItem
            icon={<BookOpen size={20} />}
            label="Catalog"
            isOpen={dropdowns.catalog}
            toggleDropdown={() => toggleDropdown("catalog")}
            subItems={[
              { label: "Catalog", path: "/catalog" },
              { label: "Orders", path: "/orders" },
            ]}
          />
          {/* Settings with Dropdown */}
          <DropdownItem
            icon={<Settings size={20} />}
            label="Settings"
            isOpen={dropdowns.settings}
            toggleDropdown={() => toggleDropdown("settings")}
            subItems={[
              { label: "Dialog Flow", path: "/dialogflow" },
              { label: "API Settings", path: "/api-settings" },
              { label: "User Attributes", path: "/user-attributes" },
              { label: "QR Code", path: "/qrcode" },
            ]}
          />
        </nav>
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 md:hidden" onClick={toggleSidebar}></div>}
    </>
  );
};
// Regular Nav Item
const NavItem = ({ icon, label, path, closeSidebar }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  return (
    <Link
      to={path}
      onClick={closeSidebar}
      className={`flex items-center p-3 rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg ${
        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};
// Dropdown Nav Item
const DropdownItem = ({ icon, label, isOpen, toggleDropdown, subItems }) => {
  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="flex justify-between items-center p-3 rounded-lg w-full text-left transition duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-gray-200"
      >
        <div className="flex items-center" >
          {icon}
          <span className="ml-3">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="ml-6">
          {subItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default Sidebar;