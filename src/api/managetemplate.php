<?php
// Add this at the very top to suppress warnings from being output
error_reporting(E_ALL);
ini_set('display_errors', 0); // Change to 1 for development
ini_set('log_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "meta";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Handle GET request to fetch templates with joins
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                t.id, 
                t.guid, 
                t.name as template_name, 
                c.categoryName as category,
                t.categoryGuid,
                t.languageGuid,
                t.typeId as template_type,
                t.isFile,
                t.templateHeaders,
                t.erpCategoryGuid,
                t.isVariable,
                t.body,
                t.bodyStyle,
                t.actionId,
                t.actionGuid,
                t.templateFooter,
                t.fileGuids,
                t.createdOn,
                t.modifiedOn,
                t.isActive,
                t.isDelete
            FROM templates t
            LEFT JOIN category c ON t.categoryGuid = c.guid
            WHERE t.isDelete = 0
            ORDER BY t.createdOn DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Query failed: " . $conn->error]);
        exit();
    }
    
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = [
            'id' => $row['id'],
            'guid' => $row['guid'],
            'template_name' => $row['template_name'],
            'category' => $row['category'],
            'categoryGuid' => $row['categoryGuid'],
            'languageGuid' => $row['languageGuid'],
            'template_type' => $row['template_type'],
            'isFile' => (bool)$row['isFile'],
            'templateHeaders' => json_decode($row['templateHeaders'], true) ?? [],
            'erpCategoryGuid' => $row['erpCategoryGuid'],
            'isVariable' => (bool)$row['isVariable'],
            'body' => $row['body'],
            'bodyStyle' => $row['bodyStyle'],
            'actionId' => $row['actionId'],
            'actionGuid' => $row['actionGuid'],
            'template_footer' => $row['templateFooter'],
            'fileGuids' => json_decode($row['fileGuids'], true) ?? [],
            'createdOn' => $row['createdOn'],
            'modifiedOn' => $row['modifiedOn'],
            'isActive' => (bool)$row['isActive'],
            'isDelete' => (bool)$row['isDelete']
        ];
    }
    
    echo json_encode(["status" => "success", "data" => $templates]);
    exit();
}

// Handle POST request to create new template with new structure
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $requiredFields = ['name', 'categoryGuid', 'languageGuid', 'typeId'];
    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields: " . implode(', ', $missingFields)]);
        exit();
    }

    // Generate GUID if not provided
    $guid = $data['guid'] ?? bin2hex(random_bytes(16));
    $currentDateTime = date('Y-m-d H:i:s');

    // Prepare SQL with new structure
    $sql = "INSERT INTO templates (
                guid, name, categoryGuid, languageGuid, typeId, isFile,
                templateHeaders, erpCategoryGuid, isVariable, body, bodyStyle,
                actionId, actionGuid, templateFooter, fileGuids, createdOn,
                modifiedOn, isActive, isDelete
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }

    $name = $data['name'];
    $categoryGuid = $data['categoryGuid'];
    $languageGuid = $data['languageGuid'];
    $typeId = $data['typeId'];
    $isFile = $data['isFile'] ?? 0;
    $templateHeaders = json_encode($data['templateHeaders'] ?? []);
    $isVariable = $data['isVariable'] ?? 0;
    $body = $data['body'] ?? '';
    $bodyStyle = $data['bodyStyle'] ?? '';
   $erpCategoryGuid = isset($data['erpCategoryGuid']) ? $data['erpCategoryGuid'] : null;
$actionId = isset($data['actionId']) ? $data['actionId'] : null;
$actionGuid = isset($data['actionGuid']) ? $data['actionGuid'] : null;
$templateFooter = isset($data['templateFooter']) ? $data['templateFooter'] : null;

    $fileGuids = json_encode($data['fileGuids'] ?? []);
    $createdOn = $currentDateTime;
    $modifiedOn = $currentDateTime;
    $isActive = 1;
    $isDelete = 0;

  $stmt->bind_param(
    "sssssisissssssssssi",
    $guid, $name, $categoryGuid, $languageGuid, $typeId, $isFile,
    $templateHeaders, $erpCategoryGuid, $isVariable, $body, $bodyStyle,
    $actionId, $actionGuid, $templateFooter, $fileGuids,
    $createdOn, $modifiedOn, $isActive, $isDelete
);


    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        echo json_encode([
            "status" => "success",
            "message" => "Template stored successfully",
            "data" => [
                "id" => $newId,
                "guid" => $guid
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Execution failed: " . $stmt->error]);
    }

    $stmt->close();
    exit();
}

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Template ID is required"]);
        exit();
    }
    
    $id = $data['id'];

    // Check if template exists
    $checkSql = "SELECT id FROM templates WHERE id = ? AND isDelete = 0";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkStmt->store_result();
    
    if ($checkStmt->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Template not found"]);
        $checkStmt->close();
        exit();
    }
    $checkStmt->close();

    // Perform soft delete
    $deleteSql = "UPDATE templates SET isDelete = 1, modifiedOn = NOW() WHERE id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $id);
    
    if ($deleteStmt->execute()) {
        if ($deleteStmt->affected_rows > 0) {
            echo json_encode([
                "status" => "success", 
                "message" => "Template deleted successfully",
                "deleted_id" => $id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "No rows affected"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete template: " . $deleteStmt->error]);
    }
    
    $deleteStmt->close();
    exit();
}

$conn->close();
?>