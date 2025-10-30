<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Handle webhook verification (from Meta)
if ($method === 'GET') {
    $verify_token = "YOUR_VERIFY_TOKEN"; // Set this yourself
    $mode = $_GET['hub_mode'] ?? '';
    $token = $_GET['hub_verify_token'] ?? '';
    $challenge = $_GET['hub_challenge'] ?? '';

    if ($mode === 'subscribe' && $token === $verify_token) {
        echo $challenge;
    } else {
        http_response_code(403);
        echo "Verification failed";
    }
    exit;
}

// ✅ Handle actual message webhook
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Invalid JSON"]);
        exit;
    }

    $entry = $data['entry'][0]['changes'][0]['value'] ?? null;
    if (!$entry || !isset($entry['messages'])) {
        echo json_encode(["status" => true, "message" => "No new message"]);
        exit;
    }

    $contacts = $entry['contacts'][0];
    $messages = $entry['messages'];
    $wa_id = $contacts['wa_id']; // e.g. "919876543210"
    $contact_name = $contacts['profile']['name'] ?? '';
    $country_code = '+' . substr($wa_id, 0, strlen($wa_id) - 10);
    $mobile_number = substr($wa_id, -10);

    foreach ($messages as $msg) {
        $text = $msg['text']['body'] ?? '';
        $timestamp = date("Y-m-d H:i:s", $msg['timestamp']);

        // 🔍 Check existing contact
        $stmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
        $stmt->bind_param("s", $mobile_number);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $contact = $result->fetch_assoc();
            $contact_id = $contact['id'];
        } else {
            // 🆕 Insert new contact
            $stmt_insert = $conn->prepare("
                INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, created_at)
                VALUES ('WhatsApp', ?, ?, ?, NOW())
            ");
            $stmt_insert->bind_param("sss", $country_code, $mobile_number, $contact_name);
            $stmt_insert->execute();
            $contact_id = $stmt_insert->insert_id;
        }

        // 📝 Update contact’s latest message
        $stmt_update = $conn->prepare("
            UPDATE contacts
            SET last_message = ?, last_message_time = ?, unread_count = unread_count + 1
            WHERE id = ?
        ");
        $stmt_update->bind_param("ssi", $text, $timestamp, $contact_id);
        $stmt_update->execute();

        // 💬 Insert message
        $stmt_msg = $conn->prepare("
            INSERT INTO messages (contact_id, message, direction, timestamp)
            VALUES (?, ?, 'incoming', ?)
        ");
        $stmt_msg->bind_param("iss", $contact_id, $text, $timestamp);
        $stmt_msg->execute();
    }

    echo json_encode(["status" => true, "message" => "Webhook received"]);
}

$conn->close();
?>
