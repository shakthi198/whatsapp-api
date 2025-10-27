<?php
// customer-profile.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";
require_once 'vendor/autoload.php'; // If using JWT

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// JWT secret & algorithm (should match your existing setup)
$jwt_secret = "super_secret_key_123";
$jwt_algorithm = "HS256";

// Validate JWT token
function validateTokenAndGetUserId($token, $jwt_secret, $jwt_algorithm) {
    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
        return $decoded->id;
    } catch (Exception $e) {
        throw new Exception("Invalid token: " . $e->getMessage());
    }
}

// Get profile data
function getCustomerProfile($conn, $userId) {
    $stmt = $conn->prepare("
        SELECT 
            id,
            primary_contact_name,
            companyName,
            legal_business_name,
            legal_business_address,
            streetName,
            city,
            state,
            country,
            pincode,
            company_website,
            gstno,
            waba_number,
            email,
            status,
            isActive,
            Isdeleted,
            createdOn,
            ModifiedOn
        FROM customer_crud 
        WHERE id = ? AND Isdeleted = 0
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        throw new Exception("Customer not found");
    }
    
    $customer = $result->fetch_assoc();
    $stmt->close();
    
    return $customer;
}

// Main logic
try {
    // Get authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
        throw new Exception("Authorization token required");
    }
    
    $token = substr($authHeader, 7);
    
    // Validate token and get user ID
    $userId = validateTokenAndGetUserId($token, $jwt_secret, $jwt_algorithm);
    
    // Get profile data
    $profile = getCustomerProfile($conn, $userId);
    
    // Return success response
    echo json_encode([
        "status" => "success",
        "message" => "Profile fetched successfully",
        "user" => $profile
    ]);
    
} catch (Exception $e) {
    error_log("Profile API Error: " . $e->getMessage());
    
    http_response_code(401);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>