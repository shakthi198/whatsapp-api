<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once "config.php";

// DB Config
// $host = "localhost";
// $user = "root";
// $password = "";
// $database = "whatsapp";

// $conn = new mysqli($host, $user, $password, $database);

// if ($conn->connect_error) {
//     die(json_encode(["status" => false, "message" => "Database connection failed."]));
// }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch logs by WhatsApp number
    $phone = isset($_GET['phone']) ? trim($conn->real_escape_string($_GET['phone'])) : '';

    if (!$phone) {
        echo json_encode(["status" => false, "message" => "Phone number is required."]);
        exit;
    }

    // Flexible matching to avoid issues with '+' or spaces
    $sql = "SELECT * FROM whatsapp_statuses WHERE recipient_id LIKE '%$phone%' ORDER BY timestamp DESC";
    $result = $conn->query($sql);

    $logs = [];

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode(["status" => true, "data" => $logs]);
    } else {
        echo json_encode(["status" => false, "message" => "No logs found for this number."]);
    }
}

elseif ($method === 'POST') {
    // Insert a new status (Webhook simulation)
    $data = json_decode(file_get_contents("php://input"), true);

  if (isset($data['message_id'], $data['recipient_id'], $data['status'], $data['timestamp'], $data['message_text'])) {
    $message_id = $conn->real_escape_string($data['message_id']);
    $recipient_id = $conn->real_escape_string($data['recipient_id']);
    $status = $conn->real_escape_string($data['status']);
    $timestamp = (int)$data['timestamp'];
    $message_text = $conn->real_escape_string($data['message_text']);

    $sql = "INSERT INTO whatsapp_statuses (message_id, recipient_id, status, timestamp, message_text)
            VALUES ('$message_id', '$recipient_id', '$status', $timestamp, '$message_text')";

        if ($conn->query($sql)) {
            echo json_encode(["status" => true, "message" => "Status inserted successfully."]);
        } else {
            echo json_encode(["status" => false, "message" => "Insert failed: " . $conn->error]);
        }
    } else {
        echo json_encode(["status" => false, "message" => "Missing required fields."]);
    }
}

else {
    echo json_encode(["status" => false, "message" => "Invalid request method."]);
}

$conn->close();
?>
