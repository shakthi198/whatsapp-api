<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include config
require_once "config.php";

// Database connection
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}

// Read POST data
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

// Prepare values
$transaction_id = "TXN" . time() . rand(1000,9999); // unique ID
$customer_name = $conn->real_escape_string($data['customer_name']);
$amount        = floatval($data['amount']);
$gst           = floatval($data['gst']);
$total_amount  = floatval($data['total_amount']);
$status        = $conn->real_escape_string($data['status']);
$date_time     = date("Y-m-d H:i:s");

// Insert into table
$sql = "INSERT INTO `transaction` (`transaction_id`, `customer_name`, `amount`, `gst`, `total_amount`, `status`, `date_time`)
        VALUES ('$transaction_id', '$customer_name', '$amount', '$gst', '$total_amount', '$status', '$date_time')";

if ($conn->query($sql) === TRUE) {
    $insertedTransaction = [
        "transaction_id" => $transaction_id,
        "customer_name" => $customer_name,
        "amount" => $amount,
        "gst" => $gst,
        "total_amount" => $total_amount,
        "status" => $status,
        "date_time" => $date_time
    ];
    echo json_encode(["status" => "success", "transaction" => $insertedTransaction]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>
