<?php
/**
 * Password Management API
 * Handles password changes
 */

setSecureSession();
header('Content-Type: application/json');
require_once '../config/storage.php';
require_once '../config/security.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'change') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['current_password']) || !isset($data['new_password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Current password and new password required']);
        exit;
    }
    
    $currentPassword = $data['current_password'];
    $newPassword = $data['new_password'];
    $userId = $_SESSION['admin_id'];
    
    // Validate new password
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 6 characters']);
        exit;
    }
    
    $users = readJSON('admin_users.json');
    $userFound = false;
    
    foreach ($users as &$user) {
        if ($user['id'] == $userId) {
            // Verify current password
            if (!password_verify($currentPassword, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Current password is incorrect']);
                exit;
            }
            
            // Update password
            $user['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            $user['updated_at'] = date('Y-m-d H:i:s');
            $userFound = true;
            break;
        }
    }
    
    if ($userFound && writeJSON('admin_users.json', $users)) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to change password']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

