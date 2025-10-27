<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Cache-Control: no-cache, must-revalidate"); // Add this line
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Add this line (past date)

require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    // Preflight request - just return 200 OK
    http_response_code(200);
    exit;
}

if ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Invalid JSON data"]);
        exit;
    }

    // Required fields validation
    if (empty($data['categoryName'])) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "categoryName is required"]);
        exit;
    }

    $guid = $conn->real_escape_string($data['guid'] ?? bin2hex(random_bytes(16)));
    $categoryName = $conn->real_escape_string($data['categoryName']);
    $createdOn = date("Y-m-d H:i:s");
    $modifiedOn = $createdOn;
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    $isDelete = 0;

    $sql = "INSERT INTO category (guid, categoryName, createdOn, modifiedOn, isActive, isDelete)
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssii", $guid, $categoryName, $createdOn, $modifiedOn, $isActive, $isDelete);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => true, 
            "message" => "Category created successfully",
            "data" => [
                "id" => $stmt->insert_id,
                "guid" => $guid,
                "categoryName" => $categoryName
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => false, 
            "message" => "Failed to create category: " . $conn->error
        ]);
    }
    $stmt->close();
}
elseif ($method === 'GET') {
    $sql = "SELECT 
                c.id as category_id, 
                c.guid as category_guid, 
                c.categoryName, 
                c.isActive,
                t.id as template_id,
                t.name as template_name
            FROM category c
            LEFT JOIN templates t ON t.categoryGuid = c.guid AND t.isDelete = 0
            WHERE c.isDelete = 0
            ORDER BY c.id";

    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode([
            "status" => false, 
            "message" => "Database error: " . $conn->error
        ]);
        exit;
    }

    $categories = [];

    while ($row = $result->fetch_assoc()) {
        $categoryGuid = $row['category_guid'];
        if (!isset($categories[$categoryGuid])) {
            $categories[$categoryGuid] = [
                'category_id' => $row['category_id'],
                'category_guid' => $categoryGuid,
                'categoryName' => $row['categoryName'],
                'isActive' => $row['isActive'],
                'templates' => []
            ];
        }

        if (!empty($row['template_id'])) {
            $categories[$categoryGuid]['templates'][] = [
                'template_id' => $row['template_id'],
                'template_name' => $row['template_name']
            ];
        }
    }

    echo json_encode([
        "status" => true, 
        "data" => array_values($categories),
        "count" => count($categories)
    ]);
}

else {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Method not allowed"]);
}

$conn->close();
?>