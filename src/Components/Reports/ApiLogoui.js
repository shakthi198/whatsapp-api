import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, LinearProgress, Grid, Box } from "@mui/material";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import apiEndpoints from "../../apiconfig";

const UserApiReport = () => {
  const [data, setData] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [usage, setUsage] = useState({ used: 0, total: 1000 });
  const [phone, setPhone] = useState(localStorage.getItem("waba_number") || "");

  const columns = ["S.No", "Message ID", "Message", "Recipient Number", "Status", "Timestamp"];

  // Fetch API Logs
  const fetchLogs = async () => {
    if (!phone) return;
    try {
      const res = await fetch(
        `${apiEndpoints.whatsapplogapi}?phone=${encodeURIComponent(phone)}`
      );
      const json = await res.json();
      if (json.status) setData(json.data);
      else setData([]);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  // Fetch user info (from DB or API)
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(
        `${apiEndpoints.getinfophp}?phone=${encodeURIComponent(phone)}`
      );
      const json = await res.json();
      if (json.status) setUserInfo(json.data);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchUserInfo();
  }, [phone]);

  // Calculate usage percentage
  const usagePercentage = (usage.used / usage.total) * 100;

  // Prepare Chart Data
  const chartData = Object.values(
    data.reduce((acc, item) => {
      const date = new Date(item.timestamp * 1000).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0 };
      acc[date][item.status] = (acc[date][item.status] || 0) + 1;
      return acc;
    }, {})
  );

  // Prepare Table Data
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
      className="max-w-full sm:max-w-7xl mx-auto p-4"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#333" }}>
            {userInfo?.companyName || "User"} — WhatsApp API Report
          </Typography>
          <Typography sx={{ color: "#666" }}>
            Registered Number: <b>{phone || "-"}</b>
          </Typography>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {["sent", "delivered", "read", "failed"].map((status) => {
          const count = data.filter((d) => d.status === status).length;
          const colorMap = {
            sent: "#fbbf24",
            delivered: "#22c55e",
            read: "#3b82f6",
            failed: "#ef4444",
          };
          return (
            <Grid item xs={6} md={3} key={status}>
              <Card sx={{ textAlign: "center", boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: colorMap[status], fontWeight: "bold" }}>
                    {count}
                  </Typography>
                  <Typography sx={{ color: "#555" }}>{status.toUpperCase()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Usage Progress */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "medium", color: "#333" }}>
            Usage
          </Typography>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            sx={{ height: "10px", borderRadius: "5px", mt: 1.5 }}
          />
          <Typography sx={{ mt: 1, color: "#666", textAlign: "center" }}>
            {usage.used} out of {usage.total} ({usagePercentage.toFixed(1)}%)
          </Typography>
        </CardContent>
      </Card>

      {/* Delivery Chart */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
            Message Delivery Trends
          </Typography>
          <Apilogoschartui data={chartData} tableData={modifiedData} />
        </CardContent>
      </Card>

      {/* Table Component */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
            Detailed Message Logs
          </Typography>
          <ReusableTable columns={columns} data={modifiedData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApiReport;
