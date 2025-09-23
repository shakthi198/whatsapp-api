import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Dashboard from "./Pages/Dashboard";


import Login from "./Components/Login";
import SingleMsg from "./Components/Compose Message/SingleMsg";
import Group from "./Components/Compose Message/Group";
import CSV from "./Components/Compose Message/CSV";
import ManageTemplates from "./Components/ManageTemplates";
import CreateTemplate from "./Components/CreateTemplate";
import QRCodeGenerator from "./Components/Setttings/QRCodeGenerator";
import Broadcastlogo from "./Components/Reports/Broadcastlogo";
import ApiLogoui from "./Components/Reports/ApiLogoui";
import ScheduleLogoui from "./Components/Reports/ScheduleLogsUI";
import WhatsAppCampaignTable from "./Components/WhatsAppCampaignTable";



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

function MainContent({ darkMode, setDarkMode }) {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login"; // Check if the current route is the login page

    return (
        <div
            className={`${isLoginPage
                ? "flex justify-center items-center h-screen w-screen" // Fullscreen styles for login page
                : `flex flex-col md:flex-row ${darkMode ? "bg-gray-900 text-white" : "bg-[#F5F5F5] text-black"}`
                }`}
        >
            {!isLoginPage && <Sidebar darkMode={darkMode} />} {/* Sidebar hidden on Login Page */}

            <div className={`${isLoginPage ? "w-full h-full flex items-center justify-center" : "flex-1 p-4 md:ml-64"}`}>
                {!isLoginPage && <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode((prev) => !prev)} />} {/* Header hidden on Login Page */}


                <Routes>
                    <Route path="/" element={<Dashboard darkMode={darkMode} />} />
                    <Route path="/login" element={<Login darkMode={darkMode} />} />
                    <Route path="/templates" element={<ManageTemplates />} />

                    {/* compose tabs */}
                    <Route path="/compose" element={<SingleMsg />} />
                    <Route path="/group" element={<Group />} />
                    <Route path="/csv" element={<CSV />} />


                    {/* contacts */}
                    <Route path="/contacts/uicontact" element={<ContactsUI />} />
                    <Route path="/allcontacts" element={<Contacts />} />
                    <Route path="/manage-groups" element={<ManageGroups />} />
                    <Route path="/contacts/unsubscribe" element={<UISubscribe />} />



                    <Route path="/create-template" element={<CreateTemplate />} />
                    <Route path="/qrcode" element={<QRCodeGenerator />} />
                  


                    <Route path="/broadcast-logs" element={<Broadcastlogo />} />
                    <Route path="/api-logs" element={<ApiLogoui />} />
                    <Route path="/schedule-logs" element={<ScheduleLogoui />} />
                    <Route path="/WhatsAppCampaignTable/:campaignName" element={<WhatsAppCampaignTable />} />
                  {/*   <Route path="/whatsappflow" element={<WhatsappFlow />} /> */}
                {/*     <Route path="" element={<ModalReplica />} /> */}

                    <Route path="/flow" element={<FlowPage />} />
                    <Route path="/flow-chart/:id" element={<FlowChart />} />
                    <Route path="/user-attributes" element={<UserAttribute />} />
                   
                    <Route path="/api-settings" element={<ApiKeyManager />} />
                    <Route path="/LiveChatUI" element={<LiveChatUI />} />
                    <Route path="/history" element={<Historylive />} />
                    <Route path="/chatagent" element={<ChatAgentpage />} />
                    
                    
                </Routes>
            </div>
        </div>
    );
}

export default App;
