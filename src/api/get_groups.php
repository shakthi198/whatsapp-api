<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "whatsapp");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents("php://input"), true);
$groupName = $input['group'] ?? null;

// If group is provided, return contacts in that group
if ($groupName) {
    $stmt = $conn->prepare("SELECT contact_name, country_code, mobile_number FROM contacts WHERE contact_group=?");
    $stmt->bind_param("s", $groupName);
    $stmt->execute();
    $result = $stmt->get_result();

    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }

    echo json_encode(["status" => true, "data" => $contacts]);
    $conn->close();
    exit;
}

// Otherwise, return all groups with total contacts
$sql = "SELECT contact_group, COUNT(*) AS total_contacts 
        FROM contacts 
        GROUP BY contact_group 
        ORDER BY contact_group ASC";

$result = $conn->query($sql);

$groups = [];
while ($row = $result->fetch_assoc()) {
    $groups[] = $row;
}

echo json_encode(["status" => true, "data" => $groups]);

$conn->close();
