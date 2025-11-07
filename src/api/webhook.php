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
    $verify_token = "EAATAMciZBHOsBP3Qafn448hWyHeB2RYkm11pZABu92mP183Xbu698Mk6dsHpTrtrgysLpJR4b69ugZBkVcdMHfHQ4lfbk9fPEyCYC724xLIJcvnBfrwnjbQuGUVNSgISfdr48c6lIiBWmksFPkjAG8wk7GJcAT9PkEjTDQDTl48pFUj0YW5wCXQRYZCZAE33zkwZDZD"; // Must match the one set in Meta Webhook settings
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

/* ======================================================
   ✅ 2. Handle Actual Webhook (POST)
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
       🟢 2A. Handle Status Updates (sent, delivered, read, failed)
    ====================================================== */
    if (isset($entry['statuses'])) {
        foreach ($entry['statuses'] as $statusUpdate) {
            $messageId = $statusUpdate['id'] ?? null;
            $status = $statusUpdate['status'] ?? null;
            $timestamp = isset($statusUpdate['timestamp']) ? date('Y-m-d H:i:s', $statusUpdate['timestamp']) : date('Y-m-d H:i:s');
            $recipient = $statusUpdate['recipient_id'] ?? null;

            if ($messageId && $status) {
                // ✅ Update the existing message record in sent_messages
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

                // ✅ Optional: Log all statuses in a separate table
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
       🟡 2B. Handle Incoming Messages
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

            // 🔹 Check existing contact
            $stmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
            $stmt->bind_param("s", $mobile_number);
            $stmt->execute();
            $res = $stmt->get_result();

            if ($res->num_rows > 0) {
                $contact_id = $res->fetch_assoc()['id'];
            } else {
                // 🔹 Insert new contact
                $insert = $conn->prepare("
                    INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, created_at)
                    VALUES ('WhatsApp', ?, ?, ?, NOW())
                ");
                $insert->bind_param("sss", $country_code, $mobile_number, $contact_name);
                $insert->execute();
                $contact_id = $insert->insert_id;
            }

            // 🔹 Update contact’s last message
            $update = $conn->prepare("
                UPDATE contacts
                SET last_message = ?, last_message_time = ?, unread_count = unread_count + 1
                WHERE id = ?
            ");
            $update->bind_param("ssi", $text, $timestamp, $contact_id);
            $update->execute();

            // 🔹 Save the incoming message
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
