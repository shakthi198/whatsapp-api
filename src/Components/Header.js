import React, { useState, useEffect } from "react";


import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { FiPower } from "react-icons/fi";
import { FaRegFlag } from "react-icons/fa";
import { IoMoon, IoSunny } from "react-icons/io5";
import { MdAccountCircle, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";


const Header = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();


  // Profile dropdown state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Responsive behavior


  // State for API Data (Using Dummy Data Initially)
  const [user, setUser] = useState({
    name: "Elcodamics",
    profileImage: "https://via.placeholder.com/40", // Dummy image (replace with API data)
  });

  const [wabaData, setWabaData] = useState({
    number: "919876543210",
    status: "Live",
    quality: "GREEN",
    tier: "MSG_1000 LIMIT",
  });

  // Fetch data from API (Dummy for Now)
  useEffect(() => {
    // Simulate API call (Replace this with actual API call)
    setTimeout(() => {
      setWabaData({
        number: "919363013413", // Replace with actual WABA number
        status: "Live",
        quality: "GREEN",
        tier: "MSG_1000 LIMIT",
      });
    }, 2000); // Simulate API delay (Remove this in actual implementation)
  }, []);

  return (
    <Box
      sx={{
        position: "sticky",
        top: "16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        padding: { xs: "12px", sm: "10px 20px" },
        background: darkMode ? "#222" : "rgba(255, 255, 255, 0.98)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)",
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        color: darkMode ? "#fff" : "#333",
        marginBottom: "20px",
      }}
    >
      {/* Left Section - WABA Info */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: "12px", sm: "24px", md: "60px" },
        }}
      >
        {/* WABA Number */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              fontSize: { xs: "14px", sm: "15px", md: "16px" },
            }}
          >
            <FaRegFlag size={20} style={{ marginRight: 6, color: "#D6B76F" }} />
            WABA:
            <Typography
              sx={{  fontSize: { xs: "14px", sm: "15px", md: "16px" }, marginLeft: "12px" }}
            >
              {wabaData.number}
            </Typography>
          </Typography>
        </Box>

        {/* Status */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              fontSize: { xs: "14px", sm: "15px", md: "16px" },
            }}
          >
            <FiPower size={20} style={{ marginRight: 6, color: "#FFA500" }} />
            Status:
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
                marginLeft: "12px",
                color: wabaData.status === "Live" ? "green" : "red",
              }}
            >
              {wabaData.status}
            </Typography>
          </Typography>
        </Box>

        {/* Quality */}
        { (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
              }}
            >
              Quality:
              <Typography
                sx={{  fontSize: { xs: "14px", sm: "15px", md: "16px" },marginLeft: "12px", color: "green" }}
              >
                {wabaData.quality}
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Tier */}
        {(
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
              }}
            >
              Tier:
              <Typography sx={{  fontSize: { xs: "14px", sm: "15px", md: "16px" }, marginLeft: "12px" }}>
                {wabaData.tier}
              </Typography>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Right Section - Profile & Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Dark Mode Toggle */}
        <IconButton onClick={toggleDarkMode} sx={{ color: darkMode ? "#FFD700" : "#333" }}>
          {darkMode ? <IoSunny size={24} /> : <IoMoon size={24} />}
        </IconButton>

        {/* User Name (Hidden on Mobile) */}
        {(
          <Typography sx={{ fontWeight: "bold", fontSize: { xs: "14px", sm: "15px", md: "16px" },}}>
            {user.name}
          </Typography>
        )}

        {/* Profile Image */}
        <IconButton onClick={handleProfileClick}>
          <Avatar src={user.profileImage} sx={{ width: 40, height: 40 }} />
        </IconButton>

        {/* Profile Dropdown */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => navigate("/profile")} sx={{ fontSize: "16px" }}>
            <MdAccountCircle size={20} style={{ marginRight: "10px" }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate("/login")} sx={{ color: "red", fontSize: "16px" }}>
            <MdLogout size={20} style={{ marginRight: "10px" }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
