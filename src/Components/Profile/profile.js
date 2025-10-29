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
    TextField,
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
    Home,
    Numbers,
    Language,
    Map,
    Edit,
    Save,
    Cancel,
} from "@mui/icons-material";
import { HiChevronRight } from "react-icons/hi";
import apiEndpoints from "../../apiconfig";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);

    // Get token from localStorage or sessionStorage
    const getToken = () => {
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
                    setEditedProfile(data.user);
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
            description: "Business",
            creationDate: customerData.createdOn ? new Date(customerData.createdOn).toLocaleDateString() : "N/A",
            activationDate: customerData.ModifiedOn ? new Date(customerData.ModifiedOn).toLocaleDateString() : "N/A",
            resellerId: "N/A",
            accountId: customerData.id ? `CUST-${customerData.id}` : "N/A",
            username: customerData.primary_contact_name || "N/A",
            whatsappAPI: customerData.waba_number || "N/A",
            primaryMobile: customerData.waba_number || "N/A",
            primaryEmail: customerData.email || "N/A",
            supportPin: "N/A",
            companyName: customerData.companyName || "N/A",
            legalBusinessName: customerData.legal_business_name || "N/A",
            address: customerData.legal_business_address || customerData.streetName || "N/A",
            apartment: "N/A",
            zip: customerData.pincode || "N/A",
            country: customerData.country || "N/A",
            state: customerData.state || "N/A",
            city: customerData.city || "N/A",
            website: customerData.company_website || "N/A",
            gstNumber: customerData.gstno || "N/A",
            isActive: customerData.isActive ? "Yes" : "No",
        };
    };

    // Handle edit button click
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // Handle save button click
    const handleSaveClick = async () => {
        try {
            const token = getToken();
            const response = await fetch(apiEndpoints.customer_profile, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'updateProfile',
                    ...editedProfile
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setProfile(editedProfile);
                setIsEditing(false);
                setError(null);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile: ' + err.message);
        }
    };

    // Handle cancel button click
    const handleCancelClick = () => {
        setEditedProfile(profile);
        setIsEditing(false);
        setError(null);
    };

    // Handle field change
    const handleFieldChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Map the profile data when it's available
    const mappedProfile = profile ? mapDatabaseToProfile(profile) : null;

    // Helper function to get field value from profile
    const getFieldValue = (field) => {
        if (!profile) return "Not provided";
        
        // Direct mapping from profile object
        const fieldMap = {
            "Username": profile.primary_contact_name,
            "Primary Contact Email ID": profile.email,
            "Company Name": profile.companyName,
            "Legal Business Name": profile.legal_business_name,
            "Address": profile.legal_business_address || profile.streetName,
            "City": profile.city,
            "State": profile.state,
            "Country": profile.country,
            "Zip/Pincode": profile.pincode,
            "Company Website": profile.company_website,
            "GST Number": profile.gstno,
        };
        
        return fieldMap[field] || "Not provided";
    };

    const editableFields = [
        { label: "Username", field: "primary_contact_name", icon: <Person /> },
        { label: "Primary Contact Email ID", field: "email", icon: <Email /> },
        { label: "Company Name", field: "companyName", icon: <Business /> },
        { label: "Legal Business Name", field: "legal_business_name", icon: <Business /> },
        { label: "Address", field: "legal_business_address", icon: <Home /> },
        { label: "City", field: "city", icon: <LocationOn /> },
        { label: "State", field: "state", icon: <Map /> },
        { label: "Country", field: "country", icon: <Public /> },
        { label: "Zip/Pincode", field: "pincode", icon: <Numbers /> },
        { label: "Company Website", field: "company_website", icon: <Language /> },
        { label: "GST Number", field: "gstno", icon: <Numbers /> },
    ];

    const nonEditableFields = [
        { label: "Account Status", value: mappedProfile?.accountStatus, icon: <Shield /> },
        { label: "Description", value: mappedProfile?.description, icon: <Business /> },
        { label: "Creation Date", value: mappedProfile?.creationDate, icon: <CalendarMonth /> },
        { label: "Last Updated", value: mappedProfile?.activationDate, icon: <CalendarMonth /> },
        { label: "Reseller ID", value: mappedProfile?.resellerId, icon: <Numbers /> },
        { label: "Account ID", value: mappedProfile?.accountId, icon: <Numbers /> },
        { label: "WhatsApp API No", value: mappedProfile?.whatsappAPI, icon: <Phone /> },
        { label: "Primary Contact Mobile No", value: mappedProfile?.primaryMobile, icon: <Phone /> },
        { label: "Support PIN", value: mappedProfile?.supportPin, icon: <Key /> },
        { label: "Is Active", value: mappedProfile?.isActive, icon: <Shield /> },
    ];

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
        <div className="w-full px-4 py-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
                <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
                    Profile
                </h2>
                <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
                    <div className="flex items-center text-lg text-gray-600 flex-wrap gap-1">
                        <span className="hidden md:inline">|</span>
                    </div>
                    <span className="whitespace-nowrap">Home</span>
                    <HiChevronRight className="mx-1 text-black text-md" />
                    <span className="whitespace-nowrap">Profile</span>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Single Profile Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, p: 4 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: "#1f2937" }}>
                            {profile?.primary_contact_name || "Customer"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business sx={{ fontSize: 18 }} />
                            {profile?.companyName || "No Company Name"}
                        </Typography>
                    </Box>
                    {!isEditing ? (
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={handleEditClick}
                            sx={{
                                bgcolor: "#f59e0b",
                                "&:hover": { bgcolor: "#d97706" },
                                textTransform: "none",
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1rem'
                            }}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={handleCancelClick}
                                sx={{
                                    borderColor: "#6b7280",
                                    color: "#6b7280",
                                    textTransform: "none",
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSaveClick}
                                sx={{
                                    bgcolor: "#10b981",
                                    "&:hover": { bgcolor: "#059669" },
                                    textTransform: "none",
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Profile Fields Grid */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#374151" }}>
                        Personal Information
                    </Typography>
                    <Grid container spacing={3}>
                        {editableFields.slice(0, 4).map((item, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: 1, 
                                            bgcolor: "rgba(245, 158, 11, 0.1)",
                                            color: "#f59e0b",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.primary"
                                            fontWeight="600"
                                            sx={{ fontSize: "0.9rem", mb: 1 }}
                                        >
                                            {item.label}
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editedProfile?.[item.field] || ""}
                                                onChange={(e) => handleFieldChange(item.field, e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        fontSize: "0.9rem",
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{
                                                    wordBreak: "break-word",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {getFieldValue(item.label)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Business Information */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#374151" }}>
                        Business Information
                    </Typography>
                    <Grid container spacing={3}>
                        {editableFields.slice(4).map((item, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: 1, 
                                            bgcolor: "rgba(245, 158, 11, 0.1)",
                                            color: "#f59e0b",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.primary"
                                            fontWeight="600"
                                            sx={{ fontSize: "0.9rem", mb: 1 }}
                                        >
                                            {item.label}
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editedProfile?.[item.field] || ""}
                                                onChange={(e) => handleFieldChange(item.field, e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        fontSize: "0.9rem",
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{
                                                    wordBreak: "break-word",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {getFieldValue(item.label)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Account Information */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#374151" }}>
                        Account Information
                    </Typography>
                    <Grid container spacing={3}>
                        {nonEditableFields.map((item, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: 1, 
                                            bgcolor: "rgba(107, 114, 128, 0.1)",
                                            color: "#6b7280",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.primary"
                                            fontWeight="600"
                                            sx={{ fontSize: "0.9rem", mb: 1 }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{
                                                wordBreak: "break-word",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {item.value || "Not provided"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Card>
        </div>
    );
};

export default ProfilePage;