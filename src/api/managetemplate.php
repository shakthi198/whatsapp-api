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
        $this->whatsappConfig = [
            'base_url' => 'https://graph.facebook.com/v21.0',
            'phone_number_id' => '779927621877990',
            'access_token' => 'Bearer EAAS5pfUImY8BPzhZBJ9EHZC3BfZCQvjcxzvli0teHq59N6Uew3ZBL3csExyuvxO0JR429d5zuReQGZBCI4w0bQQ4mqNBOqu7TWZCpm5znkhkdPIYhvpSp5rmsPBYrqWtfmq6XqnhQPJlGPvXkLA87hS5thL4r6M4byF1KduAN1UVwaYaEMkqujTvftNI8pCaXVOggakZBztZAmG80ZBZAJEWyl9uHUHaXMxl7hh2b95yNeFiXue2mUZAA9TotAXv8KcyJphwPC8gX30ZCZCfV86gxnamnsp8CuQ36FZBLX1vgnPi0ZD',
            'waba_id' => '1354293032712286'
        ];
    }
    
    // Method to sync all templates status
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
    
    // Method to upload media to Meta and get media ID
    public function uploadMediaToMeta($mediaFile) {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['phone_number_id'] . '/media';
        
        error_log("Media Upload URL: " . $url);
        error_log("Media File Info: " . print_r($mediaFile, true));
        
        // Validate file type and size
        $maxFileSize = 10 * 1024 * 1024; // 10MB
        if ($mediaFile['size'] > $maxFileSize) {
            return [
                'success' => false,
                'error' => 'File size exceeds 10MB limit'
            ];
        }
        
        // Validate file type
        $allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/3gp', 
            'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg',
            'application/pdf', 'text/plain'
        ];
        
        if (!in_array($mediaFile['type'], $allowedTypes)) {
            return [
                'success' => false,
                'error' => 'File type not supported: ' . $mediaFile['type']
            ];
        }
        
        // Create CURLFile object for file upload
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
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $this->whatsappConfig['access_token']
            ],
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
            return [
                'success' => true,
                'media_id' => $responseData['id'] ?? null,
                'response' => $responseData
            ];
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
    
    // Method to create template on Meta with media support
    public function createTemplateOnMeta($templateData) {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['waba_id'] . '/message_templates';
        
        // Add messaging_product to template data
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
                'Content-Type: ' . 'application/json'
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
    
    // Method to format template for Meta API with media support
    public function formatTemplateForMeta($templateData, $mediaId = null) {
        $components = [];
        
        // Determine category
        $category = 'UTILITY';
        if (isset($templateData['categoryName'])) {
            $catName = strtolower($templateData['categoryName']);
            if (strpos($catName, 'utility') !== false) {
                $category = 'UTILITY';
            } elseif (strpos($catName, 'market') !== false) {
                $category = 'MARKETING';
            } elseif (strpos($catName, 'auth') !== false) {
                $category = 'AUTHENTICATION';
            }
        }
        
        // Get template type (1 for TEXT, 2 for MEDIA)
        $templateType = $templateData['typeId'] ?? 1;
        
        // Handle HEADER component based on template type
        $headers = json_decode($templateData['templateHeaders'] ?? '[]', true);
        $headerType = $headers['headerType'] ?? 'text';
        
        if ($templateType == 1) { 
            // TEXT type template - use existing method with headers
            if ($headerType !== 'text' && $mediaId) {
                // Media header (IMAGE, DOCUMENT, VIDEO) with media ID for TEXT type
                $headerComponent = [
                    'type' => 'HEADER',
                    'format' => strtoupper($headerType),
                    'example' => [
                        'header_handle' => [$mediaId]
                    ]
                ];
                $components[] = $headerComponent;
            } elseif (!empty($headers['headerText'])) {
                // Text header for TEXT type
                $components[] = [
                    'type' => 'HEADER',
                    'format' => 'TEXT',
                    'text' => $headers['headerText']
                ];
            }
        } elseif ($templateType == 2 && $mediaId) { 
            // MEDIA type template - ALWAYS use media in header
            // Determine media format from the uploaded file or use default
            $mediaFormat = $this->determineMediaFormat($templateData, $headers);
            
            $headerComponent = [
                'type' => 'HEADER',
                'format' => $mediaFormat,
                'example' => [
                    'header_handle' => [$mediaId]
                ]
            ];
            $components[] = $headerComponent;
        }
        
        // BODY component
        if (!empty($templateData['body'])) {
            $bodyText = $templateData['body'];
            $bodyComponent = [
                'type' => 'BODY',
                'text' => $bodyText
            ];
            
            // Transform custom variables to Meta's format and add example
            if (!empty($templateData['attributes'])) {
                $attributes = json_decode($templateData['attributes'], true);
                if (is_array($attributes) && !empty($attributes)) {
                    $variableIndex = 1;
                    foreach ($attributes as $attribute) {
                        $placeholder = '{{' . ($attribute['value'] ?? $attribute['name'] ?? '') . '}}';
                        $metaFormat = '{{' . $variableIndex . '}}';
                        $bodyText = str_replace($placeholder, $metaFormat, $bodyText);
                        $variableIndex++;
                    }
                    
                    // Add example for body text
                    $exampleValues = array_map(function($attr) {
                        return $attr['value'] ?? $attr['name'] ?? 'example';
                    }, $attributes);
                    
                    $bodyComponent['example'] = [
                        'body_text' => [$exampleValues]
                    ];
                }
            }
            
            $bodyComponent['text'] = $bodyText;
            $components[] = $bodyComponent;
        }
        
        // FOOTER component
        if (!empty($templateData['templateFooter']) && $category !== 'AUTHENTICATION') {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $templateData['templateFooter']
            ];
        }
        
        // BUTTONS component
        if ($category !== 'AUTHENTICATION') {
            $buttons = [];
            
            // Add template buttons
            if (!empty($templateData['templateButtons'])) {
                $templateButtons = json_decode($templateData['templateButtons'], true);
                if (is_array($templateButtons)) {
                    foreach ($templateButtons as $button) {
                        if ($button['type'] === 'URL' && !empty($button['text']) && !empty($button['url'])) {
                            $urlButton = [
                                'type' => 'URL',
                                'text' => $button['text'],
                                'url' => $button['url']
                            ];
                            
                            // Add example for URL variables if needed
                            if (strpos($button['url'], '{{1}}') !== false) {
                                $urlButton['example'] = ['A12345'];
                            }
                            
                            $buttons[] = $urlButton;
                        } elseif ($button['type'] === 'PHONE_NUMBER' && !empty($button['text']) && !empty($button['phone'])) {
                            $buttons[] = [
                                'type' => 'PHONE_NUMBER',
                                'text' => $button['text'],
                                'phone_number' => $button['phone']
                            ];
                        } elseif ($button['type'] === 'QUICK_REPLY' && !empty($button['text'])) {
                            $buttons[] = [
                                'type' => 'QUICK_REPLY',
                                'text' => $button['text']
                            ];
                        }
                    }
                }
            }
            
            // Add quick reply buttons
            if (!empty($templateData['quickReplies'])) {
                $quickReplies = json_decode($templateData['quickReplies'], true);
                if (is_array($quickReplies)) {
                    foreach ($quickReplies as $reply) {
                        if (!empty($reply['text'])) {
                            $buttons[] = [
                                'type' => 'QUICK_REPLY',
                                'text' => $reply['text']
                            ];
                        }
                    }
                }
            }
            
            if (!empty($buttons)) {
                $components[] = [
                    'type' => 'BUTTONS',
                    'buttons' => $buttons
                ];
            }
        }
        
        return [
            'name' => $this->generateMetaTemplateName($templateData['name']),
            'category' => $category,
            'language' => 'en',
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
        if (isset($templateData['categoryName'])) {
            $catName = strtolower($templateData['categoryName']);
            if (strpos($catName, 'utility') !== false) {
                $category = 'UTILITY';
            } elseif (strpos($catName, 'market') !== false) {
                $category = 'MARKETING';
            } else {
                $category = 'AUTHENTICATION';
            }
        }
        
        return [
            'name' => $templateData['name'],
            'category' => $category,
            'language' => 'en',
            'components' => $components
        ];
    }
    
    private function generateMetaTemplateName($name) {
        $name = preg_replace('/[^a-zA-Z0-9_]/', '_', $name);
        return strtolower($name) . '_' . time();
    }
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed"]);
    exit;
}

$whatsappAPI = new WhatsAppBusinessAPI($conn);

// ================= GET =================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Handle sync request
    if (isset($_GET['sync']) && $_GET['sync'] === 'true') {
        $syncResult = $whatsappAPI->syncAllTemplatesStatus();
        // You can choose to return sync result or continue with template fetch
    }
    
    $sql = "SELECT 
                t.id, t.guid, t.name as template_name, 
                c.categoryName as category,
                t.categoryName, t.languageGuid, t.typeId as template_type,
                t.isFile, t.templateHeaders, t.erpcategoryName,
                t.isVariable, t.body, t.bodyStyle,
                t.actionId, t.actionGuid, t.templateFooter,
                t.fileGuids, t.createdOn, t.modifiedOn,
                t.isActive, t.isDelete, t.meta_template_id, t.meta_status,
                t.template_json
            FROM templates t
            LEFT JOIN category c ON t.categoryName = c.guid
            WHERE t.isDelete = 0
            ORDER BY t.createdOn DESC";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Query failed: " . $conn->error]);
        exit();
    }

    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templateJson = null;
        if (!empty($row['template_json'])) {
            $templateJson = json_decode($row['template_json'], true);
        } else {
            $templateJson = [
                'name' => $row['template_name'],
                'category' => $row['template_type'] == 1 ? 'TRANSACTIONAL' : 'MARKETING',
                'language' => 'en',
                'components' => []
            ];
            
            if (!empty($row['body'])) {
                $templateJson['components'][] = [
                    'type' => 'BODY',
                    'text' => $row['body']
                ];
            }
            
            if (!empty($row['templateFooter'])) {
                $templateJson['components'][] = [
                    'type' => 'FOOTER',
                    'text' => $row['templateFooter']
                ];
            }
        }
        
        $templates[] = [
            'id' => (int)$row['id'],
            'guid' => $row['guid'],
            'template_name' => $row['template_name'],
            'category' => $row['category'],
            'categoryName' => $row['categoryName'],
            'languageGuid' => $row['languageGuid'],
            'template_type' => (int)$row['template_type'],
            'isFile' => (bool)$row['isFile'],
            'templateHeaders' => json_decode($row['templateHeaders'], true) ?? [],
            'erpcategoryName' => $row['erpcategoryName'],
            'isVariable' => (bool)$row['isVariable'],
            'body' => $row['body'],
            'bodyStyle' => $row['bodyStyle'],
            'actionId' => $row['actionId'],
            'actionGuid' => $row['actionGuid'],
            'template_footer' => $row['templateFooter'],
            'fileGuids' => json_decode($row['fileGuids'], true) ?? [],
            'createdOn' => $row['createdOn'],
            'modifiedOn' => $row['modifiedOn'],
            'isActive' => (bool)$row['isActive'],
            'isDelete' => (bool)$row['isDelete'],
            'meta_template_id' => $row['meta_template_id'],
            'meta_status' => $row['meta_status'] ?? 'PENDING',
            'template_json' => $templateJson
        ];
    }

    echo json_encode(["status" => "success", "data" => $templates]);
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
    // Check if it's JSON content type
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
    } else {
        // Fallback to form data if needed, but we expect JSON
        $data = $_POST;
    }
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid data received"]);
        exit();
    }

    $requiredFields = ['name', 'categoryName', 'languageGuid', 'typeId'];
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

    // Create template JSON for storage
    $templateJSON = $whatsappAPI->createTemplateJSON($data, $mediaId);
    $templateJSONString = json_encode($templateJSON);

    // Prepare data for Meta API with media ID
    $metaTemplateData = $whatsappAPI->formatTemplateForMeta($data, $mediaId);
    
    // Send to Meta WhatsApp Business API
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

    // Store in local database
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
    $categoryName = $data['categoryName'];
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

    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        
        $responseData = [
            "status" => "success",
            "message" => "Template stored successfully",
            "data" => [
                "id" => $newId, 
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
        ];
        
        if ($meta_status === 'FAILED') {
            $responseData['warning'] = "Template saved locally but failed to submit to Meta";
        }
        
        echo json_encode($responseData);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Execution failed: " . $stmt->error]);
    }

    $stmt->close();
    exit();
}

// ================= DELETE =================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Template ID is required"]);
        exit();
    }

    $id = (int)$data['id'];

    $checkSql = "SELECT id, meta_template_id FROM templates WHERE id = ? AND isDelete = 0";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $template = $result->fetch_assoc();
    $checkStmt->close();

    if (!$template) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Template not found"]);
        exit();
    }

    $deleteSql = "UPDATE templates SET isDelete = 1, modifiedOn = NOW() WHERE id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $id);

    if ($deleteStmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Template deleted successfully",
            "deleted_id" => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete template: " . $deleteStmt->error]);
    }

    $deleteStmt->close();
    exit();
}

$conn->close();
?>