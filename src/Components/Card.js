import React from "react";
import { Link } from "react-router-dom";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import "@fontsource/montserrat";



// Utility function to lighten a hex color
const lightenColor = (hex, percent) => {
  if (!hex) return "#FFFFFF"; // Default to white if no color is provided
  let num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round((255 - (num >> 16)) * percent);
  let g =
    ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * percent);
  let b = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * percent);
  return `rgb(${r}, ${g}, ${b})`;
  
};


const CardComponent = ({ cards, isScrollable }) => {
  return (
    <Box
      sx={{
        width: "100%",
        marginTop: 1,
        display: isScrollable ? "flex" : "block",
        overflowX: isScrollable ? "auto" : "unset",
        whiteSpace: isScrollable ? "nowrap" : "normal",
        scrollbarWidth: isScrollable ? "none" : "auto",
        "&::-webkit-scrollbar": isScrollable ? { display: "none" } : {},
      }}
    >
      {isScrollable ? (
        <Box sx={{ display: "flex", gap: "15px", paddingBottom: "10px" }}>
          {cards.map((card, index) => {
            if (card.customComponent)
              return <Box key={index}>{card.customComponent}</Box>;

            const hoverColor = lightenColor(card.backgroundColor, 0.5);
            return (
              <Box key={index} sx={{ flex: "0 0 auto", minWidth: "250px" }}>
                <Link
                  to={card.path}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "20px",
                      backgroundColor: card.backgroundColor || "white",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "none",
                      transition: "background-color 0.3s ease",
                      "&:hover": { backgroundColor: hoverColor },
                    }}
                  >
                    {card.icon}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: 500,
                          fontSize: "1rem",
                          color: "#000000",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: 600,
                          color: "#000000",
                          fontSize: "1.4rem",
                        }}
                      >
                        {card.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {cards.map((card, index) => {
            if (card.customComponent)
              return (
                <Grid item xs={12} key={index}>
                  {card.customComponent}
                </Grid>
              );

            const hoverColor = lightenColor(card.backgroundColor, 0.5);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
                <Link
                  to={card.path}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "20px",
                      backgroundColor: card.backgroundColor || "white",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "none",
                      transition: "background-color 0.3s ease",
                      "&:hover": { backgroundColor: hoverColor },
                      height: "100%",
                    }}
                  >
                    {card.icon}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: 500,
                          fontSize: "1rem",
                          color: "#000000",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: 600,
                          color: "#000000",
                          fontSize: "1.4rem",
                        }}
                      >
                        {card.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
  
};

export default CardComponent;
