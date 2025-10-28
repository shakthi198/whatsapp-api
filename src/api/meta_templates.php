<?php
/*************************************************
 * meta_templates.php
 * Fetches ONLY Meta-provided WhatsApp message templates 
 * (excludes all custom templates created by the user)
 * Returns JSON grouped by normalized categories
 *************************************************/

ini_set('display_errors', '0');
error_reporting(E_ALL);

// CORS (change for production)
$allowed_origin = "http://localhost:3000";
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ----------------- Include config -----------------
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Missing config.php with META_WABA_ID and META_ACCESS_TOKEN."], JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    exit;
}

// prevent accidental output
ob_start();
require_once $configPath;
$buf = ob_get_clean();
if ($buf !== '') {
    http_response_code(500);
    echo json_encode([
        "status"=>"error",
        "message"=>"config.php produced unexpected output. Remove echo/print or BOM.",
        "debug_preview" => substr($buf, 0, 500)
    ], JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    exit;
}

// ----------------- Read config safely -----------------
$WABA_ID = defined('META_WABA_ID') ? constant('META_WABA_ID') : getenv('META_WABA_ID');
$ACCESS_TOKEN = defined('META_ACCESS_TOKEN') ? constant('META_ACCESS_TOKEN') : getenv('META_ACCESS_TOKEN');
$GRAPH_VERSION = defined('META_GRAPH_VERSION') ? constant('META_GRAPH_VERSION') : (getenv('META_GRAPH_VERSION') ?: 'v17.0');

if (empty($WABA_ID) || empty($ACCESS_TOKEN)) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server not configured. Please set META_WABA_ID and META_ACCESS_TOKEN in config.php or env."
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
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
    
    // User-created templates typically DON'T have these patterns
    $metaPatterns = [
        'sample_', 'example_', 'meta_', 'whatsapp_', 'default_',
        'utility_', 'auth_', 'authentication_', 'marketing_',
        'transaction_', 'shipping_', 'appointment_', 'issue_',
        'reservation_', 'ticket_', 'payment_', 'order_'
    ];
    
    // If it matches Meta patterns, it's NOT user-created
    foreach ($metaPatterns as $pattern) {
        if (strpos($name, $pattern) === 0) {
            return false; // This is a Meta template
        }
    }
    
    // User-created templates often have custom names without these patterns
    // They might be in your business language, brand names, etc.
    
    // Additional checks for user-created templates:
    
    // 1. Check if name contains your business name or custom terms
    $customTerms = ['my_', 'custom_', 'brand_', 'company_']; // Add your business terms here
    
    // 2. Templates without Meta patterns are likely user-created
    $hasNoMetaPatterns = true;
    foreach ($metaPatterns as $pattern) {
        if (strpos($name, $pattern) !== false) {
            $hasNoMetaPatterns = false;
            break;
        }
    }
    
    // 3. If it doesn't have Meta patterns and looks custom, it's user-created
    if ($hasNoMetaPatterns) {
        return true;
    }
    
    return false;
}

// ----------------- Helpers -----------------
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
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$allTemplates = $result['data'] ?? [];
$metaTemplates = [];
$userTemplates = [];

// Separate Meta templates from user-created templates
foreach ($allTemplates as $template) {
    if (is_user_created_template($template)) {
        $userTemplates[] = $template;
    } else {
        $metaTemplates[] = $template;
    }
}

// If we still have too many, use a stricter approach
if (count($metaTemplates) > 20) { // If we have more than 20 "meta" templates, be stricter
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

// Group by category
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
        'template_type' => 'meta_provided' // Clear indication
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
    "note" => "This endpoint returns ONLY official Meta-provided templates. All custom templates created by you have been excluded.",
    "available_categories" => array_keys($byCategory),
    "byCategory" => $byCategory
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit;