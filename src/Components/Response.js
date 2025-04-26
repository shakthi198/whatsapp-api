import React from "react";
import { HiChevronRight } from "react-icons/hi";

const Response = ({ goBack, selectedFlowName }) => {
  const handleDownload = () => {
    // Mock data for download
    const csvData = "Flow Name,Response\nTest,User response data";
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "responses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Whatsapp Flows</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Whatsapp Flows</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button className="py-2 px-4 text-gray-500 cursor-pointer" onClick={goBack}>
          Flows
        </button>
        <button className="py-2 px-4 border-b-2 border-[#DDA853] text-[#DDA853] font-medium">
          Responses
        </button>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 shadow-md rounded-t-md flex justify-between items-center border-b border-gray-300">
        {/* Display Selected Flow Name */}
        <div className="text-gray-700 text-2xl font-bold">
          {selectedFlowName || "No Flow Selected"}
        </div>

        {/* Download Responses Button */}
        <button
          className="bg-gray-400 text-white px-5 py-3 font-medium rounded-md cursor-not-allowed"
          onClick={handleDownload}
        >
          Download Responses
        </button>
      </div>

      {/* No Response Message */}
      <div className="bg-white p-4 rounded-b-md flex flex-col items-center justify-center h-60 text-center">
        <h3 className="text-2xl font-semibold text-gray-600">No Response to Show</h3>
        <p className="text-gray-400 text-md mt-1">
          No data is available for the selected flow. Please check back later or adjust your selection.
        </p>
      </div>
    </div>
  );
};

export default Response;