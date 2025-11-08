<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "config.php"; // ✅ your DB connection above

$response = ["status" => false, "message" => "Something went wrong"];

try {
    // ✅ Optional: Handle filters from frontend (fromDate, toDate, filterType)
    $fromDate = isset($_GET['fromDate']) ? $_GET['fromDate'] : null;
    $toDate   = isset($_GET['toDate']) ? $_GET['toDate'] : null;

    $where = "1"; // default always true
    if (!empty($fromDate) && !empty($toDate)) {
        $where = "DATE(sent_at) BETWEEN '$fromDate' AND '$toDate'";
    }

    // ✅ 1. Fetch all message logs
    $query = "
        SELECT 
            id,
            whatsapp_message_id AS message_id,
            phone_number AS recipient_id,
            message_content AS message_text,
            status,
            template_name AS category,
            UNIX_TIMESTAMP(sent_at) AS timestamp
        FROM sent_messages
        WHERE $where
        ORDER BY sent_at DESC
    ";

    $result = $conn->query($query);
    $data = [];
    $summary = ["sent" => 0, "delivered" => 0, "read" => 0];

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $status = strtolower(trim($row["status"]));

            // ✅ Count for summary
            if (isset($summary[$status])) {
                $summary[$status]++;
            }

            // ✅ Push row data
            $data[] = [
                "id" => intval($row["id"]),
                "message_id" => $row["message_id"],
                "recipient_id" => $row["recipient_id"],
                "message_text" => $row["message_text"],
                "status" => $status,
                "category" => $row["category"],
                "timestamp" => intval($row["timestamp"])
            ];
        }

        $response = [
            "status" => true,
            "message" => "Report data fetched successfully",
            "data" => $data,
            "summary" => $summary
        ];
    } else {
        $response = [
            "status" => true,
            "message" => "No records found",
            "data" => [],
            "summary" => $summary
        ];
    }
} catch (Exception $e) {
    $response = [
        "status" => false,
        "message" => "Error: " . $e->getMessage()
    ];
}

// ✅ Send final response
echo json_encode($response);

$conn->close();
?>
