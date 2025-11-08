import React from "react";
import { Box, Typography, Stack, Button, useMediaQuery, useTheme } from "@mui/material";
import { FaFileImage, FaFileVideo, FaFilePdf, FaFileAudio, FaFile } from "react-icons/fa";

const WhatsAppPreview = ({ templateData }) => {
  const {
    headerType,
    headerText,
    body,
    footer,
    buttons,
    quickReplies,
    templateButtons,
    mediaFile,
    mediaType,
    mediaUrl,
    fileName,
    templateType
  } = templateData;

  // MUI theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Function to render media preview based on type
  const renderMediaPreview = () => {
    if (!mediaFile && !mediaUrl) return null;

    const fileToUse = mediaFile || { name: fileName || 'Media file', size: 0 };

    switch (mediaType) {
      case "image":
        return (
          <Box mb={1}>
            <img
              src={mediaUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: isMobile ? '150px' : '200px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </Box>
        );

      case "video":
        return (
          <Box mb={1}>
            <video
              controls
              style={{
                width: '100%',
                maxHeight: isMobile ? '150px' : '200px',
                borderRadius: '8px'
              }}
            >
              <source src={mediaUrl} type={mediaFile?.type} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case "document":
        return (
          <Box
            mb={1}
            p={isMobile ? 1 : 1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={isMobile ? 1 : 2}
          >
            <FaFilePdf style={{ 
              color: '#e74c3c', 
              fontSize: isMobile ? '20px' : '24px' 
            }} />
            <Box flex={1} minWidth={0}>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight="bold"
                noWrap
              >
                {fileToUse.name}
              </Typography>
              <Typography variant="caption" color="gray">
                Document • {fileToUse.size ? (fileToUse.size / 1024 / 1024).toFixed(2) : '0'} MB
              </Typography>
            </Box>
          </Box>
        );

      case "audio":
        return (
          <Box
            mb={1}
            p={isMobile ? 1 : 1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={isMobile ? 1 : 2}
          >
            <FaFileAudio style={{ 
              color: '#9b59b6', 
              fontSize: isMobile ? '20px' : '24px' 
            }} />
            <Box flex={1}>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight="bold"
                noWrap
              >
                {fileToUse.name}
              </Typography>
              <audio
                controls
                style={{ 
                  width: '100%', 
                  marginTop: '4px',
                  height: isMobile ? '30px' : '40px'
                }}
              >
                <source src={mediaUrl} type={mediaFile?.type} />
                Your browser does not support the audio tag.
              </audio>
            </Box>
          </Box>
        );

      default:
        return (
          <Box
            mb={1}
            p={isMobile ? 1 : 1.5}
            bgcolor="white"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            gap={isMobile ? 1 : 2}
          >
            <FaFile style={{ 
              color: '#7f8c8d', 
              fontSize: isMobile ? '20px' : '24px' 
            }} />
            <Box flex={1} minWidth={0}>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight="bold"
                noWrap
              >
                {fileToUse.name}
              </Typography>
              <Typography variant="caption" color="gray">
                File • {fileToUse.size ? (fileToUse.size / 1024 / 1024).toFixed(2) : '0'} MB
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  // Function to render template buttons
  const renderTemplateButtons = () => {
    if (!templateButtons || templateButtons.length === 0) return null;

    return (
      <Stack direction="column" spacing={0.5} mt={1.5}>
        {templateButtons.map((button, index) => (
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
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              padding: isMobile ? '4px 8px' : '6px 12px',
              minHeight: 'auto',
              '&:hover': {
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            {button.text}
            {button.type === "URL" && " 🔗"}
            {button.type === "PHONE_NUMBER" && " 📞"}
          </Button>
        ))}
      </Stack>
    );
  };

  return (
    <Box
      border="1px solid #ccc"
      borderRadius="12px"
      overflow="hidden"
      sx={{
        backgroundColor: "#e5ddd5",
        height: isMobile ? "auto" : "50%",
        minHeight: isMobile ? 300 : 400,
        width: "100%",
        // maxWidth: isMobile ? "100%" : isTablet ? "100%" : 500,
        margin: isMobile ? "0 auto" : "0",
        mb: isMobile ? 2 : 0
      }}
    >
      {/* WhatsApp Green Header */}
      <Box bgcolor="#075e54" color="white" p={isMobile ? 1 : 1.5}>
        <Typography 
          fontWeight="bold" 
          fontSize={isMobile ? "0.9rem" : "1rem"}
          textAlign={isMobile ? "center" : "left"}
        >
          WhatsApp Preview
          {/* {templateType && (
            <Typography 
              component="span" 
              variant="caption" 
              display="block" 
              fontWeight="normal"
              fontSize="0.7rem"
            >
              {templateType} Template
            </Typography>
          )} */}
        </Typography>
      </Box>

      {/* Message Area */}
      <Box p={isMobile ? 1.5 : 2} flex={1}>
        {/* Template Message Bubble */}
        <Box
          bgcolor="#dcf8c6"
          borderRadius="12px"
          px={isMobile ? 1.5 : 2}
          py={isMobile ? 1 : 1.5}
          maxWidth="100%"
          sx={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {/* Header */}
          {headerType === "text" && headerText && (
            <Typography 
              fontWeight="bold" 
              mb={1}
              fontSize={isMobile ? "0.9rem" : "1rem"}
            >
              {headerText}
            </Typography>
          )}

          {/* Media Preview */}
          {(mediaFile || mediaUrl) && renderMediaPreview()}

          {/* Body */}
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            mb={1}
            sx={{
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap'
            }}
          >
            {body}
          </Typography>

          {/* Footer */}
          {footer && (
            <Typography
              variant="caption"
              display="block"
              color="gray"
              mt={1}
              fontSize={isMobile ? "0.7rem" : "0.75rem"}
            >
              {footer}
            </Typography>
          )}

          {/* Template Buttons */}
          {renderTemplateButtons()}

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
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    minHeight: 'auto',
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
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    minHeight: 'auto',
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

        {/* Info Text for Empty State */}
        {!body && !mediaFile && !mediaUrl && (
          <Box mt={2} textAlign="center">
            <Typography 
              variant="caption" 
              color="gray" 
              fontStyle="italic"
              fontSize={isMobile ? "0.7rem" : "0.75rem"}
            >
              Start building your template to see the preview
            </Typography>
          </Box>
        )}
      </Box>

      {/* Preview Status Bar */}
      {/* <Box 
        p={1} 
        bgcolor="#f8f9fa" 
        borderTop="1px solid #ddd"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography 
          variant="caption" 
          color="text.secondary"
          fontSize={isMobile ? "0.65rem" : "0.75rem"}
        >
          {mediaFile || mediaUrl ? "Media attached" : "Text template"}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          fontSize={isMobile ? "0.65rem" : "0.75rem"}
        >
          {quickReplies?.length || 0} quick replies
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          fontSize={isMobile ? "0.65rem" : "0.75rem"}
        >
          {templateButtons?.length || 0} buttons
        </Typography>
      </Box> */}
    </Box>
  );
};

export default WhatsAppPreview;
