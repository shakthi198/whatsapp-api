import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaDownload } from "react-icons/fa";

const Apilogoschartui = ({ data, tableData }) => {
  // CSV download for full message-level table
const handleDownload = () => {
  if (!tableData || !tableData.length) return;

  // Add S.No manually
  const headers = ["S.No", ...Object.keys(tableData[0])];

  const rows = tableData.map((row, index) =>
    [index + 1, ...headers.slice(1).map((field) => {
      let val = row[field];

      // If React element, extract text
      if (typeof val === "object" && val?.props) {
        val = val.props.children;
        if (Array.isArray(val)) val = val.join("");
      }

      // Format numbers as text for Excel
      if (field === "Recipient Number") {
        val = `'${val}`;
      }

      // Format timestamp nicely
      else if (field === "Timestamp") {
        const dateObj = new Date(val);
        const options = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        };
        val = `"${dateObj.toLocaleString("en-US", options)}"`;
      }

      // Escape quotes in strings
      else if (typeof val === "string") {
        val = `"${val.replace(/"/g, '""')}"`;
      }

      return val;
    })].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "WhatsAppLogs_FullTable.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


  return (
    <div className="w-full p-4 sm:p-6 bg-white shadow-lg rounded-md">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-700">
          WhatsApp Delivery Report
        </h2>
        <button
          onClick={handleDownload}
          className="bg-green-500 text-white px-4 py-2 flex items-center gap-1 rounded hover:bg-green-600"
        >
          <FaDownload /> Download Full Table
        </button>
      </div>

      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="sent" stackId="a" fill="#facc15" name="Sent" />
          <Bar dataKey="delivered" stackId="a" fill="#22c55e" name="Delivered" />
          <Bar dataKey="read" stackId="a" fill="#3b82f6" name="Read" />
          <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Apilogoschartui;
