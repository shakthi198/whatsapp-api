<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB connection failed: " . $conn->connect_error]);
    exit;
}

// ----------------- Fetch Config from Database -----------------
$query = "SELECT * FROM api_settings ORDER BY id DESC LIMIT 1";
$result = $conn->query($query);

if (!$result || $result->num_rows === 0) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "No configuration found in database table 'api_settings'."
    ]);
    $conn->close();
    exit;
}

$config = $result->fetch_assoc();

// ----------------- Fetch existing template IDs from local database -----------------
function get_existing_template_ids($conn): array {
    $existing_ids = [];
    
    // Query to get all meta_template_id values from your templates table
    $query = "SELECT meta_template_id FROM templates WHERE meta_template_id IS NOT NULL AND meta_template_id != ''";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['meta_template_id'])) {
                $existing_ids[] = $row['meta_template_id'];
            }
        }
    }
    
    return $existing_ids;
}

$existingTemplateIds = get_existing_template_ids($conn);
$conn->close();

// Extract Meta credentials
$WABA_ID = $config['waba_id'] ?? '';
$ACCESS_TOKEN = $config['access_token'] ?? '';
$GRAPH_VERSION = 'v20.0';

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
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; Meta-API-Client/1.0)'
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
    $attempts = 0;
    $maxAttempts = 10;
    
    while ($next && $attempts < $maxAttempts) {
        $attempts++;
        
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
        
        // Small delay to be respectful to API
        if ($next) usleep(200000);
    }

    return ["error"=>false,"data"=>$collected];
}

// ----------------- Identify Meta templates -----------------
function is_meta_template(array $template): bool {
    $name = strtolower($template['name'] ?? '');
    
    // Meta's official template patterns
    $metaPatterns = [
        'sample_', 'example_', 'meta_', 'whatsapp_', 'default_',
        'utility_', 'auth_', 'authentication_', 'marketing_',
        'transaction_', 'shipping_', 'appointment_', 'issue_',
        'reservation_', 'ticket_', 'payment_', 'order_',
        'alert_', 'reminder_', 'verification_', 'notification_',
        'update_', 'status_', 'feedback_', 'survey_', 'welcome_',
        'invite_', 'confirm_', 'cancellation_', 'receipt_'
    ];
    
    foreach ($metaPatterns as $pattern) {
        if (strpos($name, $pattern) === 0) {
            return true;
        }
    }
    
    // Additional check for Meta-like templates
    $qualityScore = $template['quality_score'] ?? null;
    $category = strtoupper($template['category'] ?? '');
    
    $metaCategories = ['UTILITY', 'AUTHENTICATION', 'MARKETING', 'TRANSACTIONAL'];
    if (in_array($category, $metaCategories) && $qualityScore === 'GREEN') {
        return true;
    }
    
    return false;
}

// ----------------- Filter out existing templates -----------------
function filter_out_existing_templates(array $templates, array $existingIds): array {
    $filtered = [];
    
    foreach ($templates as $template) {
        $templateId = $template['id'] ?? '';
        
        // Only include template if it's NOT in our existing database
        if (!in_array($templateId, $existingIds)) {
            $filtered[] = $template;
        }
    }
    
    return $filtered;
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
        if ($type === 'header' && !$result['header']) {
            $result['header'] = $c['text'] ?? $c['format'] ?? null;
        }
        if ($type === 'body' && !$result['body']) {
            $result['body'] = $c['text'] ?? null;
        }
        if ($type === 'footer' && !$result['footer']) {
            $result['footer'] = $c['text'] ?? null;
        }
        if ($type === 'button' && isset($c['text'])) {
            $result['buttons'][] = $c['text'];
        }
    }
    return $result;
}

// ----------------- MAIN EXECUTION -----------------
try {
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

    // Separate Meta templates vs User templates
    foreach ($allTemplates as $template) {
        if (is_meta_template($template)) {
            $metaTemplates[] = $template;
        } else {
            $userTemplates[] = $template;
        }
    }

    // Apply stricter filtering if we have too many
    if (count($metaTemplates) > 25) {
        $strictMetaTemplates = [];
        $highConfidencePatterns = [
            'sample_', 'example_', 'utility_', 'authentication_', 'marketing_',
            'shipping_', 'appointment_', 'issue_', 'reservation_', 'payment_',
            'alert_', 'verification_', 'notification_'
        ];
        
        foreach ($metaTemplates as $template) {
            $name = strtolower($template['name'] ?? '');
            foreach ($highConfidencePatterns as $pattern) {
                if (strpos($name, $pattern) === 0) {
                    $strictMetaTemplates[] = $template;
                    break;
                }
            }
        }
        $metaTemplates = $strictMetaTemplates;
    }

    // FILTER OUT TEMPLATES THAT ALREADY EXIST IN LOCAL DATABASE
    $availableMetaTemplates = filter_out_existing_templates($metaTemplates, $existingTemplateIds);

    // Organize by category
    $byCategory = [];
    foreach ($availableMetaTemplates as $t) {
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
        
        if (!isset($byCategory[$cat])) {
            $byCategory[$cat] = [];
        }
        $byCategory[$cat][] = $item;
    }

    // Sort categories alphabetically
    ksort($byCategory);

    $response = [
        "status" => "success",
        "summary" => [
            "total_templates_found" => count($allTemplates),
            "user_created_templates_excluded" => count($userTemplates),
            "meta_provided_templates_found" => count($metaTemplates),
            "existing_templates_filtered_out" => count($metaTemplates) - count($availableMetaTemplates),
            "available_meta_templates" => count($availableMetaTemplates)
        ],
        "note" => "Fetched ONLY official Meta-provided templates that are not already in your local database.",
        "available_categories" => array_keys($byCategory),
        "byCategory" => $byCategory,
        "debug_info" => [
            "waba_id" => substr($WABA_ID, 0, 8) . '...',
            "api_version" => $GRAPH_VERSION,
            "existing_templates_count" => count($existingTemplateIds),
            "fetched_at" => date('c')
        ]
    ];

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unexpected error: " . $e->getMessage()
    ]);
}

exit;