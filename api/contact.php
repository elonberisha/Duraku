<?php
/**
 * Contact Form API
 * Handles contact form submissions and sends emails via SMTP
 */

// Disable error display and set error handler
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering to catch any unwanted output
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Clear any output that might have been generated
ob_clean();

require_once '../config/smtp.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get form data
$data = json_decode(file_get_contents('php://input'), true);

// If JSON decode failed, try form data
if (!$data) {
    $data = $_POST;
}

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and message are required']);
    exit;
}

$name = trim($data['name']);
$email = trim($data['email']);
$phone = trim($data['phone'] ?? '');
$message = trim($data['message']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Get recipient email from SMTP config (the admin email)
$recipientEmail = SMTP_FROM_EMAIL; // Send to the configured SMTP email

// Create email subject
$subject = 'New Contact Form Submission - Duraku Website';

// Create email message
$emailMessage = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #d32f2f; }
        .field-value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #d32f2f; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='field-label'>Name:</div>
                <div class='field-value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='field-label'>Email:</div>
                <div class='field-value'>{$email}</div>
            </div>
            " . ($phone ? "
            <div class='field'>
                <div class='field-label'>Phone:</div>
                <div class='field-value'>{$phone}</div>
            </div>
            " : "") . "
            <div class='field'>
                <div class='field-label'>Message:</div>
                <div class='field-value'>" . nl2br(htmlspecialchars($message)) . "</div>
            </div>
        </div>
        <div style='margin-top: 20px; padding: 10px; text-align: center; color: #666; font-size: 12px;'>
            This email was sent from the Duraku website contact form.
        </div>
    </div>
</body>
</html>
";

// Send email
ob_end_clean();

if (sendEmail($recipientEmail, $subject, $emailMessage, true)) {
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent successfully. We will get back to you soon!'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please try again later.']);
}

