<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";
require 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Read and validate input
$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$action = $input['action'] ?? '';
$companyName = $input['companyName'] ?? '';
$primary_contact_name = $input['primaryContactName'] ?? '';
$waba_number = $input['waba_number'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$guid = $input['guid'] ?? '';
$currentpassword = $input['currentpassword'] ?? '';
$newpassword = $input['newpassword'] ?? '';
$legal_business_name = $input['legal_business_name'] ?? '';
$legal_business_address = $input['legal_business_address'] ?? '';
$streetName = $input['streetName'] ?? '';
$city = $input['city'] ?? '';
$state = $input['state'] ?? '';
$country = $input['country'] ?? '';
$pincode = $input['pincode'] ?? '';
$company_website = $input['company_website'] ?? '';
$gstno = $input['gstno'] ?? '';

$response = ['status' => 'error', 'message' => 'Unknown error occurred'];

// === ACTIONS ===

function registerCustomer($conn, $companyName, $primary_contact_name, $waba_number, $email, $password) {
    if (!$companyName || !$primary_contact_name || !$waba_number || !$email || !$password) {
        throw new Exception("All fields are required");
    }

    // Check if email already exists
    $checkStmt = $conn->prepare("SELECT email FROM customer_crud WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkStmt->store_result();
    if ($checkStmt->num_rows > 0) {
        throw new Exception("Email already registered");
    }
    $checkStmt->close();

    // Check if waba_number already exists
    $checkWabaStmt = $conn->prepare("SELECT waba_number FROM customer_crud WHERE waba_number = ?");
    $checkWabaStmt->bind_param("s", $waba_number);
    $checkWabaStmt->execute();
    $checkWabaStmt->store_result();
    if ($checkWabaStmt->num_rows > 0) {
        throw new Exception("WABA number already registered");
    }
    $checkWabaStmt->close();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert new customer
    $stmt = $conn->prepare("INSERT INTO customer_crud (companyName, primary_contact_name, waba_number, email, password) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss",$companyName, $primary_contact_name, $waba_number, $email, $hashedPassword);
    
    if (!$stmt->execute()) {
        throw new Exception("Registration failed: " . $stmt->error);
    }
    $stmt->close();

    return [
        "status" => "success",
        "message" => "Registration successful",
    ];
}

function loginCustomer($conn, $email, $password) {
    global $jwt_secret, $jwt_algorithm;

    if (empty($email) || empty($password)) {
        throw new Exception("Email and password are required");
    }

    $stmt = $conn->prepare("SELECT * FROM customer_crud WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && password_verify($password, $user['password'])) {
        // Check if account is active and not deleted
        if (!$user['isActive'] || $user['Isdeleted']) {
            throw new Exception("Account is inactive or deleted");
        }
        
        unset($user['password']);
        $payload = [
            "data" => $user,
            "id" => $user['id'], 
            "iat" => time()          
        ];

        $jwt = JWT::encode($payload, $jwt_secret, $jwt_algorithm);

        return [
            "status" => "success",
            "message" => "Login successful",
            "token" => $jwt,
        ];
    } else {
        throw new Exception("Invalid credentials");
    }
}

function updateCustomer($conn, $id, $updateData) {
    if (empty($id)) {
        throw new Exception("User ID is required");
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT * FROM customer_crud WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user) {
        throw new Exception("User not found");
    }

    // Handle password change if provided
    if (!empty($updateData['currentpassword']) && !empty($updateData['newpassword'])) {
        if (!password_verify($updateData['currentpassword'], $user['password'])) {
            throw new Exception("Current password is incorrect");
        }

        if (password_verify($updateData['newpassword'], $user['password'])) {
            throw new Exception("New password must be different from the current password");
        }

        $hashedPassword = password_hash($updateData['newpassword'], PASSWORD_BCRYPT);
        $updateData['password'] = $hashedPassword;
    }
    unset($updateData['currentpassword']);
    unset($updateData['newpassword']);
    $setClause = [];
    $params = [];
    $types = '';
    
    foreach ($updateData as $key => $value) {
        // Only allow updating specific fields
        $allowedFields = [
            'companyName', 'legal_business_name', 'legal_business_address',
            'streetName', 'city', 'state', 'country', 'pincode', 'company_website',
            'gstno', 'primary_contact_name', 'waba_number', 'email', 'password'
        ];
        
        if (in_array($key, $allowedFields)) {
            $setClause[] = "$key = ?";
            $params[] = $value;
            $types .= 's';
        }
    }
    
    if (empty($setClause)) {
        throw new Exception("No valid fields to update");
    }
    
    // Add id to parameters
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE customer_crud SET " . implode(', ', $setClause) . ", ModifiedOn = NOW() WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception("Update failed: " . $stmt->error);
    }
    $stmt->close();

    // Get the updated user
    $userStmt = $conn->prepare("SELECT id, companyName, legal_business_name, legal_business_address, streetName, city, state, country, pincode, company_website, gstno, primary_contact_name, waba_number, email, status, isActive, createdOn, ModifiedOn FROM customer_crud WHERE id = ?");
    $userStmt->bind_param("i", $id);
    $userStmt->execute();
    $result = $userStmt->get_result();
    $updatedUser = $result->fetch_assoc();
    $userStmt->close();

    return [
        "status" => "success",
        "message" => "Profile updated successfully",
        "user" => $updatedUser
    ];
}

function validateTokenAndGetUserId($token) {
    global $jwt_secret, $jwt_algorithm;
    
    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
        return $decoded->id;
    } catch (Exception $e) {
        throw new Exception("Invalid token: " . $e->getMessage());
    }
}

try {
    switch ($action) {
        case 'register':
            $response = registerCustomer($conn, $companyName, $primary_contact_name, $waba_number, $email, $password);
            break;

        case 'login':
            $response = loginCustomer($conn, $email, $password);
            break;

        case 'update':
            // Get token from headers
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (str_starts_with($authHeader, 'Bearer ')) {
                $token = substr($authHeader, 7);
            } else {
                throw new Exception("Authorization token required");
            }
            
            // Validate token and get user ID
            $userId = validateTokenAndGetUserId($token);
            
            // Prepare update data
            $updateData = [];
            if (!empty($companyName)) $updateData['companyName'] = $companyName;
            if (!empty($legal_business_name)) $updateData['legal_business_name'] = $legal_business_name;
            if (!empty($legal_business_address)) $updateData['legal_business_address'] = $legal_business_address;
            if (!empty($streetName)) $updateData['streetName'] = $streetName;
            if (!empty($city)) $updateData['city'] = $city;
            if (!empty($state)) $updateData['state'] = $state;
            if (!empty($country)) $updateData['country'] = $country;
            if (!empty($pincode)) $updateData['pincode'] = $pincode;
            if (!empty($company_website)) $updateData['company_website'] = $company_website;
            if (!empty($gstno)) $updateData['gstno'] = $gstno;
            if (!empty($primary_contact_name)) $updateData['primary_contact_name'] = $primary_contact_name;
            if (!empty($waba_number)) $updateData['waba_number'] = $waba_number;
            if (!empty($email)) $updateData['email'] = $email;
            if (!empty($currentpassword)) $updateData['currentpassword'] = $currentpassword;
            if (!empty($newpassword)) $updateData['newpassword'] = $newpassword;
            
            $response = updateCustomer($conn, $userId, $updateData);
            break;

        default:
            throw new Exception("Invalid action");
    }
} catch (Exception $e) {
    $response = ["status" => "error", "message" => $e->getMessage()];
}

$conn->close();
echo json_encode($response);
?>