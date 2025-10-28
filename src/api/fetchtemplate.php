<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

$sql = "
SELECT 
t.id, 
t.name, 
t.categoryName, 
l.languageName,
t.meta_template_id,
t.meta_status,
t.template_json
 FROM templates t
 JOIN language l ON l.guid = t.languageGuid
 WHERE t.isDelete = 0 AND t.meta_template_id IS NOT NULL";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $templates = [];

    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "count" => count($templates),
        "data" => $templates
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "count" => 0,
        "data" => []
    ]);
}

$conn->close();
?>
