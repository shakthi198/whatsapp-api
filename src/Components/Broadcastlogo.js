import React from "react";
import { FaChevronRight } from "react-icons/fa";
import DeliveryChartUI from "../Dynamic Components/DeliveryChartUI";
import ReusableTable from "../Dynamic Components/ReusableTable";
import Pagination from "../Dynamic Components/Pagination";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Broadcastlogo = () => {
  const navigate = useNavigate(); // Initialize useNavigate

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

  // Function to handle "Next" button click
  const handleNextClick = () => {
    navigate("/ApiLogoui"); // Navigate to the next component
  };

  return (
    <div className="w-full min-h-screen p-3  items-start">
      <div className="flex mb-10">
        <h1 className="text-gray-700 font-semibold text-lg mr-2">Broadcast-Logs</h1>
        <span className="text-gray-300 mx-1">|</span>
        <div className="flex items-center text-sm text-gray-400">
          <span className="hover:text-gray-600 cursor-pointer">Home</span>
          <FaChevronRight className="mx-1 text-gray-300 text-xs" />
          <span className="text-orange-400 cursor-pointer">Broadcast-logs</span>
        </div>
      </div>
      <div className="mb-4">
        <DeliveryChartUI />
      </div>
      <div>
        <ReusableTable columns={columns} data={data} />
      </div>
      {/* <Pagination
        currentPage={1}
        totalPages={1}
        setCurrentPage={() => {}}
        onNextClick={handleNextClick} // Pass the handleNextClick function
      /> */}
    </div>
  );
};

export default Broadcastlogo;