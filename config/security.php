<?php
/**
 * Security Functions
 * Common security utilities for the application
 */

/**
 * Sanitize string input
 */
function sanitizeInput($input, $maxLength = 1000) {
    if (!is_string($input)) {
        return '';
    }
    $input = trim($input);
    if (strlen($input) > $maxLength) {
        $input = substr($input, 0, $maxLength);
    }
    return $input;
}

/**
 * Sanitize text input (allows more characters)
 */
function sanitizeText($input, $maxLength = 5000) {
    if (!is_string($input)) {
        return '';
    }
    $input = trim($input);
    if (strlen($input) > $maxLength) {
        $input = substr($input, 0, $maxLength);
    }
    return $input;
}

/**
 * Validate and sanitize email
 */
function validateEmail($email) {
    $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
}

/**
 * Validate integer ID
 */
function validateId($id) {
    $id = filter_var($id, FILTER_VALIDATE_INT);
    return ($id !== false && $id > 0) ? $id : false;
}

/**
 * Set secure CORS headers
 */
function setSecureCORSHeaders() {
    // Get allowed origin from config or use same origin
    $allowedOrigin = '*';
    
    // For production, validate origin against whitelist (includes admin subdomain)
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
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($allowedOrigin !== '*') {
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Max-Age: 86400');
}

/**
 * Set secure session configuration
 */
function setSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Set session save path if needed (for better security)
        $sessionPath = __DIR__ . '/../data/sessions';
        if (!file_exists($sessionPath)) {
            @mkdir($sessionPath, 0755, true);
        }
        if (is_writable($sessionPath)) {
            ini_set('session.save_path', $sessionPath);
        }
        
        // Secure session settings
        ini_set('session.cookie_httponly', 1);
        // Only use secure cookies in production (HTTPS), not on localhost
        $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' && 
                    !in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']);
        ini_set('session.cookie_secure', $isSecure ? 1 : 0);
        ini_set('session.use_strict_mode', 1);
        
        // Set cookie domain for cross-subdomain sharing (only in production)
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $isLocalhost = in_array($host, ['localhost', '127.0.0.1']) || strpos($host, 'localhost') !== false;
        
        // Always set cookie domain for production to allow cross-subdomain sharing
        if ($isSecure && !$isLocalhost && strpos($host, '.') !== false) {
            // Extract root domain (e.g., durakubeschichtung.de from admin.durakubeschichtung.de or durakubeschichtung.de)
            $parts = explode('.', $host);
            if (count($parts) >= 2) {
                // Get last two parts (domain.tld)
                $rootDomain = '.' . implode('.', array_slice($parts, -2));
                ini_set('session.cookie_domain', $rootDomain);
            }
        }
        
        // For cross-subdomain, always use None with Secure for production
        // This allows cookies to be shared between admin.durakubeschichtung.de and durakubeschichtung.de
        if ($isSecure && !$isLocalhost && strpos($host, '.') !== false) {
            // Always use None for cross-subdomain cookie sharing in production
            ini_set('session.cookie_samesite', 'None');
        } else {
            // Use Lax for localhost
            ini_set('session.cookie_samesite', 'Lax');
        }
        
        session_start();
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Regenerate every 30 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

/**
 * Rate limiting for login attempts
 */
function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 300) {
    $rateLimitFile = __DIR__ . '/../data/rate_limit.json';
    $rateLimits = [];
    
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }
    
    $now = time();
    $key = md5($identifier);
    
    // Clean old entries
    foreach ($rateLimits as $k => $data) {
        if ($now - $data['first_attempt'] > $timeWindow) {
            unset($rateLimits[$k]);
        }
    }
    
    // Check current attempts
    if (isset($rateLimits[$key])) {
        if ($now - $rateLimits[$key]['first_attempt'] < $timeWindow) {
            if ($rateLimits[$key]['attempts'] >= $maxAttempts) {
                return false; // Rate limit exceeded
            }
            $rateLimits[$key]['attempts']++;
        } else {
            // Reset after time window
            $rateLimits[$key] = ['attempts' => 1, 'first_attempt' => $now];
        }
    } else {
        $rateLimits[$key] = ['attempts' => 1, 'first_attempt' => $now];
    }
    
    // Save rate limits
    file_put_contents($rateLimitFile, json_encode($rateLimits, JSON_PRETTY_PRINT));
    
    return true; // Allowed
}

/**
 * Clear rate limit for identifier
 */
function clearRateLimit($identifier) {
    $rateLimitFile = __DIR__ . '/../data/rate_limit.json';
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?: [];
        $key = md5($identifier);
        unset($rateLimits[$key]);
        file_put_contents($rateLimitFile, json_encode($rateLimits, JSON_PRETTY_PRINT));
    }
}

