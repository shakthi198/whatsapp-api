<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

class WhatsAppBusinessAPI {
    private $conn;
    private $whatsappConfig;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->whatsappConfig = $this->loadAPISettings();
    }

    // ✅ Helper: Convert language code to human-readable name
public function decodeLanguageName($code) {
    $languages = [
        'en' => 'English',
        'hi' => 'Hindi',
        'ta' => 'Tamil',
        'te' => 'Telugu',
        'ml' => 'Malayalam',
        'kn' => 'Kannada',
        'bn' => 'Bengali',
        'gu' => 'Gujarati',
        'mr' => 'Marathi',
        'pa' => 'Punjabi'
    ];

    return $languages[strtolower($code)] ?? strtoupper($code);
}



    // ✅ Fetch WhatsApp API credentials dynamically from api_settings table
    public function loadAPISettings() {
        $sql = "SELECT base_url, access_token, number_id, waba_id 
                FROM api_settings 
                ORDER BY id DESC 
                LIMIT 1";
        $result = $this->conn->query($sql);

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return [
                'base_url' => rtrim($row['base_url'], '/'),
                'access_token' => 'Bearer ' . trim($row['access_token']),
                'phone_number_id' => trim($row['number_id']),
                'waba_id' => trim($row['waba_id'])
            ];
        } else {
            error_log("⚠️ WhatsApp API Settings not found in database!");
            // Return placeholder values to prevent PHP notices
            return [
                'base_url' => '',
                'access_token' => '',
                'phone_number_id' => '',
                'waba_id' => ''
            ];
        }
    }

    // ================= Existing methods =================

    // ✅ Helper: get language code using languageGuid
private function getLanguageCode($languageGuid) {
    if (empty($languageGuid)) return 'en'; // default fallback

    $sql = "SELECT code FROM language WHERE guid = ? AND isDelete = 0 AND isActive = 1 LIMIT 1";
    $stmt = $this->conn->prepare($sql);
    if (!$stmt) return 'en';

    $stmt->bind_param("s", $languageGuid);
    $stmt->execute();
    $result = $stmt->get_result();
    $code = 'en';
    if ($row = $result->fetch_assoc()) {
        $code = $row['code'];
    }
    $stmt->close();

    return $code ?: 'en';
}


    // Sync templates with Meta
    public function syncAllTemplatesStatus() {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['waba_id'] . '/message_templates';
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $this->whatsappConfig['access_token']
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $metaTemplates = json_decode($response, true);
            
            $sql = "SELECT id, meta_template_id FROM templates WHERE meta_template_id IS NOT NULL AND isDelete = 0";
            $result = $this->conn->query($sql);
            
            $updatedCount = 0;
            while ($localTemplate = $result->fetch_assoc()) {
                foreach ($metaTemplates['data'] as $metaTemplate) {
                    if ($metaTemplate['id'] === $localTemplate['meta_template_id']) {
                        $updateSql = "UPDATE templates SET meta_status = ? WHERE id = ?";
                        $updateStmt = $this->conn->prepare($updateSql);
                        $updateStmt->bind_param("si", $metaTemplate['status'], $localTemplate['id']);
                        $updateStmt->execute();
                        $updateStmt->close();
                        $updatedCount++;
                        break;
                    }
                }
            }
            
            return [
                'status' => 'success',
                'updated_count' => $updatedCount,
                'total_meta_templates' => count($metaTemplates['data'])
            ];
        }
        
        return [
            'status' => 'error',
            'message' => 'Failed to fetch templates from Meta'
        ];
    }

    // Upload media
    public function uploadMediaToMeta($mediaFile) {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['phone_number_id'] . '/media';
        
        error_log("Media Upload URL: " . $url);
        error_log("Media File Info: " . print_r($mediaFile, true));
        
        $maxFileSize = 10 * 1024 * 1024; // 10MB
        if ($mediaFile['size'] > $maxFileSize) {
            return ['success' => false, 'error' => 'File size exceeds 10MB limit'];
        }

        $allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/3gp', 
            'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg',
            'application/pdf', 'text/plain'
        ];
        if (!in_array($mediaFile['type'], $allowedTypes)) {
            return ['success' => false, 'error' => 'File type not supported: ' . $mediaFile['type']];
        }

        $cfile = new CURLFile($mediaFile['tmp_name'], $mediaFile['type'], $mediaFile['name']);
        $postData = [
            'messaging_product' => 'whatsapp',
            'file' => $cfile,
            'type' => $mediaFile['type']
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => ['Authorization: ' . $this->whatsappConfig['access_token']],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        error_log("Media Upload Response Code: " . $httpCode);
        error_log("Media Upload Response: " . $response);
        
        if ($httpCode === 200) {
            $responseData = json_decode($response, true);
            return ['success' => true, 'media_id' => $responseData['id'] ?? null, 'response' => $responseData];
        } else {
            $errorData = json_decode($response, true);
            return [
                'success' => false,
                'error' => $errorData['error']['message'] ?? 'Unknown error',
                'error_details' => $errorData,
                'curl_error' => $curlError,
                'http_code' => $httpCode
            ];
        }
    }

    // Create template on Meta (unchanged)
    public function createTemplateOnMeta($templateData) {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['waba_id'] . '/message_templates';
        $templateData['messaging_product'] = 'whatsapp';
        
        error_log("Meta API Request URL: " . $url);
        error_log("Meta API Request Payload: " . json_encode($templateData, JSON_PRETTY_PRINT));
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($templateData),
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $this->whatsappConfig['access_token'],
                'Content-Type: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        error_log("Meta API Response Code: " . $httpCode);
        error_log("Meta API Response: " . $response);
        
        return [
            'status_code' => $httpCode,
            'response' => json_decode($response, true),
            'curl_error' => $curlError
        ];
    }

    
public function formatTemplateForMeta($templateData, $mediaId = null) {
    $components = [];

    // Determine Meta category
    $category = 'UTILITY';
    if (!empty($templateData['templateCategory'])) {
        $cat = strtolower($templateData['templateCategory']);
        if (strpos($cat, 'market') !== false) $category = 'MARKETING';
        elseif (strpos($cat, 'auth') !== false) $category = 'AUTHENTICATION';
    }

    $templateType = $templateData['typeId'] ?? 1;
    $headers = json_decode($templateData['templateHeaders'] ?? '{}', true);
    $headerType = $headers['headerType'] ?? 'text';

    // ✅ HEADER (only for UTILITY & MARKETING)
if ($category === 'AUTHENTICATION') {
    $expiryMinutes = 5;

    $components = [
        [
            'type' => 'BODY',
            'add_security_recommendation' => true
        ],
        [
            'type' => 'FOOTER',
            'code_expiration_minutes' => $expiryMinutes
        ],
        [
            'type' => 'BUTTONS',
            'buttons' => [
                [
                    'type' => 'OTP',
                    'otp_type' => 'COPY_CODE',
                    'text' => 'Copy Code'
                ]
            ]
        ]
    ];

    return [
        'messaging_product' => 'whatsapp',
        'name' => $templateData['name'],
        'language' => $templateData['languageCode'] ?? 'en_US',
        'category' => 'AUTHENTICATION',
        'components' => $components
    ];
}




    // ✅ BODY
    $bodyText = trim($templateData['body'] ?? '');
 
        $bodyComponent = ['type' => 'BODY', 'text' => $bodyText];

        // Add variable examples if present
        $exampleValues = [];
        if (!empty($templateData['variableSamples'])) {
            $samples = json_decode($templateData['variableSamples'], true);
            if (is_array($samples)) {
                usort($samples, function ($a, $b) {
                    preg_match('/\d+/', $a['placeholder'] ?? '', $ma);
                    preg_match('/\d+/', $b['placeholder'] ?? '', $mb);
                    return ($ma[0] ?? 0) <=> ($mb[0] ?? 0);
                });
                foreach ($samples as $s) {
                    $exampleValues[] = $s['sample'] ?? '';
                }
            }
        

        if (!empty($exampleValues)) {
            $bodyComponent['example'] = ['body_text' => [$exampleValues]];
        }

        $components[] = $bodyComponent;
    }

    // ✅ FOOTER (only for UTILITY & MARKETING)
    if (!empty($templateData['templateFooter']) && $category !== 'AUTHENTICATION') {
        $components[] = [
            'type' => 'FOOTER',
            'text' => $templateData['templateFooter']
        ];
    }

        $buttons = [];

        // Add template buttons
        if (!empty($templateData['templateButtons'])) {
            $templateButtons = json_decode($templateData['templateButtons'], true);
            if (is_array($templateButtons)) {
                foreach ($templateButtons as $b) {
                    if ($b['type'] === 'URL' && !empty($b['text']) && !empty($b['url'])) {
                        $urlButton = [
                            'type' => 'URL',
                            'text' => $b['text'],
                            'url' => $b['url']
                        ];
                        if (strpos($b['url'], '{{1}}') !== false) {
                            $urlButton['example'] = ['A12345'];
                        }
                        $buttons[] = $urlButton;
                    } elseif ($b['type'] === 'PHONE_NUMBER' && !empty($b['phone'])) {
                        $buttons[] = [
                            'type' => 'PHONE_NUMBER',
                            'text' => $b['text'],
                            'phone_number' => $b['phone']
                        ];
                    } elseif ($b['type'] === 'QUICK_REPLY' && !empty($b['text'])) {
                        $buttons[] = [
                            'type' => 'QUICK_REPLY',
                            'text' => $b['text']
                        ];
                    }
                }
            }
        

        // Add quick replies if any
        if (!empty($templateData['quickReplies'])) {
            $quickReplies = json_decode($templateData['quickReplies'], true);
            if (is_array($quickReplies)) {
                foreach ($quickReplies as $qr) {
                    if (!empty($qr['text'])) {
                        $buttons[] = ['type' => 'QUICK_REPLY', 'text' => $qr['text']];
                    }
                }
            }
        }

        if (!empty($buttons)) {
            $components[] = ['type' => 'BUTTONS', 'buttons' => $buttons];
        }
    }

    // ✅ Language
    $langCode = $templateData['languageCode'] ??
        $this->getLanguageCode($templateData['languageGuid'] ?? null);

    // ✅ Final Meta Payload
    return [
        'name' => $templateData['name'],
        'category' => $category,
        'language' => $langCode,
        'messaging_product' => 'whatsapp',
        'components' => $components
    ];
}

    
    // Helper method to determine media format
    private function determineMediaFormat($templateData, $headers) {
        $headerType = $headers['headerType'] ?? 'image';
        
        // Map header types to Meta format
        $formatMap = [
            'image' => 'IMAGE',
            'video' => 'VIDEO',
            'document' => 'DOCUMENT',
            'audio' => 'AUDIO'
        ];
        
        return $formatMap[$headerType] ?? 'IMAGE';
    }
    
    // Method to create complete template JSON for storage
    public function createTemplateJSON($templateData, $mediaId = null) {
        $components = [];
        
        // Get template type
        $templateType = $templateData['typeId'] ?? 1;
        
        // Header component based on template type
        $headers = json_decode($templateData['templateHeaders'] ?? '[]', true);
        $headerType = $headers['headerType'] ?? 'text';
        
        if ($templateType == 1) { 
            // TEXT type template
            if ($headerType !== 'text' && $mediaId) {
                $components[] = [
                    'type' => 'HEADER',
                    'format' => strtoupper($headerType),
                    'example' => [
                        'header_handle' => [$mediaId]
                    ]
                ];
            } elseif (!empty($headers['headerText'])) {
                $components[] = [
                    'type' => 'HEADER',
                    'format' => 'TEXT',
                    'text' => $headers['headerText']
                ];
            }
        } elseif ($templateType == 2 && $mediaId) { 
            // MEDIA type template - ALWAYS use media in header
            $mediaFormat = $this->determineMediaFormat($templateData, $headers);
            
            $components[] = [
                'type' => 'HEADER',
                'format' => $mediaFormat,
                'example' => [
                    'header_handle' => [$mediaId]
                ]
            ];
        }
        
        // Body component
        if (!empty($templateData['body'])) {
            $components[] = [
                'type' => 'BODY',
                'text' => $templateData['body']
            ];
        }
        
        // Footer component
        if (!empty($templateData['templateFooter'])) {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $templateData['templateFooter']
            ];
        }
        
        // Buttons component
        $buttons = [];
        
        // Add template buttons
        if (!empty($templateData['templateButtons'])) {
            $templateButtons = json_decode($templateData['templateButtons'], true);
            if (is_array($templateButtons)) {
                foreach ($templateButtons as $button) {
                    if ($button['type'] === 'URL') {
                        $buttons[] = [
                            'type' => 'URL',
                            'text' => $button['text'],
                            'url' => $button['url']
                        ];
                    } elseif ($button['type'] === 'PHONE_NUMBER') {
                        $buttons[] = [
                            'type' => 'PHONE_NUMBER',
                            'text' => $button['text'],
                            'phone_number' => $button['phone']
                        ];
                    } elseif ($button['type'] === 'QUICK_REPLY') {
                        $buttons[] = [
                            'type' => 'QUICK_REPLY',
                            'text' => $button['text']
                        ];
                    }
                }
            }
        }
        
        // Add quick replies
        if (!empty($templateData['quickReplies'])) {
            $quickReplies = json_decode($templateData['quickReplies'], true);
            if (is_array($quickReplies)) {
                foreach ($quickReplies as $reply) {
                    $buttons[] = [
                        'type' => 'QUICK_REPLY',
                        'text' => $reply['text']
                    ];
                }
            }
        }
        
        if (!empty($buttons)) {
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => $buttons
            ];
        }
        
        // Determine category
        $category = 'UTILITY';
        if (isset($templateData['templateCategory'])) {
            $catName = strtolower($templateData['templateCategory']);
            if (strpos($catName, 'utility') !== false) {
                $category = 'UTILITY';
            } elseif (strpos($catName, 'market') !== false) {
                $category = 'MARKETING';
            } else {
                $category = 'AUTHENTICATION';
            }
        }
        
        // ✅ Get language code from input or DB
$langCode = $templateData['languageCode'] 
    ?? $this->getLanguageCode($templateData['languageGuid'] ?? null);

return [
    'name' => $templateData['name'],
    'category' => $category,
    'language' => $langCode,
    'components' => $components
];

    }
    
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}

$whatsappAPI = new WhatsAppBusinessAPI($conn);

// ================= GET (Fetch all or single template) =================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $apiSettings = $whatsappAPI->loadAPISettings();

    if (empty($apiSettings['base_url']) || empty($apiSettings['access_token']) || empty($apiSettings['waba_id'])) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Missing WhatsApp API credentials."]);
        exit();
    }

    $version = 'v22.0'; // Meta Graph API version
    $templateId = isset($_GET['templateId']) ? trim($_GET['templateId']) : null;

    // ✅ Build API URL
    if ($templateId) {
        // Fetch single template by ID
        $url = "{$apiSettings['base_url']}/{$templateId}";
    } else {
        // Fetch all templates for WABA
        $url = "{$apiSettings['base_url']}/{$apiSettings['waba_id']}/message_templates";
    }

    // ✅ Initialize cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . $apiSettings['access_token']
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // ✅ Handle errors
    if ($httpCode !== 200) {
        http_response_code($httpCode);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to fetch template(s) from Meta",
            "http_code" => $httpCode,
            "curl_error" => $curlError,
            "meta_url" => $url,
            "response" => json_decode($response, true)
        ]);
        exit();
    }

    $metaResponse = json_decode($response, true);

    // ✅ SINGLE TEMPLATE FETCH
    if ($templateId) {
        // Extract language and decode it
        $languageCode = $metaResponse['language'] ?? 'en';
        $languageName = $whatsappAPI->decodeLanguageName($languageCode);

        // Add readable language name
        $metaResponse['language_name'] = $languageName;

        // Return formatted JSON
        echo json_encode([
            "status" => "success",
            "data" => $metaResponse,
            "meta_url" => $url
        ]);
        exit();
    }

    // ✅ MULTIPLE TEMPLATES FETCH
    $templates = $metaResponse['data'] ?? [];

    // Add decoded language names
    foreach ($templates as &$t) {
        if (isset($t['language'])) {
            $t['language_name'] = $whatsappAPI->decodeLanguageName($t['language']);
        }
    }

    echo json_encode([
        "status" => "success",
        "count" => count($templates),
        "data" => $templates,
        "paging" => $metaResponse['paging'] ?? null,
        "meta_url" => $url
    ]);
    exit();
}




// ================= POST - MEDIA UPLOAD ONLY =================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['media_file'])) {
    // This endpoint is specifically for media upload only
    if ($_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
        error_log("Processing media-only upload request...");
        $uploadResult = $whatsappAPI->uploadMediaToMeta($_FILES['media_file']);
        
        if ($uploadResult['success']) {
            echo json_encode([
                "status" => "success", 
                "media_id" => $uploadResult['media_id'],
                "message" => "Media uploaded successfully",
                "media_details" => $uploadResult['response'] ?? null
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error", 
                "message" => "Media upload failed",
                "error_details" => $uploadResult
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error", 
            "message" => "No media file provided or upload error",
            "upload_error" => $_FILES['media_file']['error']
        ]);
    }
    exit();
}

// ================= POST - TEMPLATE CREATION ONLY =================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_FILES['media_file'])) {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
    } else {
        $data = $_POST;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid data received"]);
        exit();
    }

    $requiredFields = ['name', 'templateCategory', 'languageGuid', 'typeId'];
    $missingFields = [];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) $missingFields[] = $field;
    }

    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields: " . implode(', ', $missingFields)]);
        exit();
    }

    $guid = $data['guid'] ?? bin2hex(random_bytes(16));
    $currentDateTime = date('Y-m-d H:i:s');

    // Extract media_id if provided
    $mediaId = $data['media_id'] ?? null;

    // Validate media_id for MEDIA type templates
    $templateType = (int)$data['typeId'];
    if ($templateType == 2 && !$mediaId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Media ID is required for MEDIA type templates"]);
        exit();
    }

    // ✅ Create template JSON for storage
    $templateJSON = $whatsappAPI->createTemplateJSON($data, $mediaId);
    $templateJSONString = json_encode($templateJSON);

    // ✅ Prepare data for Meta API
    $metaTemplateData = $whatsappAPI->formatTemplateForMeta($data, $mediaId);

    // ✅ Send to Meta WhatsApp Business API
    $metaResponse = $whatsappAPI->createTemplateOnMeta($metaTemplateData);

    $meta_template_id = null;
    $meta_status = 'PENDING';
    
    if ($metaResponse['status_code'] === 200) {
        $meta_template_id = $metaResponse['response']['id'] ?? null;
        $meta_status = 'SUBMITTED';
    } else {
        $meta_status = 'FAILED';
        error_log("Meta API Error: " . json_encode($metaResponse));
    }

    // 🚫 COMMENTED: Database insertion
    /*
    $sql = "INSERT INTO templates (
                guid, name, categoryName, languageGuid, typeId, isFile,
                templateHeaders, erpcategoryName, isVariable, body, bodyStyle,
                actionId, actionGuid, templateFooter, fileGuids, createdOn,
                modifiedOn, isActive, isDelete, meta_template_id, meta_status,
                template_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }

    $name = $data['name'];
    $categoryName = $data['templateCategory'];
    $languageGuid = $data['languageGuid'];
    $typeId = (int)$data['typeId'];
    $isFile = isset($data['isFile']) ? (int)$data['isFile'] : 0;
    $templateHeaders = $data['templateHeaders'] ?? '[]';
    $erpcategoryName = $data['erpcategoryName'] ?? '';
    $isVariable = isset($data['isVariable']) ? (int)$data['isVariable'] : 0;
    $body = $data['body'] ?? '';
    $bodyStyle = $data['bodyStyle'] ?? '';
    $actionId = isset($data['actionId']) ? (int)$data['actionId'] : 0;
    $actionGuid = $data['actionGuid'] ?? '';
    $templateFooter = $data['templateFooter'] ?? '';
    $fileGuids = $data['fileGuids'] ?? '[]';
    $createdOn = $currentDateTime;
    $modifiedOn = $currentDateTime;
    $isActive = 1;
    $isDelete = 0;

    $stmt->bind_param(
        "sssssississssssssiisss",
        $guid, $name, $categoryName, $languageGuid, $typeId, $isFile,
        $templateHeaders, $erpcategoryName, $isVariable, $body, $bodyStyle,
        $actionId, $actionGuid, $templateFooter, $fileGuids,
        $createdOn, $modifiedOn, $isActive, $isDelete, $meta_template_id, $meta_status,
        $templateJSONString
    );

    $stmt->execute();
    $stmt->close();
    */

    // ✅ Just return the Meta API response instead
    echo json_encode([
        "status" => "success",
        "message" => "Template creation request sent to Meta",
        "data" => [
            "guid" => $guid,
            "media_id" => $mediaId,
            "meta_template_id" => $meta_template_id,
            "meta_status" => $meta_status,
            "template_json" => $templateJSON,
            "meta_api_request" => [
                "payload" => $metaTemplateData
            ],
            "meta_api_response" => [
                "status_code" => $metaResponse['status_code'],
                "response" => $metaResponse['response']
            ]
        ]
    ]);
    
    exit();
}



// ================= DELETE (Delete from Meta) =================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['templateId']) || empty($data['templateName'])) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Both 'templateId' (HSM ID) and 'templateName' are required."
        ]);
        exit();
    }

    // Get credentials
    $apiSettings = $whatsappAPI->loadAPISettings();
    if (empty($apiSettings['base_url']) || empty($apiSettings['access_token']) || empty($apiSettings['waba_id'])) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Missing WhatsApp API credentials."]);
        exit();
    }

    // Build DELETE URL
    $hsmId = urlencode($data['templateId']);
    $name = urlencode($data['templateName']);
    $url = "{$apiSettings['base_url']}/{$apiSettings['waba_id']}/message_templates?hsm_id={$hsmId}&name={$name}";

    // Initialize cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_CUSTOMREQUEST => "DELETE",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: {$apiSettings['access_token']}",
            "Content-Type: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $responseData = json_decode($response, true);

    // ✅ Handle successful deletion
    if ($httpCode === 200 && isset($responseData['success']) && $responseData['success'] === true) {
        echo json_encode([
            "status" => "success",
            "message" => "Template deleted successfully from Meta",
            "meta_response" => $responseData
        ]);
    } else {
        // ❌ Handle error response
        http_response_code($httpCode);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete template from Meta",
            "http_code" => $httpCode,
            "curl_error" => $curlError,
            "meta_response" => $responseData,
            "url" => $url
        ]);
    }

    exit();
}


$conn->close();
?>