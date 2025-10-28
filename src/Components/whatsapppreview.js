import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const WhatsAppPreview = ({ templateData }) => {
  const { headerType, headerText, body, footer, buttons } = templateData || {};

  return (
    <Box
      border="1px solid #ccc"
      borderRadius="12px"
      overflow="hidden"
      sx={{
        backgroundColor: "#e5ddd5",
        height: "auto",
        width: "100%",
        maxWidth: { xs: "100%", sm: 400, md: 500 },
        minHeight: 350,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* WhatsApp Green Header */}
      <Box
        bgcolor="#075e54"
        color="white"
        p={{ xs: 1, sm: 1.5 }}
        textAlign="center"
        fontSize={{ xs: "0.9rem", sm: "1rem" }}
      >
        WhatsApp Preview
      </Box>

      {/* Message Bubble */}
      <Box
        p={{ xs: 1.5, sm: 2 }}
        flex="1"
        display="flex"
        alignItems="flex-start"
      >
        <Box
          bgcolor="#dcf8c6"
          borderRadius="12px"
          px={{ xs: 1.5, sm: 2 }}
          py={{ xs: 1, sm: 1.5 }}
          maxWidth="85%"
          sx={{
            wordWrap: "break-word",
          }}
        >
          {/* Optional Header */}
          {headerType === "text" && headerText && (
            <Typography
              fontWeight="bold"
              fontSize={{ xs: "0.9rem", sm: "1rem" }}
              mb={0.5}
            >
              {headerText}
            </Typography>
          )}

          {/* Body */}
          <Typography fontSize={{ xs: "0.9rem", sm: "1rem" }} lineHeight={1.4}>
            {body || "Hey {{name}}, your appointment is on {{date}}."}
          </Typography>

          {/* Optional Footer */}
          {footer && (
            <Typography
              variant="caption"
              display="block"
              color="gray"
              mt={1}
              fontSize={{ xs: "0.7rem", sm: "0.8rem" }}
            >
              {footer}
            </Typography>
          )}

          {/* Buttons */}
          {buttons?.length > 0 && (
            <Stack direction="column" mt={1}>
              {buttons.map((btn, index) => (
                <Button
                  key={index}
                  size="small"
                  fullWidth
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    color: "#075e54",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    mt: 0.5,
                    fontSize: { xs: "0.75rem", sm: "0.9rem" },
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  {btn}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default WhatsAppPreview;
