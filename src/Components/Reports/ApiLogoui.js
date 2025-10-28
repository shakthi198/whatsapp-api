import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import apiEndpoints from "../../apiconfig";

const UserApiReport = () => {
  const [data, setData] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [usage, setUsage] = useState({ used: 0, total: 1000 });
  const [phone, setPhone] = useState(localStorage.getItem("waba_number") || "");

  const columns = [
    "S.No",
    "Message ID",
    "Message",
    "Recipient Number",
    "Status",
    "Timestamp",
  ];

  // Fetch API Logs
  const fetchLogs = async () => {
    if (!phone) return;
    try {
      const res = await fetch(
        `${apiEndpoints.whatsappLog}?phone=${encodeURIComponent(phone)}`
      );
      const json = await res.json();
      console.log("Fetched data:", json);

      if (json.status) {
        setData(json.data || []);
        setUserInfo(json.customer || null);
      } else {
        setData([]);
        setUserInfo(json.customer || null);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [phone]);

  // Calculate usage percentage
  const usagePercentage = (usage.used / usage.total) * 100;

  // Prepare Chart Data
  const chartData = Object.values(
    data.reduce((acc, item) => {
      const date = new Date(item.timestamp * 1000).toISOString().split("T")[0];
      if (!acc[date])
        acc[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0 };
      acc[date][item.status] = (acc[date][item.status] || 0) + 1;
      return acc;
    }, {})
  );

  // Prepare Table Data
  const modifiedData = data.map((item, index) => {
    const formattedTime = new Date(
      item.timestamp.toString().length === 10
        ? item.timestamp * 1000
        : item.timestamp
    ).toLocaleString();

    return {
      "S.No": index + 1,
      "Message ID": item.message_id,
      Message: item.message_text || "-",
      "Recipient Number": item.recipient_id,
      Status: (
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
      Timestamp: formattedTime,
    };
  });

  return (
    <div
      className="p-6 bg-gray-100 xl:w-full lg:w-2xl md:w-md"
      style={{ fontFamily: "Montserrat" }}
    >
      {/* Header*/}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
          Reports
        </h2>
        <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
          <div className="flex items-center text-lg text-gray-600 flex-wrap gap-1">
            <span className="hidden md:inline">|</span>
          </div>
          <span className="whitespace-nowrap">Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="whitespace-nowrap">Reports</span>
        </div>
      </div>
      {/* <Card
        sx={{
          mb: 4,
          boxShadow: 4,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            style={{ fontFamily: "Montserrat" }}
          >
            {userInfo?.companyName || "User"} — WhatsApp API Report
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ opacity: 0.9 }}
            style={{ fontFamily: "Montserrat" }}
          >
            Registered Number: <b>{phone || "-"}</b>
          </Typography>
        </CardContent>
      </Card>  */}

      {/* Summary + Usage Cards */}
      {/* SUMMARY CARDS */}
      {/* SUMMARY CARDS */}
      <Grid container spacing={2} mb={4}>
        {[
          {
            label: "Sent",
            key: "sent",
            color: "#fbbf24",
            bg: "rgba(251,191,36,0.1)",
          },
          {
            label: "Delivered",
            key: "delivered",
            color: "#22c55e",
            bg: "rgba(34,197,94,0.1)",
          },
          {
            label: "Read",
            key: "read",
            color: "#3b82f6",
            bg: "rgba(59,130,246,0.1)",
          },
          {
            label: "Failed",
            key: "failed",
            color: "#ef4444",
            bg: "rgba(239,68,68,0.1)",
          },
          {
            label: "Usage",
            key: "usage",
            color: "#8b5cf6",
            bg: "rgba(139,92,246,0.1)",
          },
        ].map(({ label, key, color, bg }) => {
          let value = 0;
          if (key === "usage") value = `${usage.used} / ${usage.total}`;
          else value = data.filter((d) => d.status === key).length;

          return (
           <Grid item xs={12} sm={4} md={4} lg={2.4} key={key}>

              <Card
                sx={{
                  textAlign: "center",
                  borderRadius: 3,
                  backgroundColor: bg,
                  boxShadow: 2,
                  p: 1,
                  height: "100%",
                  "&:hover": { transform: "scale(1.03)" },
                  transition: "all 0.2s ease",
                }}
              >
                <CardContent sx={{ p: "12px !important" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#333",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="h6" sx={{ color, fontWeight: "bold" }}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Usage Card
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Usage Overview
          </Typography>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e2e8f0",
              "& .MuiLinearProgress-bar": { backgroundColor: "#3b82f6" },
            }}
          />
          <Typography align="center" sx={{ mt: 1.5, color: "#555" }}>
            {usage.used} / {usage.total} Messages Used (
            {usagePercentage.toFixed(1)}%)
          </Typography>
        </CardContent>
      </Card> */}

      {/* Chart */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2 }}
            style={{ fontFamily: "Montserrat" }}
          >
            Message Delivery Trends
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Apilogoschartui data={chartData} tableData={modifiedData} />
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2 }}
            style={{ fontFamily: "Montserrat" }}
          >
            Detailed Message Logs
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ReusableTable columns={columns} data={modifiedData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApiReport;