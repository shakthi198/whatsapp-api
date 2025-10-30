import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Dashboard from "./Pages/Dashboard";

import Login from "./Components/Login";
import SingleMsg from "./Components/Compose Message/SingleMsg";
import Group from "./Components/Compose Message/Group";
import CSV from "./Components/Compose Message/CSV";
import ManageTemplates from "./Components/ManageTemplates";
import UseMetaTemplates from "./Components/UseMetaTemplates";
import CreateTemplate from "./Components/CreateTemplate";
import QRCodeGenerator from "./Components/Setttings/QRCodeGenerator";
import Broadcastlogo from "./Components/Reports/Broadcastlogo";
import ApiLogoui from "./Components/Reports/ApiLogoui";
import ScheduleLogoui from "./Components/Reports/ScheduleLogsUI";
import WhatsAppCampaignTable from "./Components/WhatsAppCampaignTable";
import Billing from './Components/Billing/Billing';

import FlowPage from "./Components/Flow/FlowPage";
import FlowChart from "./Components/FlowChart";
import UserAttribute from './Components/Setttings/UserAttribute';

import ApiKeyManager from "./Components/Setttings/ApiKeyManager";
import ContactsUI from "./Components/Contacts/ContactsUI";
import ManageGroups from './Components/ManageGroups';
import Contacts from "./Components/Contacts/Contacts";
import UISubscribe from "./Components/Contacts/UISubscribe";
import LiveChatUI from "./Components/Chat/livechat";
import Historylive from "./Components/Chat/Historylive";
import ChatAgentpage from "./Components/Chat/ChatAgentPage";
import ProfilePage from "./Components/Profile/profile";

function App() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    return (
        <Router>
            <MainContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </Router>
    );
}

// Protects routes if token is missing
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function MainContent({ darkMode, setDarkMode }) {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login"; // Check if current route is login

    return (
        <div
            className={`${isLoginPage
                ? "flex justify-center items-center h-screen w-screen"
                : `flex flex-col md:flex-row ${darkMode ? "bg-gray-900 text-white" : "bg-[#F5F5F5] text-black"}`
            }`}
        >
            {!isLoginPage && <Sidebar darkMode={darkMode} />}

            <div className={`${isLoginPage ? "w-full h-full flex items-center justify-center" : "flex-1 p-4 md:ml-64"}`}>
                {!isLoginPage && <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(prev => !prev)} />}

                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<Login darkMode={darkMode} />} />

                    {/* Protected routes */}
                   {/* Redirect root "/" to "/dashboard" if token exists */}
                    <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage></ProfilePage></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard darkMode={darkMode} /></ProtectedRoute>} />
                    <Route path="/templates" element={<ProtectedRoute><ManageTemplates /></ProtectedRoute>} />
                    <Route path="/use-templates" element={<ProtectedRoute><UseMetaTemplates/></ProtectedRoute>} />
                    <Route path="/compose" element={<ProtectedRoute><SingleMsg /></ProtectedRoute>} />
                    <Route path="/group" element={<ProtectedRoute><Group /></ProtectedRoute>} />
                    <Route path="/csv" element={<ProtectedRoute><CSV /></ProtectedRoute>} />
                    <Route path="/contacts/uicontact" element={<ProtectedRoute><ContactsUI /></ProtectedRoute>} />
                    <Route path="/allcontacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                    <Route path="/manage-groups" element={<ProtectedRoute><ManageGroups /></ProtectedRoute>} />
                    <Route path="/contacts/unsubscribe" element={<ProtectedRoute><UISubscribe /></ProtectedRoute>} />
                    <Route path="/create-template" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
                    <Route path="/qrcode" element={<ProtectedRoute><QRCodeGenerator /></ProtectedRoute>} />
                    <Route path="/broadcast-logs" element={<ProtectedRoute><Broadcastlogo /></ProtectedRoute>} />
                    <Route path="/api-logs" element={<ProtectedRoute><ApiLogoui /></ProtectedRoute>} />
                    <Route path="/schedule-logs" element={<ProtectedRoute><ScheduleLogoui /></ProtectedRoute>} />
                    <Route path="/WhatsAppCampaignTable/:campaignName" element={<ProtectedRoute><WhatsAppCampaignTable /></ProtectedRoute>} />
                    <Route path="/flow" element={<ProtectedRoute><FlowPage /></ProtectedRoute>} />
                    <Route path="/flow-chart/:id" element={<ProtectedRoute><FlowChart /></ProtectedRoute>} />
                    <Route path="/user-attributes" element={<ProtectedRoute><UserAttribute /></ProtectedRoute>} />
                    <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                    <Route path="/api-settings" element={<ProtectedRoute><ApiKeyManager /></ProtectedRoute>} />
                    <Route path="/LiveChatUI" element={<ProtectedRoute><LiveChatUI /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><Historylive /></ProtectedRoute>} />
                    <Route path="/chatagent" element={<ProtectedRoute><ChatAgentpage /></ProtectedRoute>} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
