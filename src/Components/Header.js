import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { FiPower } from "react-icons/fi";
import { FaRegFlag } from "react-icons/fa";
import { MdAccountCircle, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const [user, setUser] = useState({
    name: "Elcodamics",
    profileImage: "https://via.placeholder.com/40",
  });

  const [wabaData, setWabaData] = useState({
    number: "919876543210",
    status: "Live",
    // quality: "GREEN",
    // tier: "MSG_1000 LIMIT",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    setTimeout(() => {
      setWabaData({
        number: "919363013413",
        status: "Live",
        quality: "GREEN",
        tier: "MSG_1000 LIMIT",
      });
    }, 2000);
  }, []);

  return (
    <Box
      sx={{
        position: "sticky",
        top: "16px",
        zIndex: 10,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        padding: { xs: "12px", sm: "10px 20px" },
        background: "rgba(255, 255, 255, 0.98)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)",
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        color: "#333",
        marginBottom: "20px",
      }}
    >
      {/* Left Section */}
      <Box sx={{ flex: isMobile || isTablet ? 0 : 1 }}>
        {!isMobile && !isTablet && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "montserrat",
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
                  fontFamily: "montserrat",
                  alignItems: "center",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                <FaRegFlag
                  size={20}
                  style={{ marginRight: 6, color: "#D6B76F" }}
                />
                WABA:
                <Typography
                  sx={{
                    fontSize: { xs: "14px", sm: "15px", md: "16px" },
                    marginLeft: "12px",
                    fontFamily: "montserrat",
                  }}
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
                  fontFamily: "montserrat",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                <FiPower
                  size={20}
                  style={{ marginRight: 6, color: "#FFA500" }}
                />
                Status:
                <Typography
                  sx={{
                    fontSize: { xs: "14px", sm: "15px", md: "16px" },
                    marginLeft: "12px",
                    fontFamily: "montserrat",
                    color: wabaData.status === "Live" ? "green" : "red",
                  }}
                >
                  {wabaData.status}
                </Typography>
              </Typography>
            </Box>

            {/* Quality */}
            {/* <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "montserrat",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                Quality:
                <Typography
                  sx={{
                    fontSize: { xs: "14px", sm: "15px", md: "16px" },
                    marginLeft: "12px",
                    color: "green",
                    fontFamily: "montserrat",
                  }}
                >
                  {wabaData.quality}
                </Typography>
              </Typography>
            </Box> */}

            {/* Tier */}
            {/* <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "montserrat",
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                }}
              >
                Tier:
                <Typography
                  sx={{
                    fontSize: { xs: "14px", sm: "15px", md: "16px" },
                    marginLeft: "12px",
                    fontFamily: "montserrat",
                  }}
                >
                  {wabaData.tier}
                </Typography>
              </Typography>
            </Box> */}
          </Box>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!isMobile && (
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "14px", sm: "15px", md: "16px" },
              fontFamily: "montserrat",
            }}
          >
            {user.name}
          </Typography>
        )}
        <IconButton onClick={handleProfileClick}>
          <Avatar src={user.profileImage} sx={{ width: 40, height: 40 }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: isMobile || isTablet ? 280 : 200,
              padding: "5px",
              borderRadius: "8px",
              marginTop: "13px",
            },
          }}
        >
          {(isMobile || isTablet) && (
            <>
              <Box borderRadius={"30px"} sx={{ padding: "8px 16px" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", fontFamily: "montserrat" }}
                >
                  WABA Details
                </Typography>

                <Box sx={{ padding: "4px 16px" }}>
                  <Box sx={{ display: "flex", mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "montserrat",
                        fontWeight: "bold",
                        minWidth: "60px",
                      }}
                    >
                      WABA
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mx: 1, fontFamily: "montserrat" }}
                    >
                      :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "montserrat" }}
                    >
                      {wabaData.number}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "montserrat",
                        fontWeight: "bold",
                        minWidth: "60px",
                      }}
                    >
                      Status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mx: 1, fontFamily: "montserrat" }}
                    >
                      :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "montserrat",
                        color: wabaData.status === "Live" ? "green" : "red",
                      }}
                    >
                      {wabaData.status}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "montserrat",
                        fontWeight: "bold",
                        minWidth: "60px",
                      }}
                    >
                      Quality
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mx: 1, fontFamily: "montserrat" }}
                    >
                      :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "montserrat", color: "green" }}
                    >
                      {wabaData.quality}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "montserrat",
                        fontWeight: "bold",
                        minWidth: "60px",
                      }}
                    >
                      Tier
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mx: 1, fontFamily: "montserrat" }}
                    >
                      :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "montserrat" }}
                    >
                      {wabaData.tier}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
            </>
          )}

          <MenuItem
            onClick={() => navigate("/profile")}
            sx={{ fontSize: "16px", fontFamily: "montserrat" }}
          >
            <MdAccountCircle size={20} style={{ marginRight: "10px" }} />
            Profile
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{ color: "red", fontSize: "16px", fontFamily: "montserrat" }}
          >
            <MdLogout size={20} style={{ marginRight: "10px" }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
