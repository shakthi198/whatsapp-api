import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { FaFileImage, FaFileVideo, FaFilePdf, FaFileAudio, FaFile } from "react-icons/fa";

const WhatsAppPreview = ({ templateData }) => {
  const {
    headerType,
    headerText,
    body,
    footer,
    buttons,
    quickReplies,
    mediaFile,
    mediaType,
    mediaUrl,
    fileName
  } = templateData;

  // Function to render media preview based on type
  const renderMediaPreview = () => {
    if (!mediaFile) return null;

    switch (mediaType) {
      case 'image':
        return (
          <Box mb={1}>
            <img
              src={mediaUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </Box>
        );

      case 'video':
        return (
          <Box mb={1}>
            <video
              controls
              style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '8px'
              }}
            >
              <source src={mediaUrl} type={mediaFile.type} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case 'document':
        return (
          <Box
            mb={1}
            p={1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <FaFilePdf style={{ color: '#e74c3c', fontSize: '24px' }} />
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold">
                {fileName}
              </Typography>
              <Typography variant="caption" color="gray">
                Document • {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          </Box>
        );

      case 'audio':
        return (
          <Box
            mb={1}
            p={1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <FaFileAudio style={{ color: '#9b59b6', fontSize: '24px' }} />
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold">
                {fileName}
              </Typography>
              <audio
                controls
                style={{ width: '100%', marginTop: '8px' }}
              >
                <source src={mediaUrl} type={mediaFile.type} />
                Your browser does not support the audio tag.
              </audio>
            </Box>
          </Box>
        );

      default:
        return (
          <Box
            mb={1}
            p={1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <FaFile style={{ color: '#7f8c8d', fontSize: '24px' }} />
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold">
                {fileName}
              </Typography>
              <Typography variant="caption" color="gray">
                File • {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box
      border="1px solid #ccc"
      borderRadius="12px"
      overflow="hidden"
      sx={{
        backgroundColor: "#e5ddd5",
        height: "50%",
        minHeight: 400,
        width: 500,
      }}
    >
      {/* WhatsApp Green Header */}
      <Box bgcolor="#075e54" color="white" p={1.5}>
        <Typography fontWeight="bold">WhatsApp Preview</Typography>
      </Box>

      {/* Chat Header */}
      {/* <Box bgcolor="#f0f0f0" p={2} display="flex" alignItems="center" gap={2}> */}
        {/* <Box
          width={40}
          height={40}
          bgcolor="#25d366"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
        >
          W
        </Box>
        <Box>
          <Typography fontWeight="bold">Business Name</Typography>
          <Typography variant="caption" color="gray">
            Online
          </Typography>
        </Box> */}
      {/* </Box> */}

      {/* Message Area */}
      <Box p={2} flex={1}>
        {/* Template Message Bubble */}
        <Box
          bgcolor="#dcf8c6"
          borderRadius="12px"
          px={2}
          py={1.5}
          maxWidth="85%"
        >
          {/* Header */}
          {headerType === "text" && headerText && (
            <Typography fontWeight="bold" mb={1}>
              {headerText}
            </Typography>
          )}

          {/* Media Preview */}
          {mediaFile && renderMediaPreview()}

          {/* Body */}
          <Typography variant="body2" mb={1}>
            {body || "Hey {{name}}, your appointment is on {{date}}."}
          </Typography>

          {/* Footer */}
          {footer && (
            <Typography
              variant="caption"
              display="block"
              color="gray"
              mt={1}
            >
              {footer}
            </Typography>
          )}

          {/* Quick Replies */}
          {quickReplies && quickReplies.length > 0 && (
            <Stack direction="column" spacing={0.5} mt={1.5}>
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  size="small"
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    color: "#075e54",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  {reply.text}
                </Button>
              ))}
            </Stack>
          )}

          {/* Legacy Buttons */}
          {buttons?.length > 0 && (
            <Stack direction="column" spacing={0.5} mt={1.5}>
              {buttons.map((btn, index) => (
                <Button
                  key={index}
                  size="small"
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    color: "#075e54",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  {btn}
                </Button>
              ))}
            </Stack>
          )}
        </Box>

        {/* Sample User Reply */}
        {/* <Box display="flex" justifyContent="flex-end" mt={2}>
          <Box
            bgcolor="white"
            borderRadius="12px"
            px={2}
            py={1}
            maxWidth="85%"
          >
            <Typography variant="body2">Sample reply</Typography>
            <Typography variant="caption" color="gray" display="block" textAlign="right">
              10:30 AM
            </Typography>
          </Box>
        </Box> */}
      </Box>

      {/* Input Area */}
      {/* <Box p={2} bgcolor="#f0f0f0" display="flex" alignItems="center" gap={1}>
        <Box 
          flex={1} 
          bgcolor="white" 
          borderRadius="20px" 
          px={2} 
          py={1}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Typography color="gray">💬</Typography>
          <Typography variant="body2" color="gray" flex={1}>
            Type a message
          </Typography>
        </Box>
        <Box
          bgcolor="#25d366"
          width={36}
          height={36}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </Box>
      </Box> */}

      {/* Preview Info */}
      {/* {mediaFile && (
        <Box p={1.5} bgcolor="#fff3cd" borderTop="1px solid #ffeaa7">
          <Typography variant="caption" color="#856404">
            <strong>Media Preview:</strong> {fileName} ({mediaType})
          </Typography>
        </Box>
      )} */}
    </Box>
  );
};

export default WhatsAppPreview;