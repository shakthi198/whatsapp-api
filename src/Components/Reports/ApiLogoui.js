import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  TextField,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import { HiChevronRight } from "react-icons/hi";
import Apilogoschartui from "../../Dynamic Components/Apilogochartui";
import ReusableTable from "../../Dynamic Components/ReusableTable";
import apiEndpoints from "../../apiconfig";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8b5cf6", "#22c55e", "#3b82f6"]; // Marketing, Authentication, Utility

const UserApiReport = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ sent: 0, delivered: 0, read: 0 });
  const [activeSlice, setActiveSlice] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterType, setFilterType] = useState("date");
  const [usage, setUsage] = useState({ used: 0, total: 1000 }); // NEW

  const fetchLogs = async () => {
    try {
      let url = `${apiEndpoints.Reports}`;
      const params = [];

      if (fromDate) params.push(`fromDate=${encodeURIComponent(fromDate)}`);
      if (toDate) params.push(`toDate=${encodeURIComponent(toDate)}`);
      if (filterType) params.push(`filterType=${encodeURIComponent(filterType)}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.status) {
        setData(json.data || []);
        if (json.summary) setSummary(json.summary);
      } else {
        console.error("Failed:", json.message);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const chartData = Object.values(
    data.reduce((acc, item) => {
      const date = new Date(item.timestamp * 1000).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, sent: 0, delivered: 0, read: 0 };
      acc[date][item.status] = (acc[date][item.status] || 0) + 1;
      return acc;
    }, {})
  );

  const pieData = useMemo(() => {
    const categoriesFromItems = data.reduce(
      (acc, it) => {
        const cat = (it.category || "").toLowerCase();
        if (cat.includes("market")) acc.marketing++;
        else if (cat.includes("auth")) acc.authentication++;
        else if (cat.includes("util")) acc.utility++;
        return acc;
      },
      { marketing: 0, authentication: 0, utility: 0 }
    );

    if (
      categoriesFromItems.marketing +
        categoriesFromItems.authentication +
        categoriesFromItems.utility >
      0
    ) {
      return [
        { name: "Marketing", value: categoriesFromItems.marketing },
        { name: "Authentication", value: categoriesFromItems.authentication },
        { name: "Utility", value: categoriesFromItems.utility },
      ];
    }

    return [
      { name: "Marketing", value: Math.max(summary.sent || 0, 0) },
      { name: "Authentication", value: Math.max(summary.delivered || 0, 0) },
      { name: "Utility", value: Math.max(summary.read || 0, 0) },
    ];
  }, [data, summary]);

  const modifiedData = data.map((item, index) => {
    const formattedTime =
      item.timestamp.toString().length === 10
        ? new Date(item.timestamp * 1000).toLocaleString()
        : new Date(item.timestamp).toLocaleString();

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
      __raw: item,
    };
  });

  return (
    <div className="w-full py-6" style={{ fontFamily: "Montserrat", overflowX: "hidden" }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700">Reports</h2>
        <div className="flex items-center text-yellow-600 text-md gap-1">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span>Reports</span>
        </div>
      </div>

      {/* Filters (Responsive Fixed Section) */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 4, overflowX: "hidden" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Filter Type"
                fullWidth
                size="small"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={fetchLogs}
                sx={{
                  height: "40px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        {[
          {
            label: "Sent",
            key: "sent",
            color: "#FBBF24",
            bg: "rgba(251,191,36,0.1)",
          },
          {
            label: "Delivered",
            key: "delivered",
            color: "#22C55E",
            bg: "rgba(34,197,94,0.1)",
          },
          {
            label: "Read",
            key: "read",
            color: "#3B82F6",
            bg: "rgba(59,130,246,0.1)",
          },
          {
            label: "Failed",
            key: "failed",
            color: "#EF4444",
            bg: "rgba(239,68,68,0.1)",
          },
          {
            label: "Usage",
            key: "usage",
            color: "#8B5CF6",
            bg: "rgba(139,92,246,0.1)",
          },
        ].map(({ label, key, color, bg }) => {
          let value = 0;
          if (key === "usage") value = `${usage.used} / ${usage.total}`;
          else value = data.filter((d) => d.status === key).length;
          return (
            <Grid
              item
              sx={{
                width: {
                  xs: "100%",
                  sm: "50%",
                  md: "50%",
                  lg: "20%",
                  xl: "20%",
                },
              }}
              key={key}
            >
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent sx={{ overflowX: "hidden" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Message Delivery Trends
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ width: "100%", height: { xs: 250, md: 350 } }}>
                <Apilogoschartui data={chartData} tableData={data} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflowX: "hidden",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Message Category Distribution
              </Typography>
              <Divider sx={{ mb: 2, width: "100%" }} />
              <Box
                sx={{
                  width: "100%",
                  height: { xs: 200, md: 260 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ReTooltip />
                    <ReLegend verticalAlign="bottom" height={36} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={80}
                      onClick={(e) => setActiveSlice(e?.name || null)}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Section */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ overflowX: "auto" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Detailed Message Logs
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ width: "100%", minWidth: "700px" }}>
            <ReusableTable
              columns={[
                "S.No",
                "Message ID",
                "Message",
                "Recipient Number",
                "Status",
                "Timestamp",
              ]}
              data={modifiedData}
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApiReport;
