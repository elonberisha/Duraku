<?php
/**
 * File Upload API
 * Handles image uploads for gallery
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Custom error handler to prevent any output
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Log error but don't output anything
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true; // Suppress default error handler
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
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

ob_clean();

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    ob_end_flush();
    exit;
}

// Upload directory (already created in storage.php)
$uploadDir = UPLOAD_DIR;

// Allowed file types
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 10 * 1024 * 1024; // 10MB

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded or upload error']);
        ob_end_flush();
        exit;
    }
    
    $file = $_FILES['image'];
    
    // Check file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only images are allowed.']);
        ob_end_flush();
        exit;
    }
    
    // Check file size
    if ($file['size'] > $maxFileSize) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'File too large. Maximum size is 10MB.']);
        ob_end_flush();
        exit;
    }
    
    // Generate unique filename (sanitize extension)
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    // Whitelist allowed extensions
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($extension, $allowedExtensions)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file extension. Only images are allowed.']);
        ob_end_flush();
        exit;
    }
    $filename = uniqid('gallery_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Return relative URL
        $url = 'uploads/gallery/' . $filename;
        ob_end_clean();
        echo json_encode([
            'success' => true,
            'url' => $url,
            'filename' => $filename
        ]);
        ob_end_flush();
    } else {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        ob_end_flush();
    }
} else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    ob_end_flush();
}

