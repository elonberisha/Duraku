<?php
/**
 * Two-Factor Authentication API
 * Handles 2FA setup, code generation, and verification
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

// Start output buffering to catch any unwanted output
ob_start();

try {
    require_once '../config/storage.php';
    require_once '../config/smtp.php';
    require_once '../config/security.php';
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    ob_end_flush();
    exit;
}

setSecureSession();

// Set headers before any output
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Clear any output that might have been generated
ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Get 2FA settings
if ($method === 'GET' && $action === 'settings') {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        ob_end_flush();
        exit;
    }
    
    $userId = $_SESSION['admin_id'];
    $users = readJSON('admin_users.json');
    
    foreach ($users as $user) {
        if ($user['id'] == $userId) {
            ob_end_clean();
            echo json_encode([
                'success' => true,
                'enabled' => isset($user['two_factor_enabled']) && $user['two_factor_enabled'] === true,
                'email' => $user['two_factor_email'] ?? $user['email'] ?? ''
            ]);
            ob_end_flush();
            exit;
        }
    }
    
    ob_end_clean();
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    ob_end_flush();
}
// POST - Update 2FA settings
elseif ($method === 'POST' && $action === 'update') {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        ob_end_flush();
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['admin_id'];
    
    $users = readJSON('admin_users.json');
    $userFound = false;
    
    foreach ($users as &$user) {
        if ($user['id'] == $userId) {
            $user['two_factor_enabled'] = isset($data['enabled']) && $data['enabled'] === true;
            if (isset($data['email']) && !empty($data['email'])) {
                $user['two_factor_email'] = $data['email'];
            }
            $user['updated_at'] = date('Y-m-d H:i:s');
            $userFound = true;
            break;
        }
    }
    
    ob_end_clean();
    
    if ($userFound && writeJSON('admin_users.json', $users)) {
        echo json_encode(['success' => true, 'message' => '2FA settings updated']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update settings']);
    }
    ob_end_flush();
}
// POST - Send verification code (during login)
elseif ($method === 'POST' && $action === 'send-code') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Username required']);
        ob_end_flush();
        exit;
    }
    
    $username = trim($data['username']);
    $users = readJSON('admin_users.json');
    $user = null;
    
    foreach ($users as $u) {
        if ($u['username'] === $username) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        ob_end_clean();
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        ob_end_flush();
        exit;
    }
    
    // Check if 2FA is enabled
    if (!isset($user['two_factor_enabled']) || $user['two_factor_enabled'] !== true) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => '2FA is not enabled for this user']);
        ob_end_flush();
        exit;
    }
    
    // Check if user has pending login
    if (!isset($_SESSION['2fa_pending_user_id']) || $_SESSION['2fa_pending_user_id'] != $user['id']) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'No pending login found']);
        ob_end_flush();
        exit;
    }
    
    // Generate verification code
    $code = generateVerificationCode();
    $expiresAt = time() + (10 * 60); // 10 minutes
    
    // Store code in session
    $_SESSION['2fa_code'] = $code;
    $_SESSION['2fa_code_expires'] = $expiresAt;
    $_SESSION['2fa_user_id'] = $user['id'];
    
    // Get email for 2FA
    $email = $user['two_factor_email'] ?? $user['email'] ?? '';
    
    if (empty($email)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'No email configured for 2FA']);
        ob_end_flush();
        exit;
    }
    
    // Send email
    $subject = 'Your 2FA Verification Code - Duraku Admin';
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 5px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Two-Factor Authentication Code</h2>
            <p>Your verification code is:</p>
            <div class='code'>{$code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </body>
    </html>
    ";
    
    ob_end_clean();
    
    if (sendEmail($email, $subject, $message, true)) {
        echo json_encode(['success' => true, 'message' => 'Verification code sent to your email']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send verification code']);
    }
    ob_end_flush();
}
// POST - Verify code
elseif ($method === 'POST' && $action === 'verify') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['code'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Verification code required']);
        ob_end_flush();
        exit;
    }
    
    $code = trim($data['code']);
    
    // Check if code exists and is not expired
    if (!isset($_SESSION['2fa_code']) || !isset($_SESSION['2fa_code_expires'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'No verification code found. Please request a new code.']);
        ob_end_flush();
        exit;
    }
    
    if (time() > $_SESSION['2fa_code_expires']) {
        unset($_SESSION['2fa_code']);
        unset($_SESSION['2fa_code_expires']);
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Verification code has expired. Please request a new code.']);
        ob_end_flush();
        exit;
    }
    
    if ($_SESSION['2fa_code'] !== $code) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Invalid verification code']);
        ob_end_flush();
        exit;
    }
    
    // Code is valid - complete login
    $userId = $_SESSION['2fa_user_id'];
    $users = readJSON('admin_users.json');
    
    foreach ($users as $user) {
        if ($user['id'] == $userId) {
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['admin_logged_in'] = true;
            
            // Clear 2FA session data
            unset($_SESSION['2fa_code']);
            unset($_SESSION['2fa_code_expires']);
            unset($_SESSION['2fa_user_id']);
            unset($_SESSION['2fa_pending_user_id']);
            unset($_SESSION['2fa_pending_username']);
            
            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Verification successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
            ob_end_flush();
            exit;
        }
    }
    
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['error' => 'User not found']);
    ob_end_flush();
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

