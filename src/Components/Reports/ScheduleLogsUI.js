import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import Pagination from "../../Dynamic Components/Pagination";

const ScheduleLogsUI = () => {
  const [activeTab, setActiveTab] = useState("Schedule Report");
  const [tableData, setTableData] = useState([
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
          item.Status === "Completed" ? "bg-green-500" : "bg-yellow-600"
        }`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {item.Status}
      </span>
    ),
  }));

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Schedule Logs") setTableData([]);
  };

  return (
   <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Schedule Logs</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Schedule Logs</span>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div 
        className="flex gap-4 border-b-2 border-gray-200 mb-4"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {["Schedule Report", "Schedule Logs"].map((tab) => (
          <span
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`cursor-pointer pb-2 px-4 font-medium ${
              activeTab === tab
                ? "text-yellow-600 border-b-2 border-yellow-600"
                : "text-gray-400"
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Content Section */}
      <div className="text-yellow-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {activeTab === "Schedule Report" && (
          <div className="mb-4">
            <Apilogoschartui />
          </div>
        )}
        <div>
          <ReusableTable 
            columns={columns} 
            data={modifiedData}
            fontFamily="'Montserrat', sans-serif"
          />
        </div>
        {/* <Pagination
          currentPage={1}
          totalPages={1}
          setCurrentPage={() => {}}
        /> */}
      </div>
    </div>
  );
};

export default ScheduleLogsUI;