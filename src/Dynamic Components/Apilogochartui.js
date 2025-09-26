import React from "react";
import { FaDownload } from "react-icons/fa";

const Apilogochartui = () => {
  const handleDownload = () => {
    const data = [
      ["Date", "Delivered", "Failed", "Read"],
      ["2025-03-07", 3200, 300, 2800],
      ["2025-03-08", 4100, 400, 3500],
      ["2025-03-09", 5000, 600, 4200],
      ["2025-03-10", 4800, 500, 4300],
      ["2025-03-11", 5200, 700, 4800],
      ["2025-03-12", 5300, 600, 4900],
      ["2025-03-13", 5400, 500, 5000],
    ];

    const csvContent = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "7_days_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-white shadow-lg rounded-md">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
          Delivery Chart for Last 7 Days Report
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="date"
            className="border border-gray-300 p-2 rounded text-gray-600 text-sm sm:text-base w-full sm:w-auto"
          />
          <span className="text-gray-500 hidden sm:block">→</span>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded text-gray-600 text-sm sm:text-base w-full sm:w-auto"
          />
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-3 sm:px-4 py-2 flex items-center justify-center gap-1 rounded hover:bg-green-600 w-full sm:w-auto"
          >
            <FaDownload /> <span className="hidden sm:inline">Download Report</span>
          </button>
        </div>
      </div>

      {/* Chart Placeholder Section */}
      <div className="w-full h-64 sm:h-80 mt-6 grid grid-rows-11 border-l border-gray-200 relative">
        {[...Array(11)].map((_, index) => (
          <div
            key={index}
            className="border-b border-gray-200 flex items-center relative"
          >
            <span className="absolute -left-6 sm:-left-8 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-semibold text-gray-500">
              {10 - index}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apilogochartui;
