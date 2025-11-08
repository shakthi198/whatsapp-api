<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
require_once "config.php";

// 🔹 DB Connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// 🔹 Fetch WhatsApp API credentials
function getAPISettings($conn)
{
    $sql = "SELECT base_url, access_token, number_id FROM api_settings ORDER BY id DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return [
            "base_url" => rtrim($row['base_url'], '/'),
            "access_token" => trim($row['access_token']),
            "number_id" => trim($row['number_id'])
        ];
    }
    return null;
}

// 🔹 Fetch contacts from group
function getGroupContacts($conn, $groupName)
{
    $stmt = $conn->prepare("SELECT country_code, mobile_number FROM contacts WHERE contact_group = ?");
    $stmt->bind_param("s", $groupName);
    $stmt->execute();
    $result = $stmt->get_result();

    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }
    return $contacts;
}

// 🔹 Store message in DB
function storeMessage($conn, $data)
{
    try {
        $sql = "INSERT INTO sent_messages (
            phone_number, country_code, mobile_number, message_content,
            template_name, template_id, whatsapp_message_id, status,
            message_type, response_data, sent_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

        $response_data = json_encode($data['response_data'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $stmt->bind_param(
            "sssssssssss",
            $data['phone_number'],
            $data['country_code'],
            $data['mobile_number'],
            $data['message_content'],
            $data['template_name'],
            $data['template_id'],
            $data['whatsapp_message_id'],
            $data['status'],
            $data['message_type'],
            $response_data,
            $data['sent_at']
        );
        $stmt->execute();
        $stmt->close();
        return true;
    } catch (Exception $e) {
        error_log("DB Error: " . $e->getMessage());
        return false;
    }
}

// 🔹 Parse Input
$input = json_decode(file_get_contents("php://input"), true);

if (
    !$input ||
    (empty($input['to']) && empty($input['group_name'])) ||
    empty($input['template_name']) ||
    empty($input['language'])
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$template_name = $input['template_name'];
$template_id = $input['template_id'] ?? null;
$language = $input['language'];
$variables = $input['variables'] ?? [];
$header = $input['header'] ?? null;
$buttons = $input['buttons'] ?? [];
$message_content = $input['message_content'] ?? '';

// 🔹 Get API Settings
$settings = getAPISettings($conn);
if (!$settings) {
    echo json_encode(["status" => "error", "message" => "API credentials not found"]);
    exit;
}

$url = "{$settings['base_url']}/{$settings['number_id']}/messages";
$token = $settings['access_token'];

// 🔹 Prepare Components (HEADER + BODY + BUTTONS)
function buildTemplateComponents($header, $variables, $buttons)
{
    $components = [];

    // HEADER
    if ($header && isset($header['type'])) {
        $type = strtolower($header['type']);
        $param = [];
        if ($type === 'text') {
            $param = [["type" => "text", "text" => $header['text']]];
        } elseif ($type === 'image') {
            $param = [["type" => "image", "image" => ["link" => $header['link']]]];
        } elseif ($type === 'video') {
            $param = [["type" => "video", "video" => ["link" => $header['link']]]];
        } elseif ($type === 'document') {
            $param = [["type" => "document", "document" => ["link" => $header['link']]]];
        }
        $components[] = ["type" => "header", "parameters" => $param];
    }

    // BODY
    if (!empty($variables)) {
        $bodyParams = [];
        foreach ($variables as $v) {
            $bodyParams[] = ["type" => "text", "text" => $v];
        }
        $components[] = ["type" => "body", "parameters" => $bodyParams];
    }

    // BUTTONS
    if (!empty($buttons)) {
        foreach ($buttons as $index => $btn) {
            if ($btn['type'] === 'URL') {
                $component = [
                    "type" => "button",
                    "sub_type" => "url",
                    "index" => strval($index)
                ];
                if (!empty($btn['parameter'])) {
                    $component["parameters"] = [["type" => "text", "text" => $btn['parameter']]];
                }
                $components[] = $component;
            } elseif ($btn['type'] === 'QUICK_REPLY') {
                $components[] = [
                    "type" => "button",
                    "sub_type" => "quick_reply",
                    "index" => strval($index),
                    "parameters" => [["type" => "payload", "payload" => $btn['payload']]]
                ];
            }
        }
    }

    return $components;
}

// 🔹 Function to Send WhatsApp Template
function sendWhatsAppMessage($url, $token, $to, $template_name, $language, $components)
{
    $payload = [
        "messaging_product" => "whatsapp",
        "to" => $to,
        "type" => "template",
        "template" => [
            "name" => $template_name,
            "language" => ["code" => $language],
            "components" => $components
        ]
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [$httpCode, json_decode($response, true)];
}

// 🔹 Single or Group Mode
$isGroup = !empty($input['group_name']);
$recipients = [];

if ($isGroup) {
    $recipients = getGroupContacts($conn, $input['group_name']);
    if (empty($recipients)) {
        echo json_encode(["status" => "error", "message" => "No contacts in group"]);
        exit;
    }
} else {
    $recipients[] = [
        "country_code" => substr($input['to'], 0, 3),
        "mobile_number" => substr($input['to'], -10)
    ];
}

// 🔁 Send Loop
$summary = ["success" => 0, "failed" => 0, "details" => []];
$components = buildTemplateComponents($header, $variables, $buttons);

foreach ($recipients as $contact) {
    $to = $contact['country_code'] . $contact['mobile_number'];

    [$httpCode, $result] = sendWhatsAppMessage($url, $token, $to, $template_name, $language, $components);

    if ($httpCode === 200 || $httpCode === 201) {
        $msgId = $result['messages'][0]['id'] ?? null;
        storeMessage($conn, [
            "phone_number" => $to,
            "country_code" => $contact['country_code'],
            "mobile_number" => $contact['mobile_number'],
            "message_content" => $message_content,
            "template_name" => $template_name,
            "template_id" => $template_id,
            "whatsapp_message_id" => $msgId,
            "status" => "sent",
            "message_type" => "template",
            "response_data" => $result,
            "sent_at" => date('Y-m-d H:i:s')
        ]);
        $summary['success']++;
    } else {
        $summary['failed']++;
        $summary['details'][] = [
            "number" => $to,
            "error" => $result['error']['message'] ?? "Unknown error"
        ];
    }

    // optional small delay
    if ($isGroup) usleep(500000);
}

echo json_encode([
    "status" => "success",
    "mode" => $isGroup ? "group" : "single",
    "message" => $isGroup ? "Group messages completed" : "Single message sent",
    "summary" => $summary
]);

$conn->close();
?>
