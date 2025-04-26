import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";

const DeliveryChartUI = () => {
  // Sample Data
  const reportData = [
    { date: "2025-03-07", delivered: 3200, failed: 300, read: 2800 },
    { date: "2025-03-08", delivered: 4100, failed: 400, read: 3500 },
    { date: "2025-03-09", delivered: 5000, failed: 600, read: 4200 },
    { date: "2025-03-10", delivered: 4800, failed: 500, read: 4300 },
    { date: "2025-03-11", delivered: 5200, failed: 700, read: 4800 },
    { date: "2025-03-12", delivered: 5300, failed: 600, read: 4900 },
    { date: "2025-03-13", delivered: 5400, failed: 500, read: 5000 },
  ];

  // State for start and end dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Handle date filtering
  const filteredData = reportData.filter((row) => {
    const rowDate = new Date(row.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (!start || rowDate >= start) &&
      (!end || rowDate <= end)
    );
  });

  // Function to download CSV report
  const handleDownload = () => {
    const dataToDownload = filteredData.length ? filteredData : reportData;

    // Prepare CSV content
    const csvContent = [
      ["Date", "Delivered", "Failed", "Read"].join(","),
      ...dataToDownload.map((row) =>
        [row.date, row.delivered, row.failed, row.read].join(",")
      ),
    ].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "delivery_report.csv";
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
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-500"
            placeholder="Start date"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
      <div className="w-full h-56 border-t border-gray-200 mb-9">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="border-b border-gray-200 h-8"></div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryChartUI;