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
    // ✅ 1. Get phone number from query
    $phone = isset($_GET['phone']) ? trim($conn->real_escape_string($_GET['phone'])) : '';

    if (!$phone) {
        echo json_encode(["status" => false, "message" => "Phone number is required."]);
        exit;
    }

    // --- Normalize number (remove +, spaces) ---
    $cleanPhone = preg_replace('/\D/', '', $phone);

    // ✅ 2. Fetch Customer Info
    $custQuery = $conn->prepare("
        SELECT id, companyName, primary_contact_name, email, city, state, country, waba_number
        FROM customer_crud
        WHERE REPLACE(REPLACE(waba_number, '+', ''), ' ', '') LIKE ?
        LIMIT 1
    ");
    $likeParam = "%" . $cleanPhone . "%";
    $custQuery->bind_param("s", $likeParam);
    $custQuery->execute();
    $custResult = $custQuery->get_result();
    $customer = $custResult->fetch_assoc();

    // ✅ 3. Fetch Message Logs
    $logQuery = $conn->prepare("
        SELECT id, message_id, message_text, recipient_id, status, timestamp, 
               FROM_UNIXTIME(timestamp / 1000, '%Y-%m-%d %H:%i:%s') AS readable_time
        FROM whatsapp_statuses
        WHERE REPLACE(REPLACE(recipient_id, '+', ''), ' ', '') LIKE ?
        ORDER BY timestamp DESC
    ");
    $logQuery->bind_param("s", $likeParam);
    $logQuery->execute();
    $logResult = $logQuery->get_result();

    $logs = [];
    while ($row = $logResult->fetch_assoc()) {
        $logs[] = $row;
    }

    // ✅ 4. Combine and send response
    if ($customer || count($logs) > 0) {
        echo json_encode([
            "status" => true,
            "customer" => $customer ?: null,
            "data" => $logs
        ]);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "No records found for this number."
        ]);
    }
}

elseif ($method === 'POST') {
    // ✅ Insert a new status (Webhook simulation)
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
