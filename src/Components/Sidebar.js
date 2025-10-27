import {
  Home,
  Send,
  MessageSquare,
  Users,
  FileText,
  BarChart,
  Settings,
  CreditCard,
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
    settings: false,
  });

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const toggleDropdown = (key) => {
    setDropdowns((prev) => {
      const updatedDropdowns = Object.keys(prev).reduce((acc, k) => {
        acc[k] = false;
        return acc;
      }, {});
      updatedDropdowns[key] = !prev[key];
      return updatedDropdowns;
    });
  };

  const location = useLocation();

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F1F1F1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #888 #F1F1F1; }
      `}</style>

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
        <div className="flex justify-center items-center mb-6">
          <img src={el} alt="Codamics" className="h-8" />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          <NavItem
            icon={<Home size={20} />}
            label="Dashboard"
            path="/dashboard"
            closeSidebar={closeSidebar}
          />
          <NavItem
            icon={<Send size={20} />}
            label="Compose Message"
            path="/compose"
            closeSidebar={closeSidebar}
          />

          <DropdownItem
            icon={<MessageSquare size={20} />}
            label="Chat"
            isOpen={dropdowns.chat}
            toggleDropdown={() => toggleDropdown("chat")}
            subItems={[
              { label: "Live Chat", path: "/LiveChatUI" },
              { label: "History", path: "/history" },
              { label: "Chat Agent", path: "/chatagent" },
            ]}
            closeSidebar={closeSidebar}
          />

          <DropdownItem
            icon={<Users size={20} />}
            label="Contacts"
            isOpen={dropdowns.contacts}
            toggleDropdown={() => toggleDropdown("contacts")}
            subItems={[
              { label: "Contacts", path: "/allcontacts" },
              // Add more if needed
            ]}
            closeSidebar={closeSidebar}
          />

          <NavItem
            icon={<FileText size={20} />}
            label="Manage Template"
            path="/templates"
            closeSidebar={closeSidebar}
          />

          <NavItem
            icon={<BarChart size={20} />}
            label="Reports"
            path="/api-logs"
            closeSidebar={closeSidebar}
          />

          <NavItem
            icon={<CreditCard size={20} />}
            label="Billing"
            path="/billing"
            closeSidebar={closeSidebar}
          />

          <NavItem
            icon={<Zap size={20} />}
            label="Flow"
            path="/flow"
            closeSidebar={closeSidebar}
          />

          {/* <DropdownItem
            icon={<Settings size={20} />}
            label="Settings"
            isOpen={dropdowns.settings}
            toggleDropdown={() => toggleDropdown("settings")}
            subItems={[{ label: "API Settings", path: "/api-settings" }]}
            closeSidebar={closeSidebar}
          /> */}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

/* ---------- NavItem (Regular Link) ---------- */
const NavItem = ({ icon, label, path, closeSidebar }) => {
  const location = useLocation();
const isActive = location.pathname === path;


  return (
    <Link
      to={path}
      onClick={closeSidebar}
      className={`flex items-center p-3 rounded-lg transition duration-300 transform hover:scale-105 hover:shadow-lg ${
        isActive
          ? "bg-blue-500 text-white shadow-md"
          : "hover:bg-gray-200 text-gray-700"
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

/* ---------- DropdownItem (With Submenu) ---------- */
const DropdownItem = ({
  icon,
  label,
  isOpen,
  toggleDropdown,
  subItems,
  closeSidebar,
}) => {
  const location = useLocation();

  // Check if any submenu is active
    const isParentActive = subItems.some((item) =>
      location.pathname.startsWith(item.path)
    );

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className={`flex justify-between items-center p-3 rounded-lg w-full text-left transition duration-300 transform hover:scale-105 hover:shadow-lg ${
          isParentActive
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-200 text-gray-700"
        }`}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-3">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="ml-6 mt-1">
          {subItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`block p-2 rounded-md text-sm transition ${
                  active
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
