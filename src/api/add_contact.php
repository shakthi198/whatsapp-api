<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, DELETE");

require_once "config.php";

// $conn = new mysqli("localhost", "root", "", "whatsapp");

// if ($conn->connect_error) {
//     echo json_encode(["status" => false, "message" => "Database connection failed"]);
//     exit;
// }

// Decode input for POST/DELETE requests
$input = json_decode(file_get_contents("php://input"), true);

// === GET - Fetch all contacts ===
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM contacts");
    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }
    echo json_encode($contacts);
    $conn->close();
    exit;
}

// === POST - Add or Import contacts ===
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["status" => false, "message" => "Invalid JSON input"]);
        $conn->close();
        exit;
    }

    // === Edit existing contact ===
    if (isset($input['action']) && $input['action'] === 'edit' && isset($input['id'])) {
        $contact_group = $input['contact_group'] ?? '';
        $country_code = $input['country_code'] ?? '+91';
        $mobile_number = $input['mobile_number'] ?? '';
        $contact_name = $input['contact_name'] ?? '';
        $tags = $input['tags'] ?? '';
        $id = $input['id'];

        $stmt = $conn->prepare("UPDATE contacts SET contact_group=?, country_code=?, mobile_number=?, contact_name=?, tags=? WHERE id=?");
        $stmt->bind_param("sssssi", $contact_group, $country_code, $mobile_number, $contact_name, $tags, $id);

        if ($stmt->execute()) {
            echo json_encode(["status" => true, "message" => "Contact updated successfully"]);
        } else {
            echo json_encode(["status" => false, "message" => "Update failed: " . $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit;
    }

// === POST - Add a new group ===
// === Add new group (without adding a contact) ===
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['action']) && $input['action'] === 'add_group') {
    $group = trim($input['contact_group'] ?? '');
    if (!$group) {
        echo json_encode(["status" => false, "message" => "Group name required"]);
        $conn->close();
        exit;
    }

    // Optional: check if group already exists in contacts table
    $stmt = $conn->prepare("SELECT * FROM contacts WHERE contact_group = ? LIMIT 1");
    $stmt->bind_param("s", $group);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows > 0) {
        echo json_encode(["status" => false, "message" => "Group already exists"]);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Return success without inserting contact
    echo json_encode(["status" => true, "message" => "Group added successfully"]);
    $conn->close();
    exit;
}


    // === Add single contact ===
    if (isset($input['contact_group']) && !isset($input['action'])) {
        $contact_group = $input['contact_group'];
        $country_code = $input['country_code'] ?? '+91';
        $mobile_number = $input['mobile_number'] ?? '';
        $contact_name = $input['contact_name'] ?? '';
        $tags = $input['tags'] ?? '';

        // Check duplicate mobile
        $checkStmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
        $checkStmt->bind_param("s", $mobile_number);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            echo json_encode(["status" => false, "message" => "Contact with this number already exists"]);
            $checkStmt->close();
            $conn->close();
            exit;
        }
        $checkStmt->close();

        $stmt = $conn->prepare("INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, tags) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $contact_group, $country_code, $mobile_number, $contact_name, $tags);

        if ($stmt->execute()) {
            echo json_encode(["status" => true, "message" => "Contact added successfully"]);
        } else {
            echo json_encode(["status" => false, "message" => "Failed to add contact: " . $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit;
    }

    // === Import contacts from CSV / array ===
   // Handle CSV import
elseif (isset($input['action']) && $input['action'] === 'import') {
    if (!isset($input['contact_group']) || !isset($input['contacts'])) {
        echo json_encode(["status" => false, "message" => "Missing group or contacts"]);
        $conn->close();
        exit;
    }

    $contact_group = $input['contact_group'];
    $contacts = $input['contacts']; // array of associative arrays from CSV
    $stmt = $conn->prepare("INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, tags) VALUES (?, ?, ?, ?, ?)");
    $errors = [];

    foreach ($contacts as $contact) {
        // Map CSV columns correctly (case-insensitive)
        $country_code = isset($contact['country_code']) ? $contact['country_code'] : (isset($contact['Country Code']) ? $contact['Country Code'] : '+91');
        $mobile_number = isset($contact['mobile_number']) ? trim($contact['mobile_number']) : (isset($contact['Mobile Number']) ? trim($contact['Mobile Number']) : '');
        $contact_name = isset($contact['contact_name']) ? trim($contact['contact_name']) : (isset($contact['Contact Name']) ? trim($contact['Contact Name']) : '');
        $tags = isset($contact['tags']) ? $contact['tags'] : '';

        if ($mobile_number === '' || $contact_name === '') {
            $errors[] = "Skipping invalid row: " . json_encode($contact);
            continue;
        }

        $stmt->bind_param("sssss", $contact_group, $country_code, $mobile_number, $contact_name, $tags);
        if (!$stmt->execute()) {
            $errors[] = "Failed to insert: " . $contact_name . " - " . $stmt->error;
        }
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        "status" => count($errors) === 0,
        "message" => count($errors) === 0 ? "Contacts imported successfully" : "Some contacts failed",
        "errors" => $errors
    ]);
    exit;
}

}

// === DELETE - Single or Bulk delete ===
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["status" => false, "message" => "Invalid JSON input"]);
        $conn->close();
        exit;
    }

    if (isset($input['ids']) && is_array($input['ids'])) {
        // Bulk delete
        $placeholders = implode(',', array_fill(0, count($input['ids']), '?'));
        $types = str_repeat('i', count($input['ids']));
        $stmt = $conn->prepare("DELETE FROM contacts WHERE id IN ($placeholders)");

        $params = array_merge([$types], $input['ids']);
        $tmp = [];
        foreach ($params as $key => $value) {
            $tmp[$key] = &$params[$key];
        }
        call_user_func_array([$stmt, 'bind_param'], $tmp);

        $success = $stmt->execute();
        $stmt->close();

        echo json_encode(["status" => $success, "message" => $success ? "Deleted successfully" : "Failed to delete"]);
        $conn->close();
        exit;
    } elseif (isset($input['id'])) {
        // Single delete
        $stmt = $conn->prepare("DELETE FROM contacts WHERE id = ?");
        $stmt->bind_param("i", $input['id']);
        $success = $stmt->execute();
        $stmt->close();

        echo json_encode(["status" => $success, "message" => $success ? "Deleted successfully" : "Failed to delete"]);
        $conn->close();
        exit;
    } else {
        echo json_encode(["status" => false, "message" => "Invalid DELETE input"]);
        $conn->close();
        exit;
    }
}

// === Fallback for unsupported methods ===
echo json_encode(["status" => false, "message" => "Invalid request"]);
$conn->close();
exit;
