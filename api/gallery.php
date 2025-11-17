<?php
/**
 * Gallery API
 * Handles CRUD operations for gallery items (JSON-based, no database)
 */

session_start();
header('Content-Type: application/json');
require_once '../config/storage.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
    
    $newItem = [
        'id' => getNextId('gallery_items.json'),
        'category_id' => intval($data['category_id']),
        'name' => $data['name'],
        'description' => $data['description'] ?? '',
        'before_image' => $data['before_image'],
        'after_image' => $data['after_image'],
        'comment' => $data['comment'] ?? '',
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
    
    foreach ($items as &$item) {
        if ($item['id'] == $id) {
            $item['category_id'] = intval($data['category_id']);
            $item['name'] = $data['name'];
            $item['description'] = $data['description'] ?? '';
            $item['before_image'] = $data['before_image'];
            $item['after_image'] = $data['after_image'];
            $item['comment'] = $data['comment'] ?? '';
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
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

