<?php
/**
 * Forget Password API
 * Handles password reset via email code
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering to catch any unwanted output
ob_start();

setSecureSession();

// Set headers before any output
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Clear any output that might have been generated
ob_clean();

require_once '../config/storage.php';
require_once '../config/smtp.php';
require_once '../config/security.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// POST - Send reset code
if ($method === 'POST' && $action === 'send') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Username required']);
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
        // Don't reveal if user exists for security
        ob_end_clean();
        echo json_encode([
            'success' => true,
            'message' => 'If the username exists, a reset code has been sent to the registered email.'
        ]);
        exit;
    }
    
    // Generate 6-digit reset code
    $resetCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    
    // Store reset code in session (valid for 10 minutes)
    $_SESSION['reset_code'] = $resetCode;
    $_SESSION['reset_username'] = $username;
    $_SESSION['reset_code_expires'] = time() + (10 * 60); // 10 minutes
    
    // Get user email - prefer two_factor_email if exists, otherwise use email
    $userEmail = $user['two_factor_email'] ?? $user['email'] ?? '';
    
    // If still empty, use the SMTP email as fallback
    if (empty($userEmail)) {
        require_once '../config/smtp.php';
        $userEmail = SMTP_FROM_EMAIL;
    }
    
    if (empty($userEmail)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'No email registered for this account']);
        exit;
    }
    
    // Send email with reset code
    $subject = 'Password Reset Code - Duraku Admin Panel';
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code-box { background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .warning { color: #d32f2f; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password for the Duraku Admin Panel.</p>
            <p>Your password reset code is:</p>
            <div class='code-box'>{$resetCode}</div>
            <p class='warning'>This code will expire in 10 minutes.</p>
            <p>If you did not request this reset, please ignore this email.</p>
            <hr>
            <p style='font-size: 12px; color: #666;'>This is an automated message. Please do not reply.</p>
        </div>
    </body>
    </html>
    ";
    
    ob_end_clean();
    
    // Try to send email
    $emailResult = sendEmail($userEmail, $subject, $message, true);
    
    if ($emailResult === true) {
        echo json_encode([
            'success' => true,
            'message' => 'Reset code has been sent to your email address.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send reset code. Please try again later.']);
    }
}
// POST - Reset password with code
elseif ($method === 'POST' && $action === 'reset') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['code']) || !isset($data['new_password'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Reset code and new password required']);
        exit;
    }
    
    $code = trim($data['code']);
    $newPassword = $data['new_password'];
    $username = $_SESSION['reset_username'] ?? '';
    
    // Validate code
    if (!isset($_SESSION['reset_code']) || $_SESSION['reset_code'] !== $code) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired reset code']);
        exit;
    }
    
    // Check expiration
    if (!isset($_SESSION['reset_code_expires']) || time() > $_SESSION['reset_code_expires']) {
        unset($_SESSION['reset_code']);
        unset($_SESSION['reset_username']);
        unset($_SESSION['reset_code_expires']);
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Reset code has expired. Please request a new one.']);
        exit;
    }
    
    // Validate new password
    if (strlen($newPassword) < 6) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 6 characters']);
        exit;
    }
    
    // Update password
    $users = readJSON('admin_users.json');
    $userFound = false;
    
    foreach ($users as &$user) {
        if ($user['username'] === $username) {
            $user['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            $user['updated_at'] = date('Y-m-d H:i:s');
            $userFound = true;
            break;
        }
    }
    
    ob_end_clean();
    
    if ($userFound && writeJSON('admin_users.json', $users)) {
        // Clear reset session
        unset($_SESSION['reset_code']);
        unset($_SESSION['reset_username']);
        unset($_SESSION['reset_code_expires']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Password has been reset successfully. You can now login with your new password.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to reset password']);
    }
}
else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

