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
require_once "config.php";
// Get POST data
$input = json_decode(file_get_contents("php://input"), true);
$groupName = $input['group'] ?? null;
$action = $input['action'] ?? null; // ---> Added for group insertion
// ---> If action = add_group, insert a new group
if ($action === "add_group" && !empty($groupName)) {
    $check = $conn->prepare("SELECT id FROM `groups` WHERE groupname=? AND isdelete=0");
    $check->bind_param("s", $groupName);
    $check->execute();
    $check->store_result();
    if ($check->num_rows > 0) {
        echo json_encode(["status" => false, "message" => "Group name already exists"]);
        $check->close();
        $conn->close();
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO `groups` (groupname, isactive, isdelete) VALUES (?, 1, 0)");
    $stmt->bind_param("s", $groupName);
    if ($stmt->execute()) {
        // Fetch updated list of groups to show in dropdown
        $groups = [];
        $result = $conn->query("SELECT id, groupname FROM `groups` WHERE isdelete=0 AND isactive=1 ORDER BY groupname ASC");
        while ($row = $result->fetch_assoc()) {
            $groups[] = $row;
        }
        echo json_encode(["status" => true, "message" => "Group added successfully", "data" => $groups]);
    } else {
        echo json_encode(["status" => false, "message" => "Failed to add group"]);
    }
    $stmt->close();
    $conn->close();
    exit;
}
// ---> End of group insertion
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
$sql = "
    SELECT 
        g.id, 
        g.groupname, 
        COUNT(c.id) AS total_contacts
    FROM groups g
    LEFT JOIN contacts c 
        ON c.contact_group = g.groupname
    WHERE g.isdelete = 0 AND g.isactive = 1
    GROUP BY g.id, g.groupname
    ORDER BY g.groupname ASC
";
$result = $conn->query($sql);
$groups = [];
while ($row = $result->fetch_assoc()) {
    $groups[] = $row;
}
echo json_encode(["status" => true, "data" => $groups]);
$conn->close();