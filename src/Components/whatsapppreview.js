import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const WhatsAppPreview = ({ templateData }) => {
  const { headerType, headerText, body, footer,buttons } = templateData;

  return (
    <Box
      border="1px solid #ccc"
      borderRadius="12px"
      overflow="hidden"
      sx={{
        backgroundColor: "#e5ddd5",
        height: "100%",
        minHeight: 400,
        width: 500,
      }}
    >
      {/* WhatsApp Green Header */}
      <Box bgcolor="#075e54" color="white" p={1.5}>
        WhatsApp Preview
      </Box>

      {/* Message Bubble */}
      <Box p={2}>
        <Box bgcolor="#dcf8c6" borderRadius="12px" px={2} py={1} maxWidth="80%">
          {/* Optional Header */}
          {headerType === "text" && headerText && (
            <Typography fontWeight="bold">{headerText}</Typography>
          )}

          {/* Body with Placeholders */}
          <Typography>
            {body || "Hey {{name}}, your appointment is on {{date}}."}
          </Typography>

          {/* Optional Footer */}
          {footer && (
            <Typography variant="caption" display="block" color="gray" mt={1}>
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
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    color: "#075e54",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    mt: 0.5,
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
