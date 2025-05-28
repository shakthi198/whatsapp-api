import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeliveryChartUI from "../Dynamic Components/DeliveryChartUI";
import ScheduleLogo from "../data/ScheduleLogo";
import Apilogoschartui from "../Dynamic Components/Apilogochartui";
import ReusableTable from "../Dynamic Components/ReusableTable";
import Pagination from "../Dynamic Components/Pagination";

const ApiLogoui = () => {
  const navigate = useNavigate();

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
    navigate("/Broadcastlogo");
  };

  const handleCampaignClick = (campaignName) => {
    navigate(`/WhatsAppCampaignTable/${encodeURIComponent(campaignName)}`);
  };

  const modifiedData = data.map((item) => ({
    ...item,
    Status: (
      <span
        className={`px-2 py-1 text-white font-semibold rounded ${
          item.Status === "Completed" ? "bg-green-500" : "bg-orange-400"
        }`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {item.Status}
      </span>
    ),
    "Campaign Name": (
      <span
        style={{ color: "green", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" }}
        onClick={() => handleCampaignClick(item["Campaign Name"])}
      >
        {item["Campaign Name"]}
      </span>
    ),
  }));

  const handleNextClick = () => {
    navigate("/schedule-logs");
  };

  return (
    <div 
      className="w-full min-h-screen p-3 items-start"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header Section */}
      <div className="flex mb-10">
        <h1 
          className="font-medium text-2xl mr-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          API-Logs
        </h1>
        <span className="text-gray-300 mx-1">|</span>
        <div 
          className="flex items-center text-md"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <span className="text-yellow-600">Home</span>
          <FaChevronRight className="mx-1 text-gray-300 text-md" />
          <span className="text-yellow-600 cursor-pointer">Api-logs</span>
        </div>
      </div>

      {/* Chart Component */}
      <div className="mb-4">
        <Apilogoschartui />
      </div>

      {/* Table Component */}
      <div>
        <ReusableTable 
          columns={columns} 
          data={modifiedData}
          fontFamily="'Montserrat', sans-serif"
        />
      </div>

      {/* Pagination (commented out) */}
      {/* <Pagination
        currentPage={1}
        totalPages={1}
        setCurrentPage={() => {}}
        onNextClick={handleNextClick}
        onPrevClick={handlePrevClick}
      /> */}
    </div>
  );
};

export default ApiLogoui;