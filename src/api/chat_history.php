<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

// ✅ Fetch only contacts with messages
$sql = "
    SELECT 
        c.id,
        c.contact_name,
        c.mobile_number,
        (
            SELECT m.message 
            FROM messages m 
            WHERE m.contact_id = c.id 
            ORDER BY m.timestamp DESC 
            LIMIT 1
        ) AS last_message,
        (
            SELECT m.timestamp 
            FROM messages m 
            WHERE m.contact_id = c.id 
            ORDER BY m.timestamp DESC 
            LIMIT 1
        ) AS last_message_time,
        (
            SELECT COUNT(*) 
            FROM messages m 
            WHERE m.contact_id = c.id 
              AND m.direction = 'incoming' 
              AND m.status != 'read'
        ) AS unread_count
    FROM contacts c
    WHERE EXISTS (
        SELECT 1 FROM messages m WHERE m.contact_id = c.id
    )
    ORDER BY last_message_time DESC
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => false, "message" => $conn->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "id" => $row['id'],
        "contact_name" => $row['contact_name'],
        "mobile_number" => $row['mobile_number'],
        "last_message" => $row['last_message'],
        "last_message_time" => $row['last_message_time'],
        "unread_count" => (int)$row['unread_count']
    ];
}

echo json_encode(["status" => true, "data" => $data]);
$conn->close();
