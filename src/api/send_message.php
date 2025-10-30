<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$mobile = $data['mobile_number'];
$message = $data['message'];

if (empty($mobile) || empty($message)) {
    echo json_encode(["status" => false, "message" => "Missing parameters"]);
    exit;
}

// find contact
$stmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
$stmt->bind_param("s", $mobile);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["status" => false, "message" => "Contact not found"]);
    exit;
}
$contact = $res->fetch_assoc();
$contact_id = $contact['id'];

/* -----------------------------
   ✅ WhatsApp Cloud API Config
----------------------------- */
$phone_number_id = "779927621877990"; // <-- replace with your real phone number ID
$access_token = "EAAS5pfUImY8BP7ToHKR1GSFvGdxmXegV3C3m9FxnByhaZAvNKXJ1DuulhYPjmqGIngnUPE26EZCZCjWZBxiXLL1abZBf0BLlBi6iYAPvIX0Y36ZCHwENgnKzsSN9VVWHBiJ8WFJmZAHJHz0ok0ml8cCY9s7p7ComK1iFfMrSLeOUMXqbFWpGOw4OaxZAo12xhVbI8bQxHSsvmImWBldPhf9dZCcoFlA6TYuTUJC1BTm4wFOBKR5ZBN9j0WIfE8IdzSPrjksmMBtXcJVdneEofAI8yEwEsd5jAxBRhWp1Caawpx7zfy";         // <-- replace with your permanent access token

$url = "https://graph.facebook.com/v20.0/779927621877990/messages";
$payload = [
    "messaging_product" => "whatsapp",
    "to" => "91" . $mobile, // include country code
    "type" => "text",
    "text" => ["body" => $message]
];

/* -----------------------------
   ✅ Send message via Meta API
----------------------------- */
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $access_token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(["status" => false, "message" => curl_error($ch)]);
    exit;
}
curl_close($ch);

$responseData = json_decode($response, true);

/* -----------------------------
   ✅ Store message in DB
----------------------------- */
$stmt = $conn->prepare("
    INSERT INTO messages (contact_id, message, direction, timestamp)
    VALUES (?, ?, 'outgoing', NOW())
");
$stmt->bind_param("is", $contact_id, $message);
$stmt->execute();

$conn->query("
    UPDATE contacts
    SET last_message = '$message', last_message_time = NOW()
    WHERE id = $contact_id
");

/* -----------------------------
   ✅ Final response
----------------------------- */
if (isset($responseData['messages'][0]['id'])) {
    echo json_encode(["status" => true, "message" => "Message sent successfully"]);
} else {
    echo json_encode(["status" => false, "message" => "Failed to send message", "meta_response" => $responseData]);
}
?>
