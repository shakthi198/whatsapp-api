import React from "react";
import { FaChevronRight } from "react-icons/fa";
import DeliveryChartUI from "../Dynamic Components/DeliveryChartUI";
import ReusableTable from "../Dynamic Components/ReusableTable";
import Pagination from "../Dynamic Components/Pagination";
import { useNavigate } from "react-router-dom";

const Broadcastlogo = () => {
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

  const data = []; // Empty data array

  const handleNextClick = () => {
    navigate("/ApiLogoui");
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
          Broadcast-Logs
        </h1>
        <span className="text-gray-300 mx-1">|</span>
        <div 
          className="flex items-center text-md"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <span className="text-yellow-600">Home</span>
          <FaChevronRight className="mx-1 text-gray-300 text-md" />
          <span className="text-yellow-600 cursor-pointer">Broadcast-logs</span>
        </div>
      </div>

      {/* Chart Component */}
      <div className="mb-4">
        <DeliveryChartUI />
      </div>

      {/* Table Component */}
      <div>
        <ReusableTable 
          columns={columns} 
          data={data} 
          fontFamily="'Montserrat', sans-serif"
        />
      </div>

      {/* Pagination (commented out) */}
      {/* <Pagination
        currentPage={1}
        totalPages={1}
        setCurrentPage={() => {}}
        onNextClick={handleNextClick}
      /> */}
    </div>
  );
};

export default Broadcastlogo;