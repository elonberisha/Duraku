<?php
/**
 * Categories API
 * Handles CRUD operations for categories (JSON-based, no database)
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

// GET - List all categories
if ($method === 'GET' && $action === 'list') {
    $categories = readJSON('categories.json');
    ob_end_clean();
    echo json_encode(['success' => true, 'data' => $categories]);
}
// GET - Get single category
elseif ($method === 'GET' && $action === 'get') {
    $id = intval($_GET['id'] ?? 0);
    
    $categories = readJSON('categories.json');
    $category = null;
    
    foreach ($categories as $cat) {
        if ($cat['id'] == $id) {
            $category = $cat;
            break;
        }
    }
    
    ob_end_clean();
    if ($category) {
        echo json_encode(['success' => true, 'data' => $category]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Category not found']);
    }
}
// POST - Create new category
elseif ($method === 'POST' && $action === 'create') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name_sq']) || !isset($data['name_de'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Name (Albanian and German) is required']);
        exit;
    }
    
    $categories = readJSON('categories.json');
    
    $newCategory = [
        'id' => getNextId('categories.json'),
        'name_sq' => trim($data['name_sq']),
        'name_de' => trim($data['name_de']),
        'description_sq' => trim($data['description_sq'] ?? ''),
        'description_de' => trim($data['description_de'] ?? ''),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $categories[] = $newCategory;
    
    ob_end_clean();
    if (writeJSON('categories.json', $categories)) {
        echo json_encode(['success' => true, 'id' => $newCategory['id'], 'message' => 'Category created']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save category']);
    }
}
// PUT - Update category
elseif ($method === 'PUT' && $action === 'update') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($_GET['id'] ?? 0);
    
    if (!$id) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Category ID required']);
        exit;
    }
    
    if (!isset($data['name_sq']) || !isset($data['name_de'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Name (Albanian and German) is required']);
        exit;
    }
    
    $categories = readJSON('categories.json');
    $found = false;
    
    foreach ($categories as &$cat) {
        if ($cat['id'] == $id) {
            $cat['name_sq'] = trim($data['name_sq']);
            $cat['name_de'] = trim($data['name_de']);
            $cat['description_sq'] = trim($data['description_sq'] ?? '');
            $cat['description_de'] = trim($data['description_de'] ?? '');
            $cat['updated_at'] = date('Y-m-d H:i:s');
            $found = true;
            break;
        }
    }
    
    ob_end_clean();
    if ($found && writeJSON('categories.json', $categories)) {
        echo json_encode(['success' => true, 'message' => 'Category updated']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Category not found or failed to update']);
    }
}
// DELETE - Delete category
elseif ($method === 'DELETE' && $action === 'delete') {
    requireAuth();
    
    $id = intval($_GET['id'] ?? 0);
    
    if (!$id) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Category ID required']);
        exit;
    }
    
    // Check if category is used by any gallery items
    $items = readJSON('gallery_items.json');
    $isUsed = false;
    foreach ($items as $item) {
        if ($item['category_id'] == $id) {
            $isUsed = true;
            break;
        }
    }
    
    if ($isUsed) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Cannot delete category: it is being used by gallery items']);
        exit;
    }
    
    $categories = readJSON('categories.json');
    $newCategories = array_filter($categories, function($cat) use ($id) {
        return $cat['id'] != $id;
    });
    
    $newCategories = array_values($newCategories); // Re-index array
    
    ob_end_clean();
    if (writeJSON('categories.json', $newCategories)) {
        echo json_encode(['success' => true, 'message' => 'Category deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete category']);
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

