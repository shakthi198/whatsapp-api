import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Grid, LinearProgress } from "@mui/material";
import { FiUsers, FiTool, FiBell, FiSmile, FiCheckCircle } from "react-icons/fi";
import { MdSupportAgent, MdAssignment, MdPendingActions, MdOutlineCancel } from "react-icons/md";
import CardComponent from "../Components/Card.js";
import ClientOverview from "../Components/ClientOverview";
import Header from "../Components/Header.js";

const Dashboard = () => {
  const navigate = useNavigate();

  const [cardData, setCardData] = useState({
    marketing: 0,
    userInitiated: 0,
    authentication: 0,
    businessInitiated: 0,
    utility: 0,
    total: 0,
    openTicket: 0,
    pending: 0,
    solved: 0,
    expired: 0,
  });

  const [currentPlan, setCurrentPlan] = useState({
    planName: "Current Plan",
    features: "No features available.",
    upgradeText: "Upgrade Now",
  });

  const [usage, setUsage] = useState({
    used: 0,
    total: 1000,
  });

  useEffect(() => {
    fetch("YOUR_API_ENDPOINT") // Replace with actual API
      .then((response) => response.json())
      .then((data) => {
        setCardData({
          marketing: data.marketing || 0,
          userInitiated: data.userInitiated || 0,
          authentication: data.authentication || 0,
          businessInitiated: data.businessInitiated || 0,
          utility: data.utility || 0,
          total: data.total || 0,
          openTicket: data.openTicket || 0,
          pending: data.pending || 0,
          solved: data.solved || 0,
          expired: data.expired || 0,
        });
      })
      .catch((error) => console.error("Error fetching card data:", error));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setCurrentPlan({
        planName: "Current Plan",
        features: "No features available.",
        upgradeText: "Upgrade Now",
      });

      setUsage({
        used: 1, // Change dynamically based on API data
        total: 1000,
      });
    }, 1000);
  }, []);

  const usagePercentage = (usage.used / usage.total) * 100;

  const cardsData = useMemo(() => ({
    Overview: [
      { icon: <MdSupportAgent size={50} color="#0077B6" />, title: "Marketing", value: cardData.marketing, backgroundColor: "#B3E5FC", path: "/dashboard" },
      { icon: <FiUsers size={50} color="#028A0F" />, title: "User Initiated", value: cardData.userInitiated, backgroundColor: "#C8E6C9", path: "/dashboard" },
      { icon: <FiBell size={50} color="#D32F2F" />, title: "Authentication", value: cardData.authentication, backgroundColor: "#FFCDD2", path: "/notifications" },
      { icon: <MdAssignment size={50} color="#FBBF24" />, title: "Business Initiated", value: cardData.businessInitiated, backgroundColor: "#FFF3CD", path: "/sessions" },
      { icon: <FiTool size={50} color="#6C757D" />, title: "Utility", value: cardData.utility, backgroundColor: "#E9ECEF", path: "/utility" },
      { icon: <FiSmile size={50} color="#6D28D9" />, title: "Total", value: cardData.total, backgroundColor: "#E0E7FF", path: "/user-management/user-details" },
      { icon: <MdSupportAgent size={50} color="#0077B6" />, title: "Open Ticket", value: cardData.openTicket, backgroundColor: "#B3E5FC", path: "/open-tickets" },
      { icon: <MdPendingActions size={50} color="#028A0F" />, title: "Pending", value: cardData.pending, backgroundColor: "#C8E6C9", path: "/pending-tickets" },
      { icon: <FiCheckCircle size={50} color="#D32F2F" />, title: "Solved", value: cardData.solved, backgroundColor: "#FFCDD2", path: "/solved-tickets" },
      { icon: <MdOutlineCancel size={50} color="#FBBF24" />, title: "Expired", value: cardData.expired, backgroundColor: "#FFF3CD", path: "/expired-tickets" },
    ],
  }), [cardData]);

  return (
    <Box sx={{ padding: "6px", marginTop: "10px" }}>
      <Typography variant="h5" sx={{ fontWeight: "medium", marginBottom: "20px", fontFamily: "Montserrat, sans-serif" }}>
        Account Overview
      </Typography>

      <Grid container spacing={3}>
        {/* INR Balance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "20px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", backgroundColor: "rgb(232, 232, 232)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "medium", color: "#333", fontFamily: "Montserrat, sans-serif" }}>
                Hello Elcodamics!
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "medium", marginTop: "10px", fontFamily: "Montserrat, sans-serif" }}>
                INR 5.49
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Upgrade Plan Card with Navigation */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ padding: "7px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", backgroundColor: "#FAF3E0" }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "medium", color: "#333", fontFamily: "Montserrat, sans-serif" }}>
                {currentPlan.planName}
              </Typography>
              <Typography sx={{ marginBottom: "10px", color: "#666", fontFamily: "Montserrat, sans-serif" }}>
                {currentPlan.features}
              </Typography>
              <button 
                onClick={() => navigate("/upgrade")}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  backgroundColor: "#D6B76F",
                  border: "none",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                {currentPlan.upgradeText}
              </button>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Card with Navigation */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ padding: "19px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", backgroundColor: "#E3F2FD", cursor: "pointer" }}
            onClick={() => navigate("/usage")}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "medium", color: "#333", fontFamily: "Montserrat, sans-serif" }}>
                Usage
              </Typography>
              <LinearProgress variant="determinate" value={usagePercentage} sx={{ height: "10px", borderRadius: "5px", marginTop: "10px" }} />
              <Typography sx={{ marginTop: "10px", color: "#666", textAlign: "center", fontFamily: "Montserrat, sans-serif" }}>
                {usage.used} out of {usage.total} ({usagePercentage.toFixed(1)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: "medium", marginTop: "30px", marginBottom: "20px", fontFamily: "Montserrat, sans-serif" }}>
        Dashboard Overview
      </Typography>
      <CardComponent cards={cardsData.Overview} isScrollable={false} />
      <ClientOverview />
    </Box>
  );
};

export default Dashboard;