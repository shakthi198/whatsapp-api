<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

// DB Config
$host = "localhost";
$user = "root";
$password = "";
$database = "meta"; // Change this if needed

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => false, "message" => "Database connection failed."]));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['guid']) &&
        isset($data['languageName'])
    ) {
        $guid = $conn->real_escape_string($data['guid']);
        $languageName = $conn->real_escape_string($data['languageName']);
        $createdOn = date("Y-m-d H:i:s");
        $modifiedOn = date("Y-m-d H:i:s");
        $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
        $isDelete = 0;

        $sql = "INSERT INTO language (guid, languageName, createdOn, modifiedOn, isActive, isDelete)
                VALUES ('$guid', '$languageName', '$createdOn', '$modifiedOn', $isActive, $isDelete)";

        if ($conn->query($sql)) {
            echo json_encode(["status" => true, "message" => "Language inserted successfully."]);
        } else {
            echo json_encode(["status" => false, "message" => "Insert failed: " . $conn->error]);
        }
    } else {
        echo json_encode(["status" => false, "message" => "Missing required fields."]);
    }
}

elseif ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
        $sql = "SELECT * FROM language WHERE id = $id AND isDelete = 0 LIMIT 1";
        $result = $conn->query($sql);

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            echo json_encode(["status" => true, "data" => $row]);
        } else {
            echo json_encode(["status" => false, "message" => "Language not found."]);
        }
    } else {
        $sql = "SELECT * FROM language WHERE isDelete = 0 ORDER BY id DESC";
        $result = $conn->query($sql);

        $languages = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $languages[] = $row;
            }
            echo json_encode(["status" => true, "data" => $languages]);
        } else {
            echo json_encode(["status" => false, "message" => "No languages found."]);
        }
    }
}

else {
    echo json_encode(["status" => false, "message" => "Invalid request method."]);
}

$conn->close();
?>
