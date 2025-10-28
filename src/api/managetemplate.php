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
            'access_token' => 'Bearer EAAS5pfUImY8BPZCmhtnGgjiXfqxZC8dqdB0mDDF9FsqBA2t3LZC2d3pDPybDZCUD5P1KUQNfZAqvyKiwG997Twzn2NpzkjZAZAg5eR4ZCWpREWUZBxmHYn4ZC1CwwTH2CH1HrwIDN6wKWI6NZADmv1qh79ontOOmAOJRwh7GuF1gjUGeKFoZC9vTvPe2DZBXNOukiKaTA4wYjjWIor0qV2lpZAx1keP9WauQ1uKnVZCEoQdbPYEQWYiOUoZAs19SOCQJ07iR6vCy8KWDlbKQHFCZBHO4QZC0m1bLLz29JjlmwuiA5eFgZDZD',
            'waba_id' => '1354293032712286'
        ];
    }
    
    // Method to get all templates from Meta and update status
    public function syncAllTemplatesStatus() {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['waba_id'] . '/message_templates';
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->whatsappConfig['access_token']
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $metaTemplates = json_decode($response, true);
            
            // Get all local templates that have meta_template_id
            $sql = "SELECT id, meta_template_id FROM templates WHERE meta_template_id IS NOT NULL AND isDelete = 0";
            $result = $this->conn->query($sql);
            
            $updatedCount = 0;
            while ($localTemplate = $result->fetch_assoc()) {
                foreach ($metaTemplates['data'] as $metaTemplate) {
                    if ($metaTemplate['id'] === $localTemplate['meta_template_id']) {
                        // Update local template status
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
    
    // Method to send template to Meta with detailed debugging
    public function createTemplateOnMeta($templateData) {
        $url = $this->whatsappConfig['base_url'] . '/' . $this->whatsappConfig['waba_id'] . '/message_templates';
        
        // Log the request details for debugging
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
            CURLOPT_VERBOSE => true, // Enable verbose output for debugging
            CURLOPT_SSL_VERIFYPEER => false, // Temporarily disable SSL verification for testing
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        $curlInfo = curl_getinfo($ch);
        curl_close($ch);
        
        // Log the response for debugging
        error_log("Meta API Response Code: " . $httpCode);
        error_log("Meta API Response: " . $response);
        if ($curlError) {
            error_log("CURL Error: " . $curlError);
        }
        
        return [
            'status_code' => $httpCode,
            'response' => json_decode($response, true),
            'curl_error' => $curlError,
            'request_details' => [
                'url' => $url,
                'headers' => [
                    'Authorization: ' . $this->whatsappConfig['access_token'],
                    'Content-Type: application/json'
                ],
                'payload' => $templateData
            ]
        ];
    }
    
    // Method to format template for Meta API in the exact required JSON format
   // Method to format template for Meta API in the exact required JSON format
// Method to format template for Meta API in the exact required JSON format
public function formatTemplateForMeta($templateData) {
    $components = [];
    
    // Determine category
    $category = 'UTILITY';
    if (isset($templateData['categoryName'])) {
        if ($templateData['categoryName'] == "Utility") {
            $category = 'UTILITY';
        } elseif ($templateData['categoryName'] == 'Marketing') {
            $category = 'MARKETING';
        } elseif ($templateData['categoryName'] == 'Authentication') {
            $category = 'AUTHENTICATION';
        }
    }
    
    // Body component for all template types
    if (!empty($templateData['body'])) {
        $bodyText = $templateData['body'];
        
        // Transform custom variables to Meta's format ({{1}}, {{2}}, etc.)
        if (!empty($templateData['attributes'])) {
            $attributes = json_decode($templateData['attributes'], true);
            if (is_array($attributes)) {
                $variableIndex = 1;
                foreach ($attributes as $attribute) {
                    $placeholder = '{{' . ($attribute['value'] ?? $attribute['name'] ?? '') . '}}';
                    $metaFormat = '{{' . $variableIndex . '}}';
                    $bodyText = str_replace($placeholder, $metaFormat, $bodyText);
                    $variableIndex++;
                }
            }
        }
        
        if ($category === 'AUTHENTICATION') {
            // For authentication templates - KEEP YOUR ORIGINAL FORMAT
            $components[] = [
                'type' => 'BODY',
                'example' => [
                    'body_text' => [$this->generateAuthenticationExample($bodyText)]
                ]
            ];
            
            // Keep your original BUTTONS format for authentication
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => [
                    [
                        'type' => 'OTP',
                        'otp_type' => 'COPY_CODE'
                    ]
                ]
            ];
            
        } else {
            // For MARKETING and UTILITY templates - SIMPLIFIED FORMAT
            $bodyComponent = [
                'type' => 'BODY',
                'text' => $bodyText
            ];
            
            $components[] = $bodyComponent;
        }
    }
    
    // Header component (for MARKETING/UTILITY only - not allowed in AUTHENTICATION)
    if (!empty($templateData['templateHeaders']) && $category !== 'AUTHENTICATION') {
        $headers = json_decode($templateData['templateHeaders'], true);
        if (isset($headers['type']) && $headers['type'] === 'text' && !empty($headers['text'])) {
            $components[] = [
                'type' => 'HEADER',
                'format' => 'TEXT',
                'text' => $headers['text']
            ];
        }
    }
    
    // Footer component (for MARKETING/UTILITY only - not allowed in AUTHENTICATION)
    if (!empty($templateData['templateFooter']) && $category !== 'AUTHENTICATION') {
        $components[] = [
            'type' => 'FOOTER',
            'text' => $templateData['templateFooter']
        ];
    }
    
    // Add buttons for MARKETING templates (URL buttons and Quick Replies)
    if ($category === 'MARKETING') {
        $buttons = [];
        
        // Add URL buttons if available
        if (!empty($templateData['urlButtons'])) {
            $urlButtons = json_decode($templateData['urlButtons'], true);
            if (is_array($urlButtons)) {
                foreach ($urlButtons as $urlButton) {
                    if (!empty($urlButton['text']) && !empty($urlButton['url'])) {
                        $buttons[] = [
                            'type' => 'URL',
                            'text' => $urlButton['text'],
                            'url' => $urlButton['url']
                        ];
                    }
                }
            }
        }
        
        // Add quick reply buttons if available
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
        
        // Add buttons component if we have any buttons
        if (!empty($buttons)) {
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => $buttons
            ];
        }
    }
    
    // Add quick reply buttons for UTILITY templates (only quick replies, no URL buttons)
    if ($category === 'UTILITY' && !empty($templateData['quickReplies'])) {
        $buttons = [];
        $quickReplies = json_decode($templateData['quickReplies'], true);
        
        if (is_array($quickReplies) && !empty($quickReplies)) {
            foreach ($quickReplies as $reply) {
                if (!empty($reply['text'])) {
                    $buttons[] = [
                        'type' => 'QUICK_REPLY',
                        'text' => $reply['text']
                    ];
                }
            }
            
            if (!empty($buttons)) {
                $components[] = [
                    'type' => 'BUTTONS',
                    'buttons' => $buttons
                ];
            }
        }
    }
    
    return [
        'name' => $this->generateMetaTemplateName($templateData['name']),
        'category' => $category,
        'language' => 'en',
        'components' => $components
    ];
}

// Helper method to generate example for authentication templates
private function generateAuthenticationExample($bodyText) {
    return preg_replace('/\{\{\d+\}\}/', '123456', $bodyText);
}
    // Method to create complete template JSON for storage
    public function createTemplateJSON($templateData) {
        $components = [];
        
        // Header component
        if (!empty($templateData['templateHeaders'])) {
            $headers = json_decode($templateData['templateHeaders'], true);
            if (isset($headers['type']) && $headers['type'] === 'text' && !empty($headers['text'])) {
                $components[] = [
                    'type' => 'HEADER',
                    'format' => 'TEXT',
                    'text' => $headers['text']
                ];
            }
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
        if (!empty($templateData['quickReplies'])) {
            $buttons = [];
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
                
                if (!empty($buttons)) {
                    $components[] = [
                        'type' => 'BUTTONS',
                        'buttons' => $buttons
                    ];
                }
            }
        }
        
        // Determine category based on typeId
        $category = 'UTILITY';
        if (isset($templateData['categoryName'])) {
            if ($templateData['categoryName'] == "Utility") {
                $category = 'UTILITY';
            } elseif ($templateData['categoryName'] == 'Marketing') {
                $category = 'MARKETING';
            }
            else {
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
    
    // Sync template status with Meta if requested
    if (isset($_GET['sync']) && $_GET['sync'] === 'true') {
        $syncResult = $whatsappAPI->syncAllTemplatesStatus();
        // Continue to fetch templates even if sync fails
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
        // Parse template JSON if exists, otherwise use legacy fields
        $templateJson = null;
        if (!empty($row['template_json'])) {
            $templateJson = json_decode($row['template_json'], true);
        } else {
            // Fallback to legacy format
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

// ================= POST =================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
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

    // Create template JSON for storage
    $templateJSON = $whatsappAPI->createTemplateJSON($data);
    $templateJSONString = json_encode($templateJSON);

    // First, store in local database
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

    // Set default values
    $meta_template_id = null;
    $meta_status = 'PENDING';

    // Prepare data for Meta API
    $metaTemplateData = $whatsappAPI->formatTemplateForMeta($data);
    
    // Send to Meta WhatsApp Business API
    $metaResponse = $whatsappAPI->createTemplateOnMeta($metaTemplateData);
    
    if ($metaResponse['status_code'] === 200) {
        $meta_template_id = $metaResponse['response']['id'] ?? null;
        $meta_status = 'SUBMITTED';
    } else {
        $meta_status = 'FAILED';
        error_log("Meta API Error: " . json_encode($metaResponse));
    }

    $name = $data['name'];
    $categoryName = $data['categoryName'];
    $languageGuid = $data['languageGuid'];
    $typeId = (int)$data['typeId'];
    $isFile = isset($data['isFile']) ? (int)$data['isFile'] : 0;
    $templateHeaders = json_encode($data['templateHeaders'] ?? []);
    $erpcategoryName = $data['erpcategoryName'] ?? '';
    $isVariable = isset($data['isVariable']) ? (int)$data['isVariable'] : 0;
    $body = $data['body'] ?? '';
    $bodyStyle = $data['bodyStyle'] ?? '';
    $actionId = isset($data['actionId']) ? (int)$data['actionId'] : 0;
    $actionGuid = $data['actionGuid'] ?? '';
    $templateFooter = $data['templateFooter'] ?? '';
    $fileGuids = json_encode($data['fileGuids'] ?? []);
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
                "meta_template_id" => $meta_template_id,
                "meta_status" => $meta_status,
                "template_json" => $templateJSON,
                "meta_api_request" => [
                    "url" => $metaResponse['request_details']['url'],
                    "headers" => $metaResponse['request_details']['headers'],
                    "payload" => $metaResponse['request_details']['payload']
                ],
                "meta_api_response" => [
                    "status_code" => $metaResponse['status_code'],
                    "response" => $metaResponse['response'],
                    "curl_error" => $metaResponse['curl_error']
                ]
            ]
        ];
        
        // If Meta submission failed, include warning
        if ($meta_status === 'FAILED') {
            $responseData['warning'] = "Template saved locally but failed to submit to Meta";
            $responseData['debug_info'] = [
                'meta_error_details' => $metaResponse['response']['error'] ?? 'Unknown error',
                'curl_error' => $metaResponse['curl_error']
            ];
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

    // Check if exists
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

    // If template exists on Meta, delete it there too
    if (!empty($template['meta_template_id'])) {
        // Note: Meta doesn't allow template deletion via API for approved templates
        // You can only delete rejected or in review templates
        // This is a limitation of the Meta WhatsApp Business API
    }

    // Soft delete from local database
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