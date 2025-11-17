<?php
/**
 * Authentication API
 * Handles login and session management (JSON-based, no database)
 */

session_start();
header('Content-Type: application/json');
require_once '../config/storage.php';

// CORS headers (adjust for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }
    
    $username = trim($data['username']);
    $password = $data['password'];
    
    $users = readJSON('admin_users.json');
    $user = null;
    
    foreach ($users as $u) {
        if ($u['username'] === $username) {
            $user = $u;
            break;
        }
    }
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Check if 2FA is enabled
        if (isset($user['two_factor_enabled']) && $user['two_factor_enabled'] === true) {
            // Don't log in yet - require 2FA
            $_SESSION['2fa_pending_user_id'] = $user['id'];
            $_SESSION['2fa_pending_username'] = $user['username'];
            
            echo json_encode([
                'success' => true,
                'requires_2fa' => true,
                'message' => '2FA verification required'
            ]);
        } else {
            // Normal login without 2FA
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['admin_logged_in'] = true;
            
            echo json_encode([
                'success' => true,
                'requires_2fa' => false,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'] ?? ''
                ]
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
    }
} elseif ($method === 'POST' && $action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
} elseif ($method === 'GET' && $action === 'check') {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        echo json_encode([
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['admin_id'],
                'username' => $_SESSION['admin_username']
            ]
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

