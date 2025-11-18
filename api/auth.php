<?php
/**
 * Authentication API
 * Handles login and session management (JSON-based, no database)
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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($allowedOrigin !== '*') {
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        ob_end_flush();
        exit;
    }
    
    // Sanitize username
    $username = sanitizeInput($data['username'], 50);
    $password = $data['password'];
    
    // Rate limiting
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!checkRateLimit($username . '_' . $clientIp, 5, 300)) {
        ob_end_clean();
        http_response_code(429);
        echo json_encode(['error' => 'Too many login attempts. Please try again later.']);
        ob_end_flush();
        exit;
    }
    
    $users = readJSON('admin_users.json');
    $user = null;
    
    foreach ($users as $u) {
        if ($u['username'] === $username) {
            $user = $u;
            break;
        }
    }
    
    if ($user && password_verify($password, $user['password_hash'])) {
        ob_end_clean();
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
            
            // Debug: Log session info after login
            error_log('Login successful - Session ID: ' . session_id());
            error_log('Login successful - Cookie domain: ' . ini_get('session.cookie_domain'));
            error_log('Login successful - Cookie samesite: ' . ini_get('session.cookie_samesite'));
            error_log('Login successful - Cookie secure: ' . ini_get('session.cookie_secure'));
            error_log('Login successful - HTTP_HOST: ' . ($_SERVER['HTTP_HOST'] ?? 'not set'));
            error_log('Login successful - HTTP_ORIGIN: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'not set'));
            error_log('Login successful - Session keys after write: ' . (isset($_SESSION) ? implode(', ', array_keys($_SESSION)) : 'no session'));
            error_log('Login successful - admin_logged_in value: ' . (isset($_SESSION['admin_logged_in']) ? ($_SESSION['admin_logged_in'] ? 'true' : 'false') : 'not set'));
            
            echo json_encode([
                'success' => true,
                'requires_2fa' => false,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'] ?? ''
                ],
                'debug' => [
                    'session_id' => session_id(),
                    'cookie_domain' => ini_get('session.cookie_domain'),
                    'cookie_samesite' => ini_get('session.cookie_samesite'),
                    'cookie_secure' => ini_get('session.cookie_secure'),
                    'http_host' => $_SERVER['HTTP_HOST'] ?? 'not set',
                    'http_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'not set'
                ]
            ]);
        }
        ob_end_flush();
    } else {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        ob_end_flush();
    }
} elseif ($method === 'POST' && $action === 'logout') {
    ob_end_clean();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    ob_end_flush();
    exit;
} elseif ($method === 'GET' && $action === 'check') {
    ob_end_clean();
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
    ob_end_flush();
    exit;
} else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

