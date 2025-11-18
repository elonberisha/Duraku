<?php
/**
 * Hero Section API
 * Handles hero section content management
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Custom error handler to prevent any output
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Log error but don't output anything
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true; // Suppress default error handler
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
    exit;
}

setSecureSession();

header('Content-Type: application/json; charset=utf-8');

// CORS headers - allow admin subdomain with credentials
$allowedOrigin = '*';
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowedOrigins = [
        'https://durakubeschichtung.de',
        'https://www.durakubeschichtung.de',
        'https://admin.durakubeschichtung.de'
    ];
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        $allowedOrigin = $_SERVER['HTTP_ORIGIN'];
    }
}
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($allowedOrigin !== '*') {
    header('Access-Control-Allow-Credentials: true');
}

ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Get hero section data
if ($method === 'GET' && $action === 'get') {
    $heroData = readJSON('hero_section.json');
    
    // Return default if empty
    if (empty($heroData)) {
        $heroData = [
            'background_image' => '',
            'title_sq' => 'DURAKU',
            'title_de' => 'DURAKU',
            'subtitle_sq' => 'XHEVDET',
            'subtitle_de' => 'XHEVDET',
            'tagline_sq' => 'BAUTENSCHUTZ & INDUSTRIENBÖDEN',
            'tagline_de' => 'BAUTENSCHUTZ & INDUSTRIENBÖDEN',
            'description_sq' => 'Profesionale për veshje dhe restaurim të dysheveve industriale',
            'description_de' => 'Professionelle Beschichtungen und Sanierungen für Ihre Industrieböden',
            'cta_text_sq' => 'Kontaktoni',
            'cta_text_de' => 'Kontakt aufnehmen',
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }
    
    ob_end_clean();
    echo json_encode(['success' => true, 'data' => $heroData]);
    ob_end_flush();
}
// POST/PUT - Update hero section
elseif (($method === 'POST' || $method === 'PUT') && $action === 'update') {
    // Check authentication
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get existing data or create new
    $heroData = readJSON('hero_section.json');
    
    if (empty($heroData)) {
        $heroData = [];
    }
    
    // Update fields with sanitization
    if (isset($data['background_image'])) {
        $imagePath = sanitizeInput($data['background_image'], 500);
        // Validate image path
        if (!empty($imagePath) && strpos($imagePath, 'uploads/') !== 0) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['error' => 'Invalid image path']);
            exit;
        }
        $heroData['background_image'] = $imagePath;
    }
    if (isset($data['title_sq'])) {
        $heroData['title_sq'] = sanitizeInput($data['title_sq'], 200);
    }
    if (isset($data['title_de'])) {
        $heroData['title_de'] = sanitizeInput($data['title_de'], 200);
    }
    if (isset($data['subtitle_sq'])) {
        $heroData['subtitle_sq'] = sanitizeInput($data['subtitle_sq'], 200);
    }
    if (isset($data['subtitle_de'])) {
        $heroData['subtitle_de'] = sanitizeInput($data['subtitle_de'], 200);
    }
    if (isset($data['tagline_sq'])) {
        $heroData['tagline_sq'] = sanitizeInput($data['tagline_sq'], 200);
    }
    if (isset($data['tagline_de'])) {
        $heroData['tagline_de'] = sanitizeInput($data['tagline_de'], 200);
    }
    if (isset($data['description_sq'])) {
        $heroData['description_sq'] = sanitizeText($data['description_sq'], 1000);
    }
    if (isset($data['description_de'])) {
        $heroData['description_de'] = sanitizeText($data['description_de'], 1000);
    }
    if (isset($data['cta_text_sq'])) {
        $heroData['cta_text_sq'] = sanitizeInput($data['cta_text_sq'], 100);
    }
    if (isset($data['cta_text_de'])) {
        $heroData['cta_text_de'] = sanitizeInput($data['cta_text_de'], 100);
    }
    
    $heroData['updated_at'] = date('Y-m-d H:i:s');
    
    if (writeJSON('hero_section.json', $heroData)) {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Hero section updated successfully']);
        ob_end_flush();
    } else {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update hero section']);
        ob_end_flush();
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

