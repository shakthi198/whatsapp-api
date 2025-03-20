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
      ["2025-03-13", 5400, 500, 5000]
    ];

    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "7_days_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-6 bg-white shadow-lg rounded-md">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-10">
          Delivery Chart for last 7 Days Report
        </h2>
        <div className="flex items-center gap-2 mb-10">
          <input
            type="date"
            className="border border-gray-300 p-2 rounded text-gray-500"
            placeholder="Start date"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded text-gray-500"
            placeholder="End date"
          />
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-4 py-2 flex items-center gap-1 rounded hover:bg-green-600"
          >
            <FaDownload /> Download Report
          </button>
        </div>
      </div>

      {/* Chart Placeholder Section */}
      <div className="w-full h-86 gap-6 border-gray-200 grid grid-rows-11 relative">
        {[...Array(11)].map((_, index) => (
          <div
            key={index}
            className="border-b p-1 border-gray-200 flex items-center relative"
          >
            <span className="absolute left-[-10px] top-2/2 transform -translate-y-1/2 font-semibold text-gray-500">{10 - index}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apilogochartui;