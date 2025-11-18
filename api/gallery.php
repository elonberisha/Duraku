<?php
/**
 * Gallery API
 * Handles CRUD operations for gallery items (JSON-based, no database)
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
    exit;
}

setSecureSession();
header('Content-Type: application/json; charset=utf-8');

ob_clean();

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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($allowedOrigin !== '*') {
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// Check authentication for write operations
function requireAuth() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - List all gallery items or by category
if ($method === 'GET' && $action === 'list') {
    $category = $_GET['category'] ?? 'all';
    
    $items = readJSON('gallery_items.json');
    $categories = readJSON('categories.json');
    
    // Create category lookup
    $categoryLookup = [];
    foreach ($categories as $cat) {
        $categoryLookup[$cat['id']] = $cat;
    }
    
    // Add category names to items
    foreach ($items as &$item) {
        if (isset($categoryLookup[$item['category_id']])) {
            $item['category_name_sq'] = $categoryLookup[$item['category_id']]['name_sq'];
            $item['category_name_de'] = $categoryLookup[$item['category_id']]['name_de'];
        }
    }
    
    // Filter by category if needed
    if ($category !== 'all') {
        $items = array_filter($items, function($item) use ($category) {
            return $item['category_id'] == $category;
        });
        $items = array_values($items); // Re-index array
    }
    
    // Sort by created_at DESC
    usort($items, function($a, $b) {
        $timeA = strtotime($a['created_at'] ?? '1970-01-01');
        $timeB = strtotime($b['created_at'] ?? '1970-01-01');
        return $timeB - $timeA;
    });
    
    echo json_encode(['success' => true, 'data' => $items]);
}
// GET - Get single item
elseif ($method === 'GET' && $action === 'get') {
    $id = intval($_GET['id'] ?? 0);
    
    $items = readJSON('gallery_items.json');
    $categories = readJSON('categories.json');
    
    $item = null;
    foreach ($items as $it) {
        if ($it['id'] == $id) {
            $item = $it;
            break;
        }
    }
    
    if ($item) {
        // Add category names
        foreach ($categories as $cat) {
            if ($cat['id'] == $item['category_id']) {
                $item['category_name_sq'] = $cat['name_sq'];
                $item['category_name_de'] = $cat['name_de'];
                break;
            }
        }
        echo json_encode(['success' => true, 'data' => $item]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
    }
}
// GET - Get categories
elseif ($method === 'GET' && $action === 'categories') {
    $categories = readJSON('categories.json');
    echo json_encode(['success' => true, 'data' => $categories]);
}
// POST - Create new gallery item
elseif ($method === 'POST' && $action === 'create') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['category_id']) || !isset($data['name']) || 
        !isset($data['before_image']) || !isset($data['after_image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $items = readJSON('gallery_items.json');
    
    // Validate and sanitize inputs
    $category_id = validateId($data['category_id'] ?? 0);
    if (!$category_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid category ID required']);
        exit;
    }
    
    $name = sanitizeInput($data['name'] ?? '', 255);
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }
    
    // Validate image paths (should be relative paths from uploads/)
    $before_image = sanitizeInput($data['before_image'] ?? '', 500);
    $after_image = sanitizeInput($data['after_image'] ?? '', 500);
    
    if (empty($before_image) || empty($after_image)) {
        http_response_code(400);
        echo json_encode(['error' => 'Both before and after images are required']);
        exit;
    }
    
    // Ensure image paths are safe (only allow uploads/ directory)
    if (strpos($before_image, 'uploads/') !== 0 || strpos($after_image, 'uploads/') !== 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid image path']);
        exit;
    }
    
    $newItem = [
        'id' => getNextId('gallery_items.json'),
        'category_id' => $category_id,
        'name' => $name,
        'description' => sanitizeText($data['description'] ?? '', 2000),
        'before_image' => $before_image,
        'after_image' => $after_image,
        'comment' => sanitizeText($data['comment'] ?? '', 1000),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $items[] = $newItem;
    
    if (writeJSON('gallery_items.json', $items)) {
        echo json_encode(['success' => true, 'id' => $newItem['id'], 'message' => 'Gallery item created']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save item']);
    }
}
// PUT - Update gallery item
elseif ($method === 'PUT' && $action === 'update') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($_GET['id'] ?? 0);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Item ID required']);
        exit;
    }
    
    $items = readJSON('gallery_items.json');
    $found = false;
    
    // Validate and sanitize inputs
    $category_id = validateId($data['category_id'] ?? 0);
    if (!$category_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid category ID required']);
        exit;
    }
    
    $name = sanitizeInput($data['name'] ?? '', 255);
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }
    
    // Validate image paths
    $before_image = sanitizeInput($data['before_image'] ?? '', 500);
    $after_image = sanitizeInput($data['after_image'] ?? '', 500);
    
    if (empty($before_image) || empty($after_image)) {
        http_response_code(400);
        echo json_encode(['error' => 'Both before and after images are required']);
        exit;
    }
    
    // Ensure image paths are safe
    if (strpos($before_image, 'uploads/') !== 0 || strpos($after_image, 'uploads/') !== 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid image path']);
        exit;
    }
    
    foreach ($items as &$item) {
        if ($item['id'] == $id) {
            $item['category_id'] = $category_id;
            $item['name'] = $name;
            $item['description'] = sanitizeText($data['description'] ?? '', 2000);
            $item['before_image'] = $before_image;
            $item['after_image'] = $after_image;
            $item['comment'] = sanitizeText($data['comment'] ?? '', 1000);
            $item['updated_at'] = date('Y-m-d H:i:s');
            $found = true;
            break;
        }
    }
    
    if ($found && writeJSON('gallery_items.json', $items)) {
        echo json_encode(['success' => true, 'message' => 'Gallery item updated']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found or failed to update']);
    }
}
// DELETE - Delete gallery item
elseif ($method === 'DELETE' && $action === 'delete') {
    requireAuth();
    
    $id = intval($_GET['id'] ?? 0);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Item ID required']);
        exit;
    }
    
    $items = readJSON('gallery_items.json');
    $newItems = array_filter($items, function($item) use ($id) {
        return $item['id'] != $id;
    });
    
    $newItems = array_values($newItems); // Re-index array
    
    if (writeJSON('gallery_items.json', $newItems)) {
        echo json_encode(['success' => true, 'message' => 'Gallery item deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete item']);
    }
}
// If no action matches, return error
else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action or method']);
}

// Clean output buffer and send response
ob_end_flush();

