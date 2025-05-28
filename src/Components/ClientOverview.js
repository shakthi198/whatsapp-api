import React from "react";
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
  return (
    <Box sx={{ marginTop: "30px", fontFamily: "Montserrat, sans-serif" }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: "medium", 
          marginBottom: "20px",
          fontFamily: "Montserrat, sans-serif" 
        }}
      >
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: "bold", 
                    marginBottom: "10px",
                    fontFamily: "Montserrat, sans-serif" 
                  }}
                >
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
                    <Typography variant="h6" sx={{ fontFamily: "Montserrat, sans-serif" }}> 
                      {data.sent} 
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "Montserrat, sans-serif" }}>
                      Sent
                    </Typography>
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
                    <Typography variant="h6" sx={{ fontFamily: "Montserrat, sans-serif" }}> 
                      {data.delivered} 
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "Montserrat, sans-serif" }}>
                      Delivered
                    </Typography>
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
                    <Typography variant="h6" sx={{ fontFamily: "Montserrat, sans-serif" }}> 
                      {data.read} 
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "Montserrat, sans-serif" }}>
                      Read
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClientOverview;