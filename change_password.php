<?php
/**
 * Quick script to change admin password (JSON-based)
 * Run this once to set a new password, then delete this file for security
 */

require_once 'config/storage.php';

// Set your new password here
$newPassword = 'your_new_secure_password_here';
$username = 'admin';

if ($newPassword === 'your_new_secure_password_here') {
    die('Please set a new password in this file first!');
}

try {
    $users = readJSON('admin_users.json');
    $found = false;
    
    foreach ($users as &$user) {
        if ($user['username'] === $username) {
            $user['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            $found = true;
            break;
        }
    }
    
    if ($found && writeJSON('admin_users.json', $users)) {
        echo "Password changed successfully for user: $username\n";
        echo "\nIMPORTANT: Delete this file (change_password.php) after use!\n";
    } else {
        echo "Error: User not found or failed to update password.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

