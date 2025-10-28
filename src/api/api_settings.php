<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

$response = [];

try {
    $sql = "SELECT id, base_url, access_token, app_id, app_secret, number_id, waba_id, created_at 
            FROM api_settings 
            ORDER BY id DESC 
            LIMIT 1"; // optional: fetch only the latest record
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $data = $result->fetch_assoc();
        $response = [
            "status" => "success",
            "data" => $data
        ];
    } else {
        $response = [
            "status" => "error",
            "message" => "No API settings found"
        ];
    }

} catch (Exception $e) {
    $response = [
        "status" => "error",
        "message" => "Database query failed",
        "error" => $e->getMessage()
    ];
}

echo json_encode($response);
$conn->close();
?>
