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

// JWT secret & algorithm
$jwt_secret = "super_secret_key_123";
$jwt_algorithm = "HS256";

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Read input JSON
$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$action = $input['action'] ?? '';
$companyName = $input['companyName'] ?? '';
$legal_business_name = $input['legal_business_name'] ?? '';
$legal_business_address = $input['legal_business_address'] ?? '';
$streetName = $input['streetName'] ?? '';
$city = $input['city'] ?? '';
$state = $input['state'] ?? '';
$country = $input['country'] ?? '';
$pincode = $input['pincode'] ?? '';
$company_website = $input['company_website'] ?? '';
$gstno = $input['gstno'] ?? '';
$primary_contact_name = $input['primaryContactName'] ?? '';
$waba_number = $input['waba_number'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$currentpassword = $input['currentpassword'] ?? '';
$newpassword = $input['newpassword'] ?? '';

$response = ['status' => 'error', 'message' => 'Unknown error occurred'];

// === Helper functions ===

// Validate JWT token
function validateTokenAndGetUserId($token, $jwt_secret, $jwt_algorithm) {
    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
        return $decoded->id;
    } catch (Exception $e) {
        throw new Exception("Invalid token: " . $e->getMessage());
    }
}
// Register new customer
function registerCustomer($conn, $companyName, $primary_contact_name, $waba_number, $email, $password) {
    if (!$companyName || !$primary_contact_name || !$waba_number || !$email || !$password) {
        throw new Exception("All fields are required");
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM customer_crud WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) throw new Exception("Email already registered");
    $stmt->close();

    // Check WABA
    $stmt = $conn->prepare("SELECT id FROM customer_crud WHERE waba_number = ?");
    $stmt->bind_param("s", $waba_number);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) throw new Exception("WABA number already registered");
    $stmt->close();

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO customer_crud (companyName, primary_contact_name, waba_number, email, password) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $companyName, $primary_contact_name, $waba_number, $email, $hashedPassword);
    if (!$stmt->execute()) throw new Exception("Registration failed: " . $stmt->error);
    $stmt->close();

    return ["status" => "success", "message" => "Registration successful"];
}

// Login customer
function loginCustomer($conn, $email, $password) {
    global $jwt_secret, $jwt_algorithm;

    if (!$email || !$password) throw new Exception("Email and password required");

    $stmt = $conn->prepare("SELECT * FROM customer_crud WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($password, $user['password'])) throw new Exception("Invalid credentials");

    if (!$user['isActive'] || $user['Isdeleted']) throw new Exception("Account inactive or deleted");

    unset($user['password']);
    $payload = ["data" => $user, "id" => $user['id'], "iat" => time()];
    $jwt = JWT::encode($payload, $jwt_secret, $jwt_algorithm);

    return ["status" => "success", "message" => "Login successful", "token" => $jwt];
}


// Update customer profile
function updateCustomer($conn, $id, $updateData) {
    if (empty($id)) throw new Exception("User ID is required");

    $stmt = $conn->prepare("SELECT * FROM customer_crud WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    if (!$user) throw new Exception("User not found");

    if (!empty($updateData['currentpassword']) && !empty($updateData['newpassword'])) {
        if (!password_verify($updateData['currentpassword'], $user['password'])) throw new Exception("Current password is incorrect");
        if (password_verify($updateData['newpassword'], $user['password'])) throw new Exception("New password must differ from current password");
        $updateData['password'] = password_hash($updateData['newpassword'], PASSWORD_BCRYPT);
    }

    unset($updateData['currentpassword']);
    unset($updateData['newpassword']);

    $setClause = [];
    $params = [];
    $types = '';

    $allowedFields = ['companyName','legal_business_name','legal_business_address','streetName','city','state','country','pincode','company_website','gstno','primary_contact_name','waba_number','email','password'];
    foreach ($updateData as $key => $value) {
        if (in_array($key, $allowedFields)) {
            $setClause[] = "$key = ?";
            $params[] = $value;
            $types .= 's';
        }
    }

    if (empty($setClause)) throw new Exception("No valid fields to update");

    $params[] = $id;
    $types .= 'i';
    $sql = "UPDATE customer_crud SET " . implode(', ', $setClause) . ", ModifiedOn = NOW() WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) throw new Exception("Update failed: " . $stmt->error);
    $stmt->close();

    $userStmt = $conn->prepare("SELECT id, companyName, legal_business_name, legal_business_address, streetName, city, state, country, pincode, company_website, gstno, primary_contact_name, waba_number, email, status, isActive, createdOn, ModifiedOn FROM customer_crud WHERE id = ?");
    $userStmt->bind_param("i", $id);
    $userStmt->execute();
    $result = $userStmt->get_result();
    $updatedUser = $result->fetch_assoc();
    $userStmt->close();

    return ["status" => "success", "message" => "Profile updated successfully", "user" => $updatedUser];
}

// Get profile by token
function getProfile($conn, $token, $jwt_secret, $jwt_algorithm) {
    $userId = validateTokenAndGetUserId($token, $jwt_secret, $jwt_algorithm);
    $stmt = $conn->prepare("SELECT id, companyName, legal_business_name, legal_business_address, streetName, city, state, country, pincode, company_website, gstno, primary_contact_name, waba_number, email, status, isActive, createdOn, ModifiedOn FROM customer_crud WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    if (!$user) throw new Exception("User not found");
    return ["status" => "success", "user" => $user];
}

try {
    switch ($action) {
         case 'register':
            $response = registerCustomer($conn, $companyName, $primary_contact_name, $waba_number, $email, $password);
            break;

        case 'login':
            $response = loginCustomer($conn, $email, $password);
            break;
        case "update":
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            if (!str_starts_with($authHeader, 'Bearer ')) throw new Exception("Authorization token required");
            $token = substr($authHeader, 7);
            $response = updateCustomer($conn, validateTokenAndGetUserId($token, $jwt_secret, $jwt_algorithm), $input);
            break;

        case "getProfile":
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            if (!str_starts_with($authHeader, 'Bearer ')) throw new Exception("Authorization token required");
            $token = substr($authHeader, 7);
            $response = getProfile($conn, $token, $jwt_secret, $jwt_algorithm);
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
