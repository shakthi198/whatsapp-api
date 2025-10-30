<?php
// ----------------- CORS Handling -----------------
$allowed_origins = [
    "http://localhost:3000",     // Local React
    "https://yourfrontend.com"   // Production domain
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // Fallback for testing without credentials
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ----------------- Database Config -----------------
require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}
// ----------------- Fetch Config from Database -----------------
$query = "SELECT * FROM api_settings ORDER BY id DESC LIMIT 1"; // Assuming latest row is active
$result = $conn->query($query);

if (!$result || $result->num_rows === 0) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "No configuration found in database table 'meta_config'."
    ]);
    exit;
}

$config = $result->fetch_assoc();
$conn->close();

// Extract Meta credentials
$WABA_ID = $config['waba_id'] ?? '';
$ACCESS_TOKEN = $config['access_token'] ?? '';
$GRAPH_VERSION = 'v20.0'; // You can make this dynamic if needed

if (empty($WABA_ID) || empty($ACCESS_TOKEN)) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Missing Meta credentials in database (waba_id or access_token)."
    ]);
    exit;
}

// ----------------- HTTP helper -----------------
function http_get(string $url, array $headers = []): array {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    $body = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $body, $err];
}

// ----------------- Fetch all templates -----------------
function fetch_all_meta_templates(string $waba, string $token, string $graphVersion): array {
    $fields = "id,name,language,category,components,status,quality_score,created_time";
    $baseUrl = "https://graph.facebook.com/{$graphVersion}/{$waba}/message_templates";
    $query = http_build_query([
        'fields' => $fields,
        'access_token' => $token,
        'limit' => 100
    ]);
    $next = "{$baseUrl}?{$query}";

    $collected = [];
    while ($next) {
        [$code, $body, $err] = http_get($next, ["Accept: application/json"]);
        if ($err) return ["error"=>true,"http_code"=>502,"message"=>"cURL error: $err"];
        if ($code < 200 || $code >= 300) {
            $decoded = json_decode($body, true);
            return ["error"=>true,"http_code"=>$code,"message"=>"Meta API HTTP {$code}","detail"=>$decoded ?: substr($body,0,500)];
        }
        $json = json_decode($body, true);
        if ($json === null) {
            return ["error"=>true,"http_code"=>502,"message"=>"Invalid JSON from Meta","raw"=>substr($body,0,1000)];
        }
        if (isset($json['data']) && is_array($json['data'])) {
            $collected = array_merge($collected, $json['data']);
        }
        $next = $json['paging']['next'] ?? null;
    }

    return ["error"=>false,"data"=>$collected];
}

// ----------------- Identify and EXCLUDE user-created templates -----------------
function is_user_created_template(array $template): bool {
    $name = strtolower($template['name'] ?? '');
    $metaPatterns = [
        'sample_', 'example_', 'meta_', 'whatsapp_', 'default_',
        'utility_', 'auth_', 'authentication_', 'marketing_',
        'transaction_', 'shipping_', 'appointment_', 'issue_',
        'reservation_', 'ticket_', 'payment_', 'order_'
    ];
    foreach ($metaPatterns as $pattern) {
        if (strpos($name, $pattern) === 0) {
            return false; // Meta template
        }
    }
    return true;
}

function normalize_category(string $cat): string {
    $map = [
        'UTILITY' => 'utility',
        'AUTHENTICATION' => 'authentication',
        'MARKETING' => 'marketing',
        'TRANSACTIONAL' => 'transactional',
        'OTP' => 'authentication',
        'UNKNOWN' => 'unknown'
    ];
    $key = strtoupper(trim($cat));
    return $map[$key] ?? strtolower(trim($cat));
}

function extract_components(array $components): array {
    $result = ['header'=>null,'body'=>null,'footer'=>null,'buttons'=>[]];
    foreach ($components as $c) {
        $type = strtolower($c['type'] ?? '');
        if ($type === 'header' && !$result['header']) $result['header'] = $c['text'] ?? null;
        if ($type === 'body' && !$result['body']) $result['body'] = $c['text'] ?? null;
        if ($type === 'footer' && !$result['footer']) $result['footer'] = $c['text'] ?? null;
        if ($type === 'button' && isset($c['text'])) $result['buttons'][] = $c['text'];
    }
    return $result;
}

// ----------------- Fetch & EXCLUDE user templates -----------------
$result = fetch_all_meta_templates($WABA_ID, $ACCESS_TOKEN, $GRAPH_VERSION);
if ($result['error']) {
    http_response_code($result['http_code'] ?? 502);
    echo json_encode([
        "status" => "error",
        "message" => $result['message'],
        "detail" => $result['detail'] ?? null
    ]);
    exit;
}

$allTemplates = $result['data'] ?? [];
$metaTemplates = [];
$userTemplates = [];

foreach ($allTemplates as $template) {
    if (is_user_created_template($template)) {
        $userTemplates[] = $template;
    } else {
        $metaTemplates[] = $template;
    }
}

if (count($metaTemplates) > 20) {
    $strictMetaTemplates = [];
    $knownMetaNames = [
        'sample_', 'example_', 'utility_', 'authentication_', 'marketing_',
        'shipping_', 'appointment_', 'issue_', 'reservation_', 'payment_'
    ];
    foreach ($metaTemplates as $template) {
        $name = strtolower($template['name'] ?? '');
        foreach ($knownMetaNames as $pattern) {
            if (strpos($name, $pattern) === 0) {
                $strictMetaTemplates[] = $template;
                break;
            }
        }
    }
    $metaTemplates = $strictMetaTemplates;
}

$byCategory = [];
foreach ($metaTemplates as $t) {
    $cat = normalize_category($t['category'] ?? 'unknown');
    $components = extract_components($t['components'] ?? []);
    $item = [
        'id' => $t['id'] ?? null,
        'name' => $t['name'] ?? null,
        'category' => $cat,
        'language' => $t['language'] ?? 'en',
        'status' => $t['status'] ?? null,
        'quality_score' => $t['quality_score'] ?? null,
        'created_time' => $t['created_time'] ?? null,
        'header' => $components['header'],
        'body' => $components['body'],
        'footer' => $components['footer'],
        'buttons' => $components['buttons'],
        'template_type' => 'meta_provided'
    ];
    $byCategory[$cat][] = $item;
}

$response = [
    "status" => "success",
    "summary" => [
        "total_templates_found" => count($allTemplates),
        "user_created_templates_excluded" => count($userTemplates),
        "meta_provided_templates_included" => count($metaTemplates)
    ],
    "note" => "Fetched credentials from database and returned ONLY official Meta-provided templates.",
    "available_categories" => array_keys($byCategory),
    "byCategory" => $byCategory
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit;
