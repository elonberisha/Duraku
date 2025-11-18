<?php
/**
 * About Section API
 * Handles CRUD operations for about section (JSON-based, no database)
 */

// Disable error display
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
    exit;
}

setSecureSession();
header('Content-Type: application/json; charset=utf-8');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ob_clean();

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
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Get about section data
if ($method === 'GET' && $action === 'get') {
    $aboutData = readJSON('about_section.json');
    
    // Return default if empty
    if (empty($aboutData)) {
        $aboutData = [
            'image' => '',
            'description_sq' => 'DURAKU XHEVDET është një kompani specializuese në mbrojtjen e ndërtesave dhe dyshet industriale. Me vite përvojë në industri, ne ofrojmë zgjidhje profesionale për të gjitha nevojat tuaja të veshjes.',
            'description_de' => 'DURAKU XHEVDET ist ein spezialisiertes Unternehmen für Bautenschutz und Industrieböden. Mit jahrelanger Branchenerfahrung bieten wir professionelle Lösungen für alle Ihre Beschichtungsbedürfnisse.',
            'experience_sq' => 'Vite Përvojë',
            'experience_de' => 'Jahre Erfahrung',
            'projects_sq' => 'Projekte të Përfunduara',
            'projects_de' => 'Abgeschlossene Projekte',
            'clients_sq' => 'Klientë të Kënaqur',
            'clients_de' => 'Zufriedene Kunden',
            'team_title_sq' => 'Ekipi Ynë',
            'team_title_de' => 'Unser Team',
            'team_description_sq' => 'Ekipi ynë i ekspertëve është i përkushtuar për të ofruar cilësi të lartë dhe rezultate të shkëlqyera në çdo projekt.',
            'team_description_de' => 'Unser Expertenteam ist bestrebt, hohe Qualität und hervorragende Ergebnisse bei jedem Projekt zu liefern.',
            'experience_number' => '15+',
            'projects_number' => '500+',
            'clients_number' => '300+'
        ];
    }
    
    // Fix image path separators (convert backslashes to forward slashes)
    if (!empty($aboutData['image'])) {
        $aboutData['image'] = str_replace('\\', '/', $aboutData['image']);
    }
    if (!empty($aboutData['team_image'])) {
        $aboutData['team_image'] = str_replace('\\', '/', $aboutData['team_image']);
    }
    
    ob_end_clean();
    echo json_encode(['success' => true, 'data' => $aboutData]);
    ob_end_flush();
}
// POST/PUT - Update about section
elseif (($method === 'POST' || $method === 'PUT') && $action === 'update') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get existing data or create new
    $aboutData = readJSON('about_section.json');
    
    if (empty($aboutData)) {
        $aboutData = [];
    }
    
    // Update fields with sanitization
    if (isset($data['image'])) {
        $imagePath = sanitizeInput($data['image'], 500);
        // Validate image path
        if (!empty($imagePath) && strpos($imagePath, 'uploads/') !== 0) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['error' => 'Invalid image path']);
            exit;
        }
        $aboutData['image'] = $imagePath;
    }
    if (isset($data['team_image'])) {
        $imagePath = sanitizeInput($data['team_image'], 500);
        // Validate image path
        if (!empty($imagePath) && strpos($imagePath, 'uploads/') !== 0) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['error' => 'Invalid team image path']);
            exit;
        }
        $aboutData['team_image'] = $imagePath;
    }
    if (isset($data['description_sq'])) {
        $aboutData['description_sq'] = sanitizeText($data['description_sq'], 2000);
    }
    if (isset($data['description_de'])) {
        $aboutData['description_de'] = sanitizeText($data['description_de'], 2000);
    }
    if (isset($data['experience_sq'])) {
        $aboutData['experience_sq'] = sanitizeInput($data['experience_sq'], 100);
    }
    if (isset($data['experience_de'])) {
        $aboutData['experience_de'] = sanitizeInput($data['experience_de'], 100);
    }
    if (isset($data['projects_sq'])) {
        $aboutData['projects_sq'] = sanitizeInput($data['projects_sq'], 100);
    }
    if (isset($data['projects_de'])) {
        $aboutData['projects_de'] = sanitizeInput($data['projects_de'], 100);
    }
    if (isset($data['clients_sq'])) {
        $aboutData['clients_sq'] = sanitizeInput($data['clients_sq'], 100);
    }
    if (isset($data['clients_de'])) {
        $aboutData['clients_de'] = sanitizeInput($data['clients_de'], 100);
    }
    if (isset($data['team_title_sq'])) {
        $aboutData['team_title_sq'] = sanitizeInput($data['team_title_sq'], 200);
    }
    if (isset($data['team_title_de'])) {
        $aboutData['team_title_de'] = sanitizeInput($data['team_title_de'], 200);
    }
    if (isset($data['team_description_sq'])) {
        $aboutData['team_description_sq'] = sanitizeText($data['team_description_sq'], 1000);
    }
    if (isset($data['team_description_de'])) {
        $aboutData['team_description_de'] = sanitizeText($data['team_description_de'], 1000);
    }
    if (isset($data['experience_number'])) {
        $aboutData['experience_number'] = sanitizeInput($data['experience_number'], 20);
    }
    if (isset($data['projects_number'])) {
        $aboutData['projects_number'] = sanitizeInput($data['projects_number'], 20);
    }
    if (isset($data['clients_number'])) {
        $aboutData['clients_number'] = sanitizeInput($data['clients_number'], 20);
    }
    
    $aboutData['updated_at'] = date('Y-m-d H:i:s');
    
    ob_end_clean();
    if (writeJSON('about_section.json', $aboutData)) {
        echo json_encode(['success' => true, 'message' => 'About section updated']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save about section']);
    }
    ob_end_flush();
}
// DELETE - Remove about image
elseif ($method === 'DELETE' && $action === 'delete_image') {
    requireAuth();
    
    $imageType = $_GET['type'] ?? 'about'; // 'about' or 'team'
    
    $aboutData = readJSON('about_section.json');
    
    if (!empty($aboutData)) {
        if ($imageType === 'team') {
            $aboutData['team_image'] = '';
        } else {
            $aboutData['image'] = '';
        }
        $aboutData['updated_at'] = date('Y-m-d H:i:s');
        
        ob_end_clean();
        if (writeJSON('about_section.json', $aboutData)) {
            echo json_encode(['success' => true, 'message' => ucfirst($imageType) . ' image removed']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove image']);
        }
        ob_end_flush();
    } else {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => ucfirst($imageType) . ' image removed']);
        ob_end_flush();
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

