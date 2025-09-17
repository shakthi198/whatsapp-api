import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, MenuItem } from "@mui/material";

const ReminderPopup = () => {
  const yellow600 = "#d08700";
  const gray600 = "#4b5563";

  const [open, setOpen] = useState(true);

  if (!open) return null;

  const handleClose = () => setOpen(false);
  const handleCancel = () => setOpen(false);
  const handleSubmit = () => {
    alert("Form submitted!");
    setOpen(false);
  };
  const handleRemindLater = () => {
    alert("We will remind you later.");
    setOpen(false);
  };

  // Function to render label with optional *
  const requiredLabel = (label, isRequired = true) => (
    <Typography sx={{ fontWeight: "medium", color: "#000", mb: 1 }}>
      {label} {isRequired && <span style={{ color: "red" }}>*</span>}
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
          p: 4,
          borderRadius: "8px",
          width: "100%",
          maxWidth: "800px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
          color: gray600,
          position: "relative",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Fill in these fields
        </Typography>

        {/* Close Button */}
        <Button
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            minWidth: "auto",
            color: gray600,
            fontSize: "1.5rem",
            p: 0.5,
          }}
        >
          ×
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {requiredLabel("Company Name")}
            <TextField
              fullWidth
              placeholder="Sample"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Legal Business Name")}
            <TextField
              fullWidth
              placeholder="Enter Legal Business Name"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Legal Business Address")}
            <TextField
              fullWidth
              placeholder="Enter Address"
              variant="outlined"
              multiline
              rows={4}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Street Name")}
            <TextField
              fullWidth
              placeholder="Enter Street Name"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("City")}
            <TextField
              fullWidth
              placeholder="Enter City"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("State")}
            <TextField
              fullWidth
              placeholder="Enter State"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Country")}
            <TextField
              fullWidth
              select
              defaultValue=""
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            >
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Zip", false)}
            <TextField
              fullWidth
              placeholder="Enter Zip"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("Company Website")}
            <TextField
              fullWidth
              placeholder="Enter Website"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {requiredLabel("GST NO")}
            <TextField
              fullWidth
              placeholder="Enter GST Number"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "lightgray" },
                  "&:hover fieldset": { borderColor: "lightgray" },
                  "&.Mui-focused fieldset": { borderColor: "lightgray" },
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          <Button variant="text" onClick={handleCancel} sx={{ color: gray600, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: yellow600, color: "white", textTransform: "none", "&:hover": { bgcolor: yellow600 } }}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            onClick={handleRemindLater}
            sx={{ bgcolor: yellow600, color: "white", textTransform: "none", "&:hover": { bgcolor: yellow600 } }}
          >
            Remind me later
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ReminderPopup;
