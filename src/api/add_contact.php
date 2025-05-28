<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, DELETE");

$conn = new mysqli("localhost", "root", "", "whatsapp");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit;
}

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
    $input = json_decode(file_get_contents("php://input"), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["status" => false, "message" => "Invalid JSON input"]);
        $conn->close();
        exit;
    }

    // Handle single contact addition
    if (isset($input['contact_group'])) {
        // Check if contact already exists
        $checkStmt = $conn->prepare("SELECT id FROM contacts WHERE mobile_number = ?");
        $checkStmt->bind_param("s", $input['mobile_number']);
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows > 0) {
            echo json_encode(["status" => false, "message" => "Contact with this number already exists"]);
            $checkStmt->close();
            $conn->close();
            exit;
        }
        $checkStmt->close();

        // Insert new contact
        $stmt = $conn->prepare("INSERT INTO contacts (contact_group, country_code, mobile_number, contact_name, tags) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", 
            $input['contact_group'],
            $input['country_code'],
            $input['mobile_number'],
            $input['contact_name'],
            $input['tags']
        );

        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "Contact added successfully"
            ]);
        } else {
            echo json_encode([
                "status" => false,
                "message" => "Failed to add contact: " . $stmt->error
            ]);
        }
        $stmt->close();
        $conn->close();
        exit;
    }
    // Handle CSV import (keep your existing import code)
    elseif (isset($input['action']) && $input['action'] === 'import') {
     } else {
        echo json_encode(["status" => false, "message" => "Invalid POST data"]);
        $conn->close();
        exit;
    }
}

// === DELETE - Single or Bulk delete ===
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);

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

        // Using call_user_func_array for dynamic params
        $params = array_merge([$types], $input['ids']);
        $tmp = [];
        foreach ($params as $key => $value) {
            $tmp[$key] = &$params[$key];
        }
        call_user_func_array([$stmt, 'bind_param'], $tmp);

        $success = $stmt->execute();
        $stmt->close();

        echo json_encode([
            "status" => $success,
            "message" => $success ? "Deleted successfully" : "Failed to delete"
        ]);
        $conn->close();
        exit;
    } elseif (isset($input['id'])) {
        // Single delete
        $stmt = $conn->prepare("DELETE FROM contacts WHERE id = ?");
        $stmt->bind_param("i", $input['id']);
        $success = $stmt->execute();
        $stmt->close();

        echo json_encode([
            "status" => $success,
            "message" => $success ? "Deleted successfully" : "Failed to delete"
        ]);
        $conn->close();
        exit;
    } else {
        echo json_encode(["status" => false, "message" => "Invalid DELETE input"]);
        $conn->close();
        exit;
    }
}

// === Fallback for unsupported methods or no match ===
echo json_encode(["status" => false, "message" => "Invalid request"]);
$conn->close();
exit;
