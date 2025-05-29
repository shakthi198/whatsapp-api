import React from "react";
import { FaChevronRight } from "react-icons/fa";
import DeliveryChartUI from "../../Dynamic Components/DeliveryChartUI";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import Pagination from "../../Dynamic Components/Pagination";
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
     <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Broadcast-logs</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Broadcast-logs</span>
          </div>
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