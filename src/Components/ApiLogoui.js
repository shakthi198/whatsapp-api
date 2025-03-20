import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import DeliveryChartUI from "../Dynamic Components/DeliveryChartUI";
import ScheduleLogo from "../data/ScheduleLogo";
import Apilogoschartui from "../Dynamic Components/Apilogochartui";
import ReusableTable from "../Dynamic Components/ReusableTable";
import Pagination from "../Dynamic Components/Pagination";

const ApiLogoui = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const columns = [
    "S.No",
    "Campaign Name",
    "Target Users",
    "Submitted",
    "Failed Users",
    "Sent",
    "Delivered",
    "Read",
    "Status",
  ];

  const data = [
    {
      "S.No": 1,
      "Campaign Name": "Test Api",
      "Published Time": "2025-03-13 10:00 AM",
      "Target Users": 5000,
      Submitted: 4500,
      "Failed Users": 500,
      Sent: 4300,
      Delivered: 4200,
      Read: 3900,
      Status: "Completed",
    },
  ];
  const handlePrevClick = () => {
    navigate("/Broadcastlogo"); // Navigate to the ApiLogoui page
  };

  // Function to handle navigation
  const handleCampaignClick = (campaignName) => {
    navigate(`/WhatsAppCampaignTable/${encodeURIComponent(campaignName)}`); // Navigate to the desired path
  };


  const modifiedData = data.map((item) => ({
    ...item,
    Status: (
      <span
        className={`px-2 py-1 text-white font-semibold rounded ${
          item.Status === "Completed" ? "bg-green-500" : "bg-orange-400"
        }`}
      >
        {item.Status}
      </span>
    ),
    "Campaign Name": (
      <span
        style={{ color: "green", cursor: "pointer" }}
        onClick={() => handleCampaignClick(item["Campaign Name"])}
      >
        {item["Campaign Name"]}
      </span>
    ),
  }));
  const handleNextClick = () => {
    navigate("/schedule-logs"); // Navigate to the next component
  };

  return (
    <div className="w-full min-h-screen p-3 items-start">
      <div className="flex mb-10">
        <h1 className="text-gray-700 font-semibold text-lg mr-2">API-Logs</h1>
        <span className="text-gray-300 mx-1">|</span>
        <div className="flex items-center text-sm text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Home</span>
          <FaChevronRight className="mx-1 text-gray-300 text-xs" 
          />
          <span className="text-orange-400 cursor-pointer">Api-logs</span>
        </div>
      </div>
      <div className="mb-4">
        <Apilogoschartui />
      </div>
      <div>
        <ReusableTable columns={columns} data={modifiedData} />
      </div>
      
      {/* <Pagination
        currentPage={1}
        totalPages={1}
        setCurrentPage={() => {}}
        onNextClick={handleNextClick}
        onPrevClick={handlePrevClick} // Pass the handleNextClick function
      />
       */}
    </div>
  );
};

export default ApiLogoui;