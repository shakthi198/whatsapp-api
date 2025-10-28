<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

class MessageAPI {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    // Function to validate required fields for storing messages
    private function validateInput($data) {
        $errors = [];
        
        if (empty($data['phone_number'])) {
            $errors[] = "Phone number is required";
        }
        
        if (empty($data['message_content'])) {
            $errors[] = "Message content is required";
        }
        
        if (empty($data['status'])) {
            $errors[] = "Status is required";
        }
        
        return $errors;
    }
    
    // Convert ISO datetime to MySQL datetime format
    private function convertToMySQLDateTime($isoDateTime) {
        if (empty($isoDateTime)) {
            return date('Y-m-d H:i:s');
        }
        
        try {
            // Create DateTime object from ISO format
            $date = new DateTime($isoDateTime);
            // Convert to MySQL datetime format
            return $date->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            // If conversion fails, use current datetime
            return date('Y-m-d H:i:s');
        }
    }
    
    // Store a new message
    public function storeMessage($input) {
        try {
            // Validate required fields
            $validationErrors = $this->validateInput($input);
            if (!empty($validationErrors)) {
                http_response_code(400);
                return [
                    "status" => "error",
                    "message" => "Validation failed",
                    "errors" => $validationErrors
                ];
            }
            
            // Extract data with defaults
            $phone_number = $this->conn->real_escape_string($input['phone_number']);
            $country_code = $this->conn->real_escape_string($input['country_code'] ?? '');
            $mobile_number = $this->conn->real_escape_string($input['mobile_number'] ?? '');
            $message_content = $this->conn->real_escape_string($input['message_content']);
            $template_name = $this->conn->real_escape_string($input['template_used'] ?? '');
            $template_id = $this->conn->real_escape_string($input['template_id'] ?? '');
            $whatsapp_message_id = $this->conn->real_escape_string($input['whatsapp_message_id'] ?? '');
            $status = $this->conn->real_escape_string($input['status']);
            $message_type = $this->conn->real_escape_string($input['message_type'] ?? 'text');
            
            // Handle response_data (store as JSON)
            $response_data = null;
            if (!empty($input['response_data'])) {
                $response_data = $this->conn->real_escape_string(json_encode($input['response_data']));
            }
            
            // Handle sent_at - convert ISO format to MySQL datetime
            $sent_at = $this->convertToMySQLDateTime($input['sent_at'] ?? null);
            
            // Prepare SQL query
            $sql = "INSERT INTO sent_messages (
                phone_number, 
                country_code, 
                mobile_number, 
                message_content, 
                template_name, 
                template_id, 
                whatsapp_message_id, 
                status, 
                message_type, 
                response_data, 
                sent_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->conn->error);
            }
            
            $stmt->bind_param(
                "sssssssssss",
                $phone_number,
                $country_code,
                $mobile_number,
                $message_content,
                $template_name,
                $template_id,
                $whatsapp_message_id,
                $status,
                $message_type,
                $response_data,
                $sent_at
            );
            
            if ($stmt->execute()) {
                $message_id = $stmt->insert_id;
                
                return [
                    "status" => "success",
                    "message" => "Message stored successfully",
                    "data" => [
                        "id" => $message_id,
                        "phone_number" => $phone_number,
                        "status" => $status,
                        "sent_at" => $sent_at
                    ]
                ];
            } else {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $stmt->close();
            
        } catch (Exception $e) {
            http_response_code(500);
            return [
                "status" => "error",
                "message" => "Failed to store message",
                "error" => $e->getMessage()
            ];
        }
    }
    
    // Get sent messages with filtering and pagination
    public function getMessages($params) {
        try {
            // Get query parameters
            $page = isset($params['page']) ? (int)$params['page'] : 1;
            $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
            $status = isset($params['status']) ? $this->conn->real_escape_string($params['status']) : '';
            $phone_number = isset($params['phone_number']) ? $this->conn->real_escape_string($params['phone_number']) : '';
            $template_name = isset($params['template_name']) ? $this->conn->real_escape_string($params['template_name']) : '';
            $date_from = isset($params['date_from']) ? $this->conn->real_escape_string($params['date_from']) : '';
            $date_to = isset($params['date_to']) ? $this->conn->real_escape_string($params['date_to']) : '';
            
            // Calculate offset
            $offset = ($page - 1) * $limit;
            
            // Build WHERE clause
            $whereConditions = [];
            $whereParams = [];
            $paramTypes = '';
            
            if (!empty($status)) {
                $whereConditions[] = "status = ?";
                $whereParams[] = $status;
                $paramTypes .= 's';
            }
            
            if (!empty($phone_number)) {
                $whereConditions[] = "phone_number LIKE ?";
                $whereParams[] = "%$phone_number%";
                $paramTypes .= 's';
            }
            
            if (!empty($template_name)) {
                $whereConditions[] = "template_name = ?";
                $whereParams[] = $template_name;
                $paramTypes .= 's';
            }
            
            if (!empty($date_from)) {
                $whereConditions[] = "sent_at >= ?";
                $whereParams[] = $date_from;
                $paramTypes .= 's';
            }
            
            if (!empty($date_to)) {
                $whereConditions[] = "sent_at <= ?";
                $whereParams[] = $date_to . ' 23:59:59';
                $paramTypes .= 's';
            }
            
            $whereClause = "";
            if (!empty($whereConditions)) {
                $whereClause = "WHERE " . implode(" AND ", $whereConditions);
            }
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM sent_messages $whereClause";
            $countStmt = $this->conn->prepare($countSql);
            
            if (!empty($whereParams)) {
                $countStmt->bind_param($paramTypes, ...$whereParams);
            }
            
            $countStmt->execute();
            $countResult = $countStmt->get_result();
            $totalCount = $countResult->fetch_assoc()['total'];
            $countStmt->close();
            
            // Get messages
            $sql = "SELECT 
                        id,
                        phone_number,
                        country_code,
                        mobile_number,
                        message_content,
                        template_name,
                        template_id,
                        whatsapp_message_id,
                        status,
                        message_type,
                        response_data,
                        sent_at,
                        created_at
                    FROM sent_messages 
                    $whereClause 
                    ORDER BY sent_at DESC 
                    LIMIT ? OFFSET ?";
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->conn->error);
            }
            
            // Bind parameters for the main query
            $finalParamTypes = $paramTypes . 'ii';
            $finalParams = array_merge($whereParams, [$limit, $offset]);
            
            if (!empty($finalParams)) {
                $stmt->bind_param($finalParamTypes, ...$finalParams);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $messages = [];
            while ($row = $result->fetch_assoc()) {
                // Decode response_data if it exists
                if (!empty($row['response_data'])) {
                    $row['response_data'] = json_decode($row['response_data'], true);
                }
                $messages[] = $row;
            }
            
            $stmt->close();
            
            return [
                "status" => "success",
                "data" => $messages,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => $totalCount,
                    "pages" => ceil($totalCount / $limit)
                ]
            ];
            
        } catch (Exception $e) {
            http_response_code(500);
            return [
                "status" => "error",
                "message" => "Failed to fetch messages",
                "error" => $e->getMessage()
            ];
        }
    }
    
    // Get single message by ID
    public function getMessageById($id) {
        try {
            $sql = "SELECT 
                        id,
                        phone_number,
                        country_code,
                        mobile_number,
                        message_content,
                        template_name,
                        template_id,
                        whatsapp_message_id,
                        status,
                        message_type,
                        response_data,
                        sent_at,
                        created_at
                    FROM sent_messages 
                    WHERE id = ?";
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->conn->error);
            }
            
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                return [
                    "status" => "error",
                    "message" => "Message not found"
                ];
            }
            
            $message = $result->fetch_assoc();
            
            // Decode response_data if it exists
            if (!empty($message['response_data'])) {
                $message['response_data'] = json_decode($message['response_data'], true);
            }
            
            $stmt->close();
            
            return [
                "status" => "success",
                "data" => $message
            ];
            
        } catch (Exception $e) {
            http_response_code(500);
            return [
                "status" => "error",
                "message" => "Failed to fetch message",
                "error" => $e->getMessage()
            ];
        }
    }
}

// Main API logic
try {
    $api = new MessageAPI($conn);
    
    // Determine the action based on request method and parameters
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Store a new message
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception("Invalid JSON input");
        }
        
        $result = $api->storeMessage($input);
        echo json_encode($result);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get messages
        if (isset($_GET['id'])) {
            // Get single message by ID
            $id = (int)$_GET['id'];
            $result = $api->getMessageById($id);
            echo json_encode($result);
        } else {
            // Get multiple messages with filters
            $result = $api->getMessages($_GET);
            echo json_encode($result);
        }
    } else {
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Method not allowed"
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "API error",
        "error" => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>