<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}
// ================= GET =================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                t.id, t.guid, t.name as template_name, 
                c.categoryName as category,
                t.categoryGuid, t.languageGuid, t.typeId as template_type,
                t.isFile, t.templateHeaders, t.erpCategoryGuid,
                t.isVariable, t.body, t.bodyStyle,
                t.actionId, t.actionGuid, t.templateFooter,
                t.fileGuids, t.createdOn, t.modifiedOn,
                t.isActive, t.isDelete
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
            'id' => (int)$row['id'],
            'guid' => $row['guid'],
            'template_name' => $row['template_name'],
            'category' => $row['category'],
            'categoryGuid' => $row['categoryGuid'],
            'languageGuid' => $row['languageGuid'],
            'template_type' => (int)$row['template_type'],
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

// ================= POST =================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $requiredFields = ['name', 'categoryGuid', 'languageGuid', 'typeId'];
    $missingFields = [];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) $missingFields[] = $field;
    }

    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields: " . implode(', ', $missingFields)]);
        exit();
    }

    $guid = $data['guid'] ?? bin2hex(random_bytes(16));
    $currentDateTime = date('Y-m-d H:i:s');

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

    // Ensure optional fields are null if not provided
    $name = $data['name'];
    $categoryGuid = $data['categoryGuid'];
    $languageGuid = $data['languageGuid'];
    $typeId = (int)$data['typeId'];
    $isFile = isset($data['isFile']) ? (int)$data['isFile'] : 0;
    $templateHeaders = json_encode($data['templateHeaders'] ?? []);
    $erpCategoryGuid = $data['erpCategoryGuid'] ?? '';
    $isVariable = isset($data['isVariable']) ? (int)$data['isVariable'] : 0;
    $body = $data['body'] ?? '';
    $bodyStyle = $data['bodyStyle'] ?? '';
   $actionId = isset($data['actionId']) ? (int)$data['actionId'] : 0;
  $actionGuid = $data['actionGuid'] ?? '';
    $templateFooter = $data['templateFooter'] ?? '';
    $fileGuids = json_encode($data['fileGuids'] ?? []);
    $createdOn = $currentDateTime;
    $modifiedOn = $currentDateTime;
    $isActive = 1;
    $isDelete = 0;

  $stmt->bind_param(
    "sssssississssssssii",
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
            "data" => ["id" => $newId, "guid" => $guid]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Execution failed: " . $stmt->error]);
    }

    $stmt->close();
    exit();
}

// ================= DELETE =================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Template ID is required"]);
        exit();
    }

    $id = (int)$data['id'];

    // Check if exists
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

    // Soft delete
    $deleteSql = "UPDATE templates SET isDelete = 1, modifiedOn = NOW() WHERE id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $id);

    if ($deleteStmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Template deleted successfully",
            "deleted_id" => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete template: " . $deleteStmt->error]);
    }

    $deleteStmt->close();
    exit();
}

$conn->close();
?>
