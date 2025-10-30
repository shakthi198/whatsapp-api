<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

$contact_id = $_GET['contact_id'] ?? null;
if (!$contact_id) {
    echo json_encode(["status" => false, "message" => "Missing contact_id"]);
    exit;
}

$sql = "SELECT id, message, direction, status, timestamp 
        FROM messages 
        WHERE contact_id = ? 
        ORDER BY timestamp ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $contact_id);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
$conn->close();
