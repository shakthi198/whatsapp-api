import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Apilogoschartui from "../Dynamic Components/Apilogochartui";
import ReusableTable from "../Dynamic Components/ReusableTable";
import Pagination from "../Dynamic Components/Pagination";

const ScheduleLogsUI = () => {
  const [activeTab, setActiveTab] = useState("Schedule Report");
  const [tableData, setTableData] = useState([ // Default data
    {
      "S.No": 1,
      "Campaign Name": "Summer Sale",
      "Published Time": "2025-03-13 10:00 AM",
      "Target Users": 5000,
      Submitted: 4500,
      "Failed Users": 500,
      Sent: 4300,
      Delivered: 4200,
      Read: 3900,
      Status: "Completed",
    },
    {
      "S.No": 2,
      "Campaign Name": "New Product Launch",
      "Published Time": "2025-03-12 02:00 PM",
      "Target Users": 8000,
      Submitted: 7200,
      "Failed Users": 800,
      Sent: 7000,
      Delivered: 6800,
      Read: 6500,
      Status: "In Progress",
    },
  ]);

  const navigate = useNavigate();

  const columns = [
    "S.No",
    "Campaign Name",
    "Published Time",
    "Target Users",
    "Submitted",
    "Failed Users",
    "Sent",
    "Delivered",
    "Read",
    "Status",
  ];

  const modifiedData = tableData.map((item) => ({
    ...item,
    Status: (
      <span
        className={`px-2 py-1 text-white text-gray-600 font-medium rounded ${
          item.Status === "Completed" ? "bg-green-500" : "bg-orange-400"
        }`}
      >
        {item.Status}
      </span>
    ),
  }));

  // Handle tab click to reset data
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Schedule Logs") setTableData([]); // Reset data when switching to Schedule Logs
  };

  // const handlePrevClick = () => navigate("");
  // const handleNextClick = () => {};

  return (
    <div className="w-full min-h-screen p-3">
      {/* Breadcrumb */}
      <div className="flex mb-10">
        <h1 className="text-gray-700 font-semibold text-lg mr-2">Schedule Logs</h1>
        <span className="text-gray-300 mx-1">|</span>
        <div className="flex items-center text-sm text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Home</span>
          <FaChevronRight className="mx-1 text-gray-300 text-xs" />
          <span className="text-orange-400 cursor-pointer">Schedule Logs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b-2 border-gray-200 mb-4">
        {["Schedule Report", "Schedule Logs"].map((tab) => (
          <span
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`cursor-pointer pb-2 px-4 font-semibold ${
              activeTab === tab
                ? "text-[#CBAE7D] border-b-2 border-[#CBAE7D]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Content Section */}
      <div className="text-gray-700">
        {activeTab === "Schedule Report" && (
          <div className="mb-4">
            <Apilogoschartui />
          </div>
        )}
        <div>
          <ReusableTable columns={columns} data={modifiedData} />
        </div>
        {/* <Pagination
          currentPage={1}
          totalPages={1}
          setCurrentPage={() => {}}
          onPrevClick={handlePrevClick}
          onNextClick={handleNextClick}
        /> */}
      </div>
    </div>
  );
};

export default ScheduleLogsUI;