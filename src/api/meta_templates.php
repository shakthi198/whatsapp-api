<?php
/*************************************************
 * meta_templates.php
 * Returns Meta WhatsApp templates as JSON
 * with proper CORS headers for React frontend
 *************************************************/

// --------------------
// 🔐 CORS CONFIGURATION
// --------------------
$allowed_origin = "http://localhost:3000"; // React dev server URL
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests (important for browsers)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --------------------
// ⚙️ RESPONSE HEADERS
// --------------------
header("Content-Type: application/json; charset=utf-8");

// --------------------
// ✅ MOCK DATA (Replace later with DB query)
// --------------------
$metaTemplates = [
    [
        "id" => "temp_001",
        "name" => "Order Confirmation",
        "language" => ["code" => "en"],
        "category" => "Transactional",
        "body" => "Hello {{1}}, your order {{2}} has been confirmed!",
        "footer" => "Thank you for shopping with us.",
        "components" => [
            [
                "type" => "body",
                "parameters" => [
                    ["name" => "CustomerName"],
                    ["name" => "OrderID"]
                ]
            ]
        ],
        "meta_status" => "APPROVED",
        "createdOn" => date('Y-m-d H:i:s')
    ],
    [
        "id" => "temp_002",
        "name" => "Payment Reminder",
        "language" => ["code" => "en"],
        "category" => "Transactional",
        "body" => "Hi {{1}}, your payment of {{2}} is due on {{3}}.",
        "footer" => "Please make your payment to avoid service interruption.",
        "components" => [
            [
                "type" => "body",
                "parameters" => [
                    ["name" => "CustomerName"],
                    ["name" => "Amount"],
                    ["name" => "DueDate"]
                ]
            ]
        ],
        "meta_status" => "IN_REVIEW",
        "createdOn" => date('Y-m-d H:i:s')
    ],
    [
        "id" => "temp_003",
        "name" => "Festival Greetings",
        "language" => ["code" => "en"],
        "category" => "Promotional",
        "body" => "Wishing you and your family a very Happy {{1}}!",
        "footer" => "Warm regards, Team XYZ",
        "components" => [
            [
                "type" => "body",
                "parameters" => [
                    ["name" => "FestivalName"]
                ]
            ]
        ],
        "meta_status" => "PENDING",
        "createdOn" => date('Y-m-d H:i:s')
    ]
];

// --------------------
// 🧾 RESPONSE PAYLOAD
// --------------------
$response = [
    "status" => "success",
    "data" => $metaTemplates
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit;
?>
