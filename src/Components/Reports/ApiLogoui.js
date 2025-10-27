import React, { useEffect, useState } from "react";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import apiEndpoints from "../../apiconfig";
const ApiLogoui = () => {
  const [data, setData] = useState([]);
  const [phone, setPhone] = useState(localStorage.getItem("waba_number") || ""); // auto from login

  // Table column headers for message-level data
  const columns = ["S.No", "Message ID", "Message", "Recipient Number", "Status", "Timestamp"];

  // Fetch WhatsApp message statuses by phone number
  const fetchLogs = () => {
    if (!phone) return; // prevent empty fetch
     const url = `${apiEndpoints.whatsappLog}?phone=${encodeURIComponent(phone)}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.status) {
          setData(res.data);
        } else {
          setData([]);
          console.error("Failed to fetch logs:", res.message);
        }
      })
      .catch((err) => console.error("Failed to fetch logs:", err));
  };

  useEffect(() => {
    fetchLogs();
  }, [phone]);

  // --- Group data by date for chart ---
  const chartData = Object.values(
    data.reduce((acc, item) => {
      const date = new Date(item.timestamp * 1000).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!acc[date]) acc[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0 };

      if (item.status === "sent") acc[date].sent += 1;
      else if (item.status === "delivered") acc[date].delivered += 1;
      else if (item.status === "read") acc[date].read += 1;
      else acc[date].failed += 1;

      return acc;
    }, {})
  );

  // --- Modify data for table display ---
  const modifiedData = data.map((item, index) => ({
    "S.No": index + 1,
    "Message ID": item.message_id,
    "Message": item.message_text || "-", // show "-" if no message
    "Recipient Number": item.recipient_id,
    "Status": (
      <span
        className={`px-2 py-1 text-white font-semibold rounded ${
          item.status === "delivered"
            ? "bg-green-500"
            : item.status === "read"
            ? "bg-blue-500"
            : item.status === "sent"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      >
        {item.status}
      </span>
    ),
    "Timestamp": new Date(item.timestamp * 1000).toLocaleString(),
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0">WhatsApp API Logs</h2>
        {/* Phone number input */}
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter WhatsApp number"
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={fetchLogs}
            className="bg-yellow-600 text-white px-3 py-1 rounded"
          >
            Fetch Logs
          </button>
        </div>
      </div>

      {/* Delivery Chart */}
      <div className="mb-4">
        <Apilogoschartui data={chartData} tableData={modifiedData} />
      </div>

      {/* Table Component */}
      <div>
        <ReusableTable
          columns={columns}
          data={modifiedData}
          fontFamily="'Montserrat', sans-serif"
        />
      </div>
    </div>
  );
};

export default ApiLogoui;
