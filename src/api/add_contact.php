<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "whatsapp");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? '';

/* -------------------------- GET ALL CONTACTS -------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM contacts");
    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }
    echo json_encode(["status" => true, "data" => $contacts]);
    exit;
}

/* -------------------------- POST REQUESTS -------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1️⃣ Edit Contact
    if ($action === 'edit' && isset($input['id'])) {
        $stmt = $conn->prepare("UPDATE contacts SET contact_group=?, country_code=?, mobile_number=?, contact_name=?, tags=? WHERE id=?");
        $stmt->bind_param(
            "sssssi",
            $input['contact_group'],
            $input['country_code'],
            $input['mobile_number'],
            $input['contact_name'],
            $input['tags'],
            $input['id']
        );
        $ok = $stmt->execute();
        echo json_encode(["status" => $ok, "message" => $ok ? "Contact updated" : "Failed: " . $stmt->error]);
        exit;
    }

    // 2️⃣ Add Group
    if ($action === 'add_group') {
        $group = trim($input['contact_group'] ?? '');
        if ($group === '') {
            echo json_encode(["status" => false, "message" => "Group name required"]);
            exit;
        }

        $check = $conn->prepare("SELECT id FROM groups WHERE groupname=?");
        $check->bind_param("s", $group);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) {
            echo json_encode(["status" => false, "message" => "Group already exists"]);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO groups (groupname, createdon, isactive) VALUES (?, NOW(), 1)");
        $stmt->bind_param("s", $group);
        $ok = $stmt->execute();
        echo json_encode(["status" => $ok, "message" => $ok ? "Group added" : "Failed: " . $stmt->error]);
        exit;
    }

    // 3️⃣ Create Group (and assign members)
    if ($action === 'create_group') {
        $groupName = trim($input['group_name'] ?? '');
        $contacts = $input['contacts'] ?? [];

        if (!$groupName) {
            echo json_encode(["status" => false, "message" => "Group name required"]);
            exit;
        }

        if (empty($contacts)) {
            echo json_encode(["status" => false, "message" => "No contacts selected"]);
            exit;
        }

        // Ensure group exists
        $check = $conn->prepare("SELECT id FROM groups WHERE groupname=?");
        $check->bind_param("s", $groupName);
        $check->execute();
        $res = $check->get_result();
        if ($res->num_rows === 0) {
            $ins = $conn->prepare("INSERT INTO groups (groupname, createdon, isactive) VALUES (?, NOW(), 1)");
            $ins->bind_param("s", $groupName);
            $ins->execute();
            $ins->close();
        }
        $check->close();

        // Assign members
        $stmt = $conn->prepare("UPDATE contacts SET contact_group=? WHERE id=?");
        foreach ($contacts as $cid) {
            $stmt->bind_param("si", $groupName, $cid);
            $stmt->execute();
        }
        $stmt->close();

        echo json_encode(["status" => true, "message" => "Group created successfully"]);
        exit;
    }

    // 4️⃣ Update existing group's members (from ManageGroups.js)
    if ($action === 'update_members') {
        $groupname = $input['group'] ?? '';
        $members = $input['members'] ?? [];

        if (!$groupname || empty($members)) {
            echo json_encode(["status" => false, "message" => "Missing groupname or members"]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE contacts SET contact_group=? WHERE id=?");
        if (!$stmt) {
            echo json_encode(["status" => false, "message" => "DB prepare failed: " . $conn->error]);
            exit;
        }

        foreach ($members as $mid) {
            $stmt->bind_param("si", $groupname, $mid);
            $stmt->execute();
        }

        $stmt->close();
        echo json_encode(["status" => true, "message" => "Group members updated successfully"]);
        exit;
    }

    // 5️⃣ Add Single Contact
    if (!empty($input['contact_group']) && empty($action)) {
        $stmt = $conn->prepare("INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, tags) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "sssss",
            $input['contact_group'],
            $input['country_code'],
            $input['mobile_number'],
            $input['contact_name'],
            $input['tags']
        );
        $ok = $stmt->execute();
        echo json_encode(["status" => $ok, "message" => $ok ? "Contact added" : "Failed: " . $stmt->error]);
        exit;
    }

    echo json_encode(["status" => false, "message" => "Invalid POST action"]);
    exit;
}

/* -------------------------- DELETE -------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $ids = $input['ids'] ?? [];
    if (!empty($ids)) {
        $placeholders = implode(",", array_fill(0, count($ids), "?"));
        $types = str_repeat("i", count($ids));
        $stmt = $conn->prepare("DELETE FROM contacts WHERE id IN ($placeholders)");
        $params = array_merge([$types], $ids);
        $tmp = [];
        foreach ($params as $k => $v) $tmp[$k] = &$params[$k];
        call_user_func_array([$stmt, 'bind_param'], $tmp);
        $stmt->execute();
        echo json_encode(["status" => true, "message" => "Contacts deleted"]);
        exit;
    }
}

echo json_encode(["status" => false, "message" => "Invalid request"]);
exit;
?>
