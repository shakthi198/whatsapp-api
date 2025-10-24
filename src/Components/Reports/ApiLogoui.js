import React, { useEffect, useState } from "react";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";

const ApiLogoui = () => {
  const [data, setData] = useState([]);
  const [phone, setPhone] = useState(localStorage.getItem("waba_number") || "");

  const columns = ["S.No", "Message ID", "Message", "Recipient Number", "Status", "Timestamp"];

  const fetchLogs = () => {
    if (!phone) return;
    fetch(`http://localhost/whatsapp_admin/whatsapp_log.php?phone=${encodeURIComponent(phone)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status) setData(res.data);
        else setData([]);
      })
      .catch((err) => console.error("Failed to fetch logs:", err));
  };

  useEffect(() => {
    fetchLogs();
  }, [phone]);

  const chartData = Object.values(
    data.reduce((acc, item) => {
      const date = new Date(item.timestamp * 1000).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0 };
      if (item.status === "sent") acc[date].sent += 1;
      else if (item.status === "delivered") acc[date].delivered += 1;
      else if (item.status === "read") acc[date].read += 1;
      else acc[date].failed += 1;
      return acc;
    }, {})
  );

  const modifiedData = data.map((item, index) => ({
    "S.No": index + 1,
    "Message ID": item.message_id,
    "Message": item.message_text || "-",
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
    <div
      className="xl:w-7xl lg:w-2xl md:w-md mx-auto p-4 md:p-6"
      style={{ fontFamily: "'Montserrat'" }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-medium truncate">WhatsApp API Logs</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter WhatsApp number"
            className="border px-2 py-1 rounded w-full sm:w-auto"
          />
          <button
            onClick={fetchLogs}
            className="bg-yellow-600 text-white px-3 py-1 rounded w-full sm:w-auto"
          >
            Fetch Logs
          </button>
        </div>
      </div>

      {/* Delivery Chart */}
      <div className="mb-4 overflow-x-auto">
        <Apilogoschartui data={chartData} tableData={modifiedData} />
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
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
