<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include config
require_once "config.php";

// Database connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}

// Handle GET request: fetch all transactions
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM `transaction` ORDER BY `date_time` DESC";
    $result = $conn->query($sql);

    $transactions = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
    }

    echo json_encode(["status" => "success", "transactions" => $transactions]);
    $conn->close();
    exit;
}

// Handle POST request: add transaction
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
