<?php
/**
 * Hero Section API
 * Handles hero section content management
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering
ob_start();

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ob_clean();

require_once '../config/storage.php';

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
    
    // Update fields
    if (isset($data['background_image'])) {
        $heroData['background_image'] = $data['background_image'];
    }
    if (isset($data['title_sq'])) {
        $heroData['title_sq'] = $data['title_sq'];
    }
    if (isset($data['title_de'])) {
        $heroData['title_de'] = $data['title_de'];
    }
    if (isset($data['subtitle_sq'])) {
        $heroData['subtitle_sq'] = $data['subtitle_sq'];
    }
    if (isset($data['subtitle_de'])) {
        $heroData['subtitle_de'] = $data['subtitle_de'];
    }
    if (isset($data['tagline_sq'])) {
        $heroData['tagline_sq'] = $data['tagline_sq'];
    }
    if (isset($data['tagline_de'])) {
        $heroData['tagline_de'] = $data['tagline_de'];
    }
    if (isset($data['description_sq'])) {
        $heroData['description_sq'] = $data['description_sq'];
    }
    if (isset($data['description_de'])) {
        $heroData['description_de'] = $data['description_de'];
    }
    if (isset($data['cta_text_sq'])) {
        $heroData['cta_text_sq'] = $data['cta_text_sq'];
    }
    if (isset($data['cta_text_de'])) {
        $heroData['cta_text_de'] = $data['cta_text_de'];
    }
    
    $heroData['updated_at'] = date('Y-m-d H:i:s');
    
    if (writeJSON('hero_section.json', $heroData)) {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Hero section updated successfully']);
    } else {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update hero section']);
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

