<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $flow_id = intval($_GET["flow_id"]);
    $result = $conn->query("SELECT * FROM flow_charts WHERE flow_id=$flow_id LIMIT 1");

    if ($row = $result->fetch_assoc()) {
        // Decode chart_data to PHP array/object
        $row['chart_data'] = json_decode($row['chart_data'], true); 
        // Send JSON to frontend
        echo json_encode([$row]); // keep it as an array like your frontend expects
    } else {
        echo json_encode([]);
    }
}

elseif ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $flow_id = intval($data["flow_id"]);

    // If chart_data is already an array, encode it once
    $chart_data = $conn->real_escape_string(json_encode($data["chart_data"]));

    $check = $conn->query("SELECT id FROM flow_charts WHERE flow_id=$flow_id LIMIT 1");
    if ($check->num_rows > 0) {
        $sql = "UPDATE flow_charts SET chart_data='$chart_data' WHERE flow_id=$flow_id";
    } else {
        $sql = "INSERT INTO flow_charts (flow_id, chart_data) VALUES ($flow_id, '$chart_data')";
    }

    if ($conn->query($sql)) {
        // return inserted/updated id for frontend
        $id = $check->num_rows > 0 ? $check->fetch_assoc()['id'] : $conn->insert_id;
        echo json_encode(["success" => true, "id" => $id]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}
?>
