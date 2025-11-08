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

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/* ======================================================
   ✅ 1. Handle Webhook Verification (GET)
====================================================== */
if ($method === 'GET') {
    $verify_token = "EAATAMciZBHOsBP8RDI8T1sKzVemDvIpoALbbioHFcyLG1Mc1SoLmlpPFGWhnBqCUmFyGAJDIrBaWMjSGlVIulSxa20cFAF6s1AzZCMZCGj6liSA9lkKAwqX7l1zlc6492vLQYZACwLej4b15x9hPj1H3wpQcDZBpXdM05O8le4fAAEHW4pyPPURPoC6sUQ3mcWwZDZD";

    // ✅ Use actual Meta GET params (with dots)
    $mode = $_GET['hub_mode'] ?? ($_GET['hub.mode'] ?? '');
    $token = $_GET['hub_verify_token'] ?? ($_GET['hub.verify_token'] ?? '');
    $challenge = $_GET['hub_challenge'] ?? ($_GET['hub.challenge'] ?? '');

    if ($mode === 'subscribe' && $token === $verify_token) {
        echo $challenge;
        exit;
    } else {
        http_response_code(403);
        echo "Verification failed";
        exit;
    }
}
/* ======================================================
   :white_tick: 2. Handle Actual Webhook (POST)
====================================================== */
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Invalid JSON"]);
        exit;
    }
    $entry = $data['entry'][0]['changes'][0]['value'] ?? null;
    if (!$entry) {
        echo json_encode(["status" => false, "message" => "No valid entry"]);
        exit;
    }
    /* ======================================================
       :large_green_circle: 2A. Handle Status Updates (sent, delivered, read, failed)
    ====================================================== */
    if (isset($entry['statuses'])) {
        foreach ($entry['statuses'] as $statusUpdate) {
            $messageId = $statusUpdate['id'] ?? null;
            $status = $statusUpdate['status'] ?? null;
            $timestamp = isset($statusUpdate['timestamp']) ? date('Y-m-d H:i:s', $statusUpdate['timestamp']) : date('Y-m-d H:i:s');
            $recipient = $statusUpdate['recipient_id'] ?? null;
            if ($messageId && $status) {
                // :white_tick: Update the existing message record in sent_messages
                $stmt = $conn->prepare("
                    UPDATE sent_messages
                    SET status = ?, updated_at = ?,
                        response_data = JSON_SET(
                            COALESCE(response_data, '{}'),
                            '$.last_status', ?
                        )
                    WHERE whatsapp_message_id = ?
                ");
                $stmt->bind_param("ssss", $status, $timestamp, $status, $messageId);
                $stmt->execute();
                // :white_tick: Optional: Log all statuses in a separate table
                $log = $conn->prepare("
                    INSERT INTO message_status_log (whatsapp_message_id, status, timestamp, recipient)
                    VALUES (?, ?, ?, ?)
                ");
                $log->bind_param("ssss", $messageId, $status, $timestamp, $recipient);
                $log->execute();
            }
        }
        echo json_encode(["status" => true, "message" => "Status updates processed"]);
        exit;
    }
    /* ======================================================
       :large_yellow_circle: 2B. Handle Incoming Messages
    ====================================================== */
    if (isset($entry['messages'])) {
        $contacts = $entry['contacts'][0];
        $messages = $entry['messages'];
        $wa_id = $contacts['wa_id'];
        $contact_name = $contacts['profile']['name'] ?? '';
        $country_code = '+' . substr($wa_id, 0, strlen($wa_id) - 10);
        $mobile_number = substr($wa_id, -10);
        foreach ($messages as $msg) {
            $text = $msg['text']['body'] ?? '';
            $timestamp = isset($msg['timestamp']) ? date("Y-m-d H:i:s", $msg['timestamp']) : date("Y-m-d H:i:s");
            // :small_blue_diamond: Check existing contact
            $stmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
            $stmt->bind_param("s", $mobile_number);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($res->num_rows > 0) {
                $contact_id = $res->fetch_assoc()['id'];
            } else {
                // :small_blue_diamond: Insert new contact
                $insert = $conn->prepare("
                    INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, created_at)
                    VALUES ('WhatsApp', ?, ?, ?, NOW())
                ");
                $insert->bind_param("sss", $country_code, $mobile_number, $contact_name);
                $insert->execute();
                $contact_id = $insert->insert_id;
            }
            // :small_blue_diamond: Update contact’s last message
            $update = $conn->prepare("
                UPDATE contacts
                SET last_message = ?, last_message_time = ?, unread_count = unread_count + 1
                WHERE id = ?
            ");
            $update->bind_param("ssi", $text, $timestamp, $contact_id);
            $update->execute();
            // :small_blue_diamond: Save the incoming message
            $insertMsg = $conn->prepare("
                INSERT INTO messages (contact_id, message, direction, timestamp)
                VALUES (?, ?, 'incoming', ?)
            ");
            $insertMsg->bind_param("iss", $contact_id, $text, $timestamp);
            $insertMsg->execute();
        }
        echo json_encode(["status" => true, "message" => "Incoming message processed"]);
        exit;
    }
    echo json_encode(["status" => true, "message" => "No actionable data"]);
    exit;
}
$conn->close();
?>