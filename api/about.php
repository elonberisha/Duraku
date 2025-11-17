<?php
/**
 * About Section API
 * Handles CRUD operations for about section (JSON-based, no database)
 */

session_start();
header('Content-Type: application/json');
require_once '../config/storage.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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
    
    // Update fields
    if (isset($data['image'])) {
        $aboutData['image'] = $data['image'];
    }
    if (isset($data['team_image'])) {
        $aboutData['team_image'] = $data['team_image'];
    }
    if (isset($data['description_sq'])) {
        $aboutData['description_sq'] = trim($data['description_sq']);
    }
    if (isset($data['description_de'])) {
        $aboutData['description_de'] = trim($data['description_de']);
    }
    if (isset($data['experience_sq'])) {
        $aboutData['experience_sq'] = trim($data['experience_sq']);
    }
    if (isset($data['experience_de'])) {
        $aboutData['experience_de'] = trim($data['experience_de']);
    }
    if (isset($data['projects_sq'])) {
        $aboutData['projects_sq'] = trim($data['projects_sq']);
    }
    if (isset($data['projects_de'])) {
        $aboutData['projects_de'] = trim($data['projects_de']);
    }
    if (isset($data['clients_sq'])) {
        $aboutData['clients_sq'] = trim($data['clients_sq']);
    }
    if (isset($data['clients_de'])) {
        $aboutData['clients_de'] = trim($data['clients_de']);
    }
    if (isset($data['team_title_sq'])) {
        $aboutData['team_title_sq'] = trim($data['team_title_sq']);
    }
    if (isset($data['team_title_de'])) {
        $aboutData['team_title_de'] = trim($data['team_title_de']);
    }
    if (isset($data['team_description_sq'])) {
        $aboutData['team_description_sq'] = trim($data['team_description_sq']);
    }
    if (isset($data['team_description_de'])) {
        $aboutData['team_description_de'] = trim($data['team_description_de']);
    }
    if (isset($data['experience_number'])) {
        $aboutData['experience_number'] = trim($data['experience_number']);
    }
    if (isset($data['projects_number'])) {
        $aboutData['projects_number'] = trim($data['projects_number']);
    }
    if (isset($data['clients_number'])) {
        $aboutData['clients_number'] = trim($data['clients_number']);
    }
    
    $aboutData['updated_at'] = date('Y-m-d H:i:s');
    
    ob_end_clean();
    if (writeJSON('about_section.json', $aboutData)) {
        echo json_encode(['success' => true, 'message' => 'About section updated']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save about section']);
    }
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
    } else {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => ucfirst($imageType) . ' image removed']);
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

