<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    // Get all or single flow
    if (isset($_GET["id"])) {
        $id = intval($_GET["id"]);
        $result = $conn->query("SELECT * FROM flows WHERE id=$id");
        echo json_encode($result->fetch_assoc());
    } else {
        $result = $conn->query("SELECT * FROM flows ORDER BY created_at DESC");
        $flows = [];
        while ($row = $result->fetch_assoc()) {
            $flows[] = $row;
        }
        echo json_encode($flows);
    }
}

elseif ($method === "POST") {
    // Create new flow
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $conn->real_escape_string($data["name"]);
    $type = $conn->real_escape_string($data["type"]);
    $status = intval($data["status"]);
    $is_default = intval($data["is_default"]);
    $keywords = $conn->real_escape_string($data["keywords"]);
    $explanation = $conn->real_escape_string($data["explanation"]);

    $sql = "INSERT INTO flows (name, type, status, is_default, keywords, explanation)
            VALUES ('$name', '$type', $status, $is_default, '$keywords', '$explanation')";
    
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}

elseif ($method === "PUT") {
    // Update flow
    $id = intval($_GET["id"]);
    $data = json_decode(file_get_contents("php://input"), true);

    $updates = [];
    foreach ($data as $key => $value) {
        $updates[] = "$key='" . $conn->real_escape_string($value) . "'";
    }
    $sql = "UPDATE flows SET " . implode(", ", $updates) . " WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}

elseif ($method === "DELETE") {
    // Delete flow
    $id = intval($_GET["id"]);
    if ($conn->query("DELETE FROM flows WHERE id=$id")) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}
?>
