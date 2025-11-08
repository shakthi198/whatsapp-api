<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include("config.php");

// Set MySQL collation globally to avoid mix errors
$conn->set_charset("utf8mb4");

// Input: email (from frontend)
$data = json_decode(file_get_contents("php://input"), true);
$userEmail = $data['email'] ?? 'apple@gmail.com';

// Default response
$response = [
    "status" => "success",
    "user" => [],
    "balance" => 0,
    "usage" => ["used" => 0, "total" => 1000],
    "cards" => [
        "marketing" => 0,
        "authentication" => 0,
        "utility" => 0,
        "userInitiated" => 0,
        "businessInitiated" => 0
    ]
];

// 1️⃣ Fetch user info
$sql = "SELECT id, primary_contact_name, companyName, legal_business_name, city, country 
        FROM customer_crud WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $userEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

$user = $result->fetch_assoc();
$response["user"] = $user;

// 2️⃣ Fetch wallet balance
$sql = "SELECT SUM(total_amount) AS total_balance 
        FROM transaction 
        WHERE customer_name = ? AND status = 'Completed'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user["companyName"]);
$stmt->execute();
$balanceResult = $stmt->get_result()->fetch_assoc();
$response["balance"] = round($balanceResult["total_balance"] ?? 0, 2);

// 3️⃣ Fetch usage stats (messages sent)
$waba_number = $user["companyName"]; // or you can use waba_number if available
$sql = "SELECT COUNT(*) AS used 
        FROM sent_messages 
        WHERE phone_number LIKE ?";
$likePhone = "%$waba_number%";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $likePhone);
$stmt->execute();
$usageResult = $stmt->get_result()->fetch_assoc();
$response["usage"]["used"] = (int)($usageResult["used"] ?? 0);
$response["usage"]["total"] = 1000;

// 4️⃣ Fetch overview counts by category
$sql = "SELECT t.categoryName, COUNT(s.id) AS total
        FROM sent_messages s
        JOIN templates t 
        ON CONVERT(s.template_name USING utf8mb4) COLLATE utf8mb4_general_ci 
           = CONVERT(t.name USING utf8mb4) COLLATE utf8mb4_general_ci
        GROUP BY t.categoryName";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $cat = strtolower($row["categoryName"]);
        if (isset($response["cards"][$cat])) {
            $response["cards"][$cat] = (int)$row["total"];
        }
    }
}

// 5️⃣ Fetch user/business initiated counts (based on statuses)
$sql = "SELECT 
            SUM(status = 'sent') AS userInitiated,
            SUM(status IN ('delivered','read')) AS businessInitiated
        FROM whatsapp_statuses";
$statusResult = $conn->query($sql);
if ($statusResult && $row = $statusResult->fetch_assoc()) {
    $response["cards"]["userInitiated"] = (int)($row["userInitiated"] ?? 0);
    $response["cards"]["businessInitiated"] = (int)($row["businessInitiated"] ?? 0);
}

// 6️⃣ Fetch Client Overview (Send / Delivered / Read counts)
$clientOverview = [
    "sent" => 0,
    "delivered" => 0,
    "read" => 0
];

$sql = "SELECT 
            SUM(status = 'sent') AS sent,
            SUM(status = 'delivered') AS delivered,
            SUM(status = 'read') AS readCount
        FROM whatsapp_statuses";
$overviewResult = $conn->query($sql);

if ($overviewResult && $overviewRow = $overviewResult->fetch_assoc()) {
    $clientOverview["sent"] = (int)($overviewRow["sent"] ?? 0);
    $clientOverview["delivered"] = (int)($overviewRow["delivered"] ?? 0);
    $clientOverview["read"] = (int)($overviewRow["readCount"] ?? 0);
}

// Add the overview data into your main response
$response["clientOverview"] = $clientOverview;


// ✅ Output JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?>
