import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import apiEndpoints from "../apiconfig";

const ReminderPopup = ({ token, onClose }) => {
  const yellow600 = "#d08700";
  const gray600 = "#4b5563";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    legal_business_name: "",
    legal_business_address: "",
    streetName: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    company_website: "",
    gstno: "",
  });

  useEffect(() => {
    if (!token) return;

    axios
      .post(
        `${apiEndpoints.getProfile}`,
        { action: "getProfile" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data.status === "success") {
          const user = res.data.user;
          setFormData((prev) => ({
            ...prev,
            legal_business_name: user.legal_business_name || "",
            legal_business_address: user.legal_business_address || "",
            streetName: user.streetName || "",
            city: user.city || "",
            state: user.state || "",
            country: user.country || "",
            pincode: user.pincode || "",
            company_website: user.company_website || "",
            gstno: user.gstno || "",
          }));
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    axios
      .post(
        `${apiEndpoints.getProfile}`,
        { ...formData, action: "update" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data.status === "success") {
          alert("Profile updated successfully!");
          onClose();
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => console.error("Profile update error:", err));
  };

  const requiredLabel = (label) => (
    <Typography sx={{ fontWeight: "medium", color: "#000", mb: 1, fontSize: isMobile ? "0.85rem" : "1rem" }}>
      {label} <span style={{ color: "red" }}>*</span>
    </Typography>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          p: isMobile ? 2 : 4,
          borderRadius: "8px",
          width: "100%",
          maxWidth: isMobile ? "95%" : "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
          color: gray600,
          position: "relative",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{ fontWeight: "bold", mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Complete your profile
        </Typography>

        {/* Close Button */}
        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            minWidth: "auto",
            color: gray600,
            fontSize: isMobile ? "1.25rem" : "1.5rem",
            p: 0.5,
          }}
        >
          ×
        </Button>

        {/* Form Fields */}
        <Grid container spacing={2}>
          {[
            { label: "Legal Business Name", name: "legal_business_name" },
            { label: "Legal Business Address", name: "legal_business_address", multiline: true, rows: 4 },
            { label: "Street Name", name: "streetName" },
            { label: "City", name: "city" },
            { label: "State", name: "state" },
            { label: "Country", name: "country"},
            { label: "Zip", name: "pincode" },
            { label: "Company Website", name: "company_website" },
            { label: "GST NO", name: "gstno" },
          ].map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              {requiredLabel(field.label)}
              <TextField
                fullWidth
                placeholder={`Enter ${field.label}`}
                variant="outlined"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                multiline={field.multiline || false}
                rows={field.rows || 1}
                select={field.select || false}
                size={isMobile ? "small" : "medium"}
              >
                {field.select &&
                  field.options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          ))}
        </Grid>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "flex-end",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            variant="text"
            onClick={onClose}
            sx={{
              color: gray600,
              textTransform: "none",
              fontSize: isMobile ? "0.85rem" : "1rem",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Remind me later
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: yellow600,
              color: "white",
              textTransform: "none",
              "&:hover": { bgcolor: yellow600 },
              fontSize: isMobile ? "0.85rem" : "1rem",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ReminderPopup;
