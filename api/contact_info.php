<?php
/**
 * Contact Information API
 * Handles CRUD operations for contact information (phone, email, social media, address)
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Custom error handler to prevent any output
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true;
});

// Start output buffering
ob_start();

try {
    require_once '../config/storage.php';
    require_once '../config/security.php';
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    ob_end_flush();
    exit;
}

setSecureSession();
header('Content-Type: application/json; charset=utf-8');

ob_clean();

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// Check authentication for write operations
function requireAuth() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        ob_end_flush();
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Get contact information
if ($method === 'GET' && $action === 'get') {
    $contactInfo = readJSON('contact_info.json');
    
    // Return default values if file doesn't exist
    if (!$contactInfo || empty($contactInfo)) {
        $contactInfo = [
            'phone' => '0174/210 97 35',
            'phone_link' => '+491742109735',
            'email' => 'duraku_xhevdet@icloud.com',
            'address' => 'Zandter Str. 14',
            'postal_code' => '85095',
            'city' => 'Denkendorf',
            'country' => 'Germany',
            'whatsapp' => '491742109735',
            'viber' => '+491742109735',
            'facebook' => 'https://www.facebook.com',
            'instagram' => 'https://www.instagram.com',
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }
    
    ob_end_clean();
    echo json_encode(['success' => true, 'data' => $contactInfo]);
    ob_end_flush();
}
// PUT/POST - Update contact information
elseif (($method === 'PUT' || $method === 'POST') && $action === 'update') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        ob_end_flush();
        exit;
    }
    
    // Validate and sanitize inputs
    $contactInfo = [
        'phone' => sanitizeInput($data['phone'] ?? '', 50),
        'phone_link' => sanitizeInput($data['phone_link'] ?? '', 50),
        'email' => validateEmail($data['email'] ?? '') ?: '',
        'address' => sanitizeInput($data['address'] ?? '', 200),
        'postal_code' => sanitizeInput($data['postal_code'] ?? '', 20),
        'city' => sanitizeInput($data['city'] ?? '', 100),
        'country' => sanitizeInput($data['country'] ?? '', 100),
        'whatsapp' => sanitizeInput($data['whatsapp'] ?? '', 50),
        'viber' => sanitizeInput($data['viber'] ?? '', 50),
        'facebook' => filter_var($data['facebook'] ?? '', FILTER_SANITIZE_URL),
        'instagram' => filter_var($data['instagram'] ?? '', FILTER_SANITIZE_URL),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Validate required fields
    if (empty($contactInfo['phone']) || empty($contactInfo['email'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Phone and email are required']);
        ob_end_flush();
        exit;
    }
    
    if (writeJSON('contact_info.json', $contactInfo)) {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Contact information updated', 'data' => $contactInfo]);
    } else {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save contact information']);
    }
    ob_end_flush();
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

