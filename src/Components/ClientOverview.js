import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import LoopIcon from "@mui/icons-material/Loop";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const clientData = [
  {
    title: "Overview Summary of Broadcast Message",
    sent: 0,
    delivered: 0,
    read: 0,
  },
  {
    title: "Overview Summary of API Message",
    sent: 0,
    delivered: 0,
    read: 0,
  },
];

const ClientOverview = () => {
  // Commenting out the state variables
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");

  return (
    <Box sx={{ marginTop: "30px" }}>
      <Typography variant="h5" sx={{ fontWeight: "medium", marginBottom: "20px" }}>
        Client Overview
      </Typography>
      <Grid container spacing={3}>
        {clientData.map((data, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                  {data.title}
                </Typography>

                {/* Icons & Data */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#F0F0F0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "#888" }} />
                    </Box>
                    <Typography variant="h6"> {data.sent} </Typography>
                    <Typography variant="body2">Sent</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#F0F0F0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <LoopIcon sx={{ color: "#888" }} />
                    </Box>
                    <Typography variant="h6"> {data.delivered} </Typography>
                    <Typography variant="body2">Delivered</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#F0F0F0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <RemoveRedEyeIcon sx={{ color: "#888" }} />
                    </Box>
                    <Typography variant="h6"> {data.read} </Typography>
                    <Typography variant="body2">Read</Typography>
                  </Grid>
                </Grid>

                {/* Last 7 Days Report + Date Picker Box */}
                {/* 
                <Box sx={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold", flex: 1 }}>
                    Last 7 days Report
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      gap: "10px",
                      backgroundColor: "#F8F8F8",
                      opacity: 0.6,
                    }}
                  >
                    <TextField
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: "14px", color: startDate ? "#000" : "#999" },
                      }}
                      placeholder="Start date"
                      sx={{ minWidth: "100px" }}
                    />
                    <Typography variant="body2"> ➝ </Typography>

                    <TextField
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: "14px", color: endDate ? "#000" : "#999" },
                      }}
                      placeholder="End date"
                      sx={{ minWidth: "100px" }}
                    />

                    <IconButton sx={{ backgroundColor: "transparent", padding: "6px" }}>
                      <CalendarMonthIcon sx={{ color: "#666" }} />
                    </IconButton>
                  </Box>
                </Box>
                */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClientOverview;
