<?php
// customer-profile.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";
require_once 'vendor/autoload.php';

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

// Update profile data
function updateCustomerProfile($conn, $userId, $updateData) {
    // Define allowed fields that can be updated
    $allowedFields = [
        'primary_contact_name',
        'companyName',
        'legal_business_name',
        'legal_business_address',
        'streetName',
        'city',
        'state',
        'country',
        'pincode',
        'company_website',
        'gstno',
        'email'
    ];
    
    // Filter and validate update data
    $filteredData = [];
    foreach ($allowedFields as $field) {
        if (isset($updateData[$field])) {
            $filteredData[$field] = trim($updateData[$field]);
        }
    }
    
    if (empty($filteredData)) {
        throw new Exception("No valid fields to update");
    }
    
    // Build dynamic SET clause for SQL
    $setClause = [];
    $types = "";
    $values = [];
    
    foreach ($filteredData as $field => $value) {
        $setClause[] = "$field = ?";
        $types .= "s"; // all strings
        $values[] = $value;
    }
    
    // Add ModifiedOn timestamp
    $setClause[] = "ModifiedOn = NOW()";
    
    $sql = "UPDATE customer_crud SET " . implode(", ", $setClause) . " WHERE id = ? AND Isdeleted = 0";
    $types .= "i"; // for user ID
    $values[] = $userId;
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$values);
    $result = $stmt->execute();
    
    if (!$result) {
        $error = $stmt->error;
        $stmt->close();
        throw new Exception("Update failed: " . $error);
    }
    
    $affectedRows = $stmt->affected_rows;
    $stmt->close();
    
    if ($affectedRows === 0) {
        throw new Exception("No changes made or customer not found");
    }
    
    return $affectedRows;
}

// Get request body
$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

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
    
    // Determine action based on request method or action parameter
    $action = $_SERVER['REQUEST_METHOD'] === 'POST' ? ($requestData['action'] ?? 'getProfile') : 'getProfile';
    
    switch ($action) {
        case 'getProfile':
            // Get profile data
            $profile = getCustomerProfile($conn, $userId);
            
            // Return success response
            echo json_encode([
                "status" => "success",
                "message" => "Profile fetched successfully",
                "user" => $profile
            ]);
            break;
            
        case 'updateProfile':
            // Validate update data
            if (empty($requestData)) {
                throw new Exception("No data provided for update");
            }
            
            // Remove action from data
            unset($requestData['action']);
            
            // Update profile
            $affectedRows = updateCustomerProfile($conn, $userId, $requestData);
            
            // Get updated profile
            $updatedProfile = getCustomerProfile($conn, $userId);
            
            // Return success response
            echo json_encode([
                "status" => "success",
                "message" => "Profile updated successfully",
                "affected_rows" => $affectedRows,
                "user" => $updatedProfile
            ]);
            break;
            
        default:
            throw new Exception("Invalid action specified");
    }
    
} catch (Exception $e) {
    error_log("Profile API Error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>