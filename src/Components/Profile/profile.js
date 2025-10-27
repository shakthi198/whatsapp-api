import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Button,
    Card,
    Divider,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Person,
    Phone,
    Email,
    CalendarMonth,
    Shield,
    LocationOn,
    Business,
    Key,
    Public,
    Apartment,
    Home,
    Numbers,
    Language,
    Map,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get token from localStorage or sessionStorage
    const getToken = () => {
        // Check both localStorage and sessionStorage
        return localStorage.getItem('authToken') || 
               localStorage.getItem('token') ||
               sessionStorage.getItem('authToken') || 
               sessionStorage.getItem('token');
    };

    // Fetch profile data from API
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = getToken();
                if (!token) {
                    setError('No authentication token found. Please login again.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(apiEndpoints.customer_profile, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: 'getProfile'
                    })
                });

                const data = await response.json();

                if (data.status === 'success') {
                    setProfile(data.user);
                } else {
                    setError(data.message || 'Failed to fetch profile data');
                }
            } catch (err) {
                setError('Error fetching profile data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // Map database fields to profile fields
    const mapDatabaseToProfile = (customerData) => {
        if (!customerData) return null;
        
        return {
            accountStatus: customerData.status || "N/A",
            description: "Business", // Default value
            creationDate: customerData.createdOn ? new Date(customerData.createdOn).toLocaleDateString() : "N/A",
            activationDate: customerData.ModifiedOn ? new Date(customerData.ModifiedOn).toLocaleDateString() : "N/A",
            resellerId: "N/A", // Not in your table
            accountId: customerData.id ? `CUST-${customerData.id}` : "N/A",
            username: customerData.primary_contact_name || "N/A",
            whatsappAPI: customerData.waba_number || "N/A",
            primaryMobile: customerData.waba_number || "N/A", // Using waba_number as mobile
            primaryEmail: customerData.email || "N/A",
            supportPin: "N/A", // Not in your table
            companyName: customerData.companyName || "N/A",
            legalBusinessName: customerData.legal_business_name || "N/A",
            address: customerData.legal_business_address || customerData.streetName || "N/A",
            apartment: "N/A", // Not in your table
            zip: customerData.pincode || "N/A",
            country: customerData.country || "N/A",
            state: customerData.state || "N/A",
            city: customerData.city || "N/A",
            website: customerData.company_website || "N/A",
            gstNumber: customerData.gstno || "N/A",
            isActive: customerData.isActive ? "Yes" : "No",
        };
    };

    // Map the profile data when it's available
    const mappedProfile = profile ? mapDatabaseToProfile(profile) : null;

    const fields = mappedProfile ? [
        { label: "Account Status", value: mappedProfile.accountStatus, icon: <Shield color="success" /> },
        { label: "Description", value: mappedProfile.description, icon: <Business color="success" /> },
        { label: "Creation Date", value: mappedProfile.creationDate, icon: <CalendarMonth color="success" /> },
        { label: "Last Updated", value: mappedProfile.activationDate, icon: <CalendarMonth color="success" /> },
        { label: "Reseller ID", value: mappedProfile.resellerId, icon: <Numbers color="success" /> },
        { label: "Account ID", value: mappedProfile.accountId, icon: <Numbers color="success" /> },
        { label: "Username", value: mappedProfile.username, icon: <Person color="success" /> },
        { label: "WhatsApp API No", value: mappedProfile.whatsappAPI, icon: <Phone color="success" /> },
        { label: "Primary Contact Mobile No", value: mappedProfile.primaryMobile, icon: <Phone color="success" /> },
        { label: "Primary Contact Email ID", value: mappedProfile.primaryEmail, icon: <Email color="success" /> },
        { label: "Support PIN", value: mappedProfile.supportPin, icon: <Key color="success" /> },
        { label: "Company Name", value: mappedProfile.companyName, icon: <Business color="success" /> },
        { label: "Legal Business Name", value: mappedProfile.legalBusinessName, icon: <Business color="success" /> },
        { label: "Address", value: mappedProfile.address, icon: <Home color="success" /> },
        { label: "Zip/Pincode", value: mappedProfile.zip, icon: <Numbers color="success" /> },
        { label: "Country", value: mappedProfile.country, icon: <Public color="success" /> },
        { label: "State", value: mappedProfile.state, icon: <Map color="success" /> },
        { label: "City", value: mappedProfile.city, icon: <LocationOn color="success" /> },
        { label: "Company Website", value: mappedProfile.website, icon: <Language color="success" /> },
        { label: "GST Number", value: mappedProfile.gstNumber, icon: <Numbers color="success" /> },
        { label: "Is Active", value: mappedProfile.isActive, icon: <Shield color="success" /> },
    ] : [];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading profile...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert 
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
      <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Hi, {mappedProfile?.username || "Customer"}!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          My Profile
        </Typography>

        {/* Profile Details Title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile Details
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#2e7d32",
              "&:hover": { bgcolor: "#1b5e20" },
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 1,
            }}
          >
            Change Password
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Profile Grid */}
        <Grid container spacing={3}>
          {fields.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      maxWidth: "150px", // 👈 adjust this width to your layout
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                    }}
                    title={item.value} // full text on hover
                  >
                    {item.value || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
};

export default ProfilePage;