import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeliveryChartUI from "../../Dynamic Components/DeliveryChartUI";
import ScheduleLogo from "./ScheduleLogo";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import Pagination from "../../Dynamic Components/Pagination";

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
        style={{
          color: "green",
          cursor: "pointer",
          fontFamily: "'Montserrat', sans-serif",
        }}
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
      className="max-w-7xl mx-auto p-4 md:p-6"
      style={{ fontFamily: "'Montserrat'" }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">
            API-Logs
          </h2>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Api-logs</span>
          </div>
        </div>
      </div>

      {/* Chart Component */}
      <div className="mb-4 overflow-x-auto">
        <Apilogoschartui />
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
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
