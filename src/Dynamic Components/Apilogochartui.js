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

    const headers = ["S.No", ...Object.keys(tableData[0])];

    const rows = tableData.map((row, index) =>
      [
        index + 1,
        ...headers.slice(1).map((field) => {
          let val = row[field];

          if (typeof val === "object" && val?.props) {
            val = val.props.children;
            if (Array.isArray(val)) val = val.join("");
          }

          if (field === "Recipient Number") val = `'${val}`;
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
          } else if (typeof val === "string") {
            val = `"${val.replace(/"/g, '""')}"`;
          }

          return val;
        }),
      ].join(",")
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
    <div className="w-full bg-white shadow-md rounded-xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <h2
          className="text-base sm:text-lg font-semibold text-gray-700"
          style={{ fontFamily: "Montserrat" }}
        >
          WhatsApp Delivery Report
        </h2>

        <button
          onClick={handleDownload}
          className="bg-yellow-600 text-white px-3 py-1.5 flex items-center gap-2 rounded-md hover:bg-green-600 transition-all duration-200 text-xs sm:text-sm"
          style={{ fontFamily: "Montserrat" }}
        >
          <FaDownload /> Download CSV
        </button>
      </div>

      {/* Chart Section - Smaller and responsive */}
      <div className="w-full h-[180px] sm:h-[220px] md:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip wrapperStyle={{ fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="sent" stackId="a" fill="#facc15" name="Sent" />
            <Bar
              dataKey="delivered"
              stackId="a"
              fill="#22c55e"
              name="Delivered"
            />
            <Bar dataKey="read" stackId="a" fill="#3b82f6" name="Read" />
            <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Apilogoschartui;
