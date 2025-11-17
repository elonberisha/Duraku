<?php
/**
 * SMTP Configuration for Gmail
 * Configure your Gmail SMTP settings here
 */

define('SMTP_ENABLED', true);
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls'); // 'tls' or 'ssl'
define('SMTP_USERNAME', 'elonberisha1999@gmail.com'); // Your Gmail address
define('SMTP_PASSWORD', 'gaeljivemwmoacxr'); // Gmail App Password (not regular password)
define('SMTP_FROM_EMAIL', 'elonberisha1999@gmail.com'); // Email where contact forms will be sent
define('SMTP_FROM_NAME', 'Duraku Admin Panel');

/**
 * Send email using SMTP
 */
function sendEmail($to, $subject, $message, $isHTML = true) {
    if (!SMTP_ENABLED) {
        error_log("SMTP is disabled. Email not sent to: $to");
        return false;
    }
    
    // Use PHPMailer if available, otherwise use mail()
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        return sendEmailWithPHPMailer($to, $subject, $message, $isHTML);
    } else {
        // Try to use PHPMailer from vendor directory
        $phpmailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
        if (file_exists($phpmailerPath)) {
            require_once $phpmailerPath;
            require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
            require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
            
            if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                return sendEmailWithPHPMailer($to, $subject, $message, $isHTML);
            }
        }
        
        // Fallback to basic mail() function (may not work on localhost)
        $headers = [];
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: " . ($isHTML ? "text/html" : "text/plain") . "; charset=UTF-8";
        $headers[] = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM_EMAIL . ">";
        $headers[] = "Reply-To: " . SMTP_FROM_EMAIL;
        
        $result = @mail($to, $subject, $message, implode("\r\n", $headers));
        
        if (!$result) {
            error_log("PHP mail() function failed for: $to");
        }
        
        return $result;
    }
}

/**
 * Send email using PHPMailer (recommended)
 */
function sendEmailWithPHPMailer($to, $subject, $message, $isHTML = true) {
    try {
        // Try to load PHPMailer
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            // Try autoload first (Composer autoload)
            $autoloadPath = __DIR__ . '/../vendor/autoload.php';
            if (file_exists($autoloadPath)) {
                require_once $autoloadPath;
            } else {
                // Manual load if autoload doesn't exist
                $phpmailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
                if (file_exists($phpmailerPath)) {
                    require_once $phpmailerPath;
                    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
                    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
                } else {
                    error_log("PHPMailer not found. Please install via: composer require phpmailer/phpmailer");
                    return false;
                }
            }
            
            // Check again if class exists after loading
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                error_log("PHPMailer class still not found after loading");
                return false;
            }
        }
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        $mail->SMTPDebug = 0; // Set to 2 for verbose debugging
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer Debug: $str");
        };
        
        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to);
        
        // Content
        $mail->isHTML($isHTML);
        $mail->Subject = $subject;
        $mail->Body = $message;
        
        $mail->send();
        error_log("Email sent successfully to: $to");
        return true;
    } catch (Exception $e) {
        $errorMsg = "Email sending failed: " . $mail->ErrorInfo . " | Exception: " . $e->getMessage();
        error_log($errorMsg);
        return false;
    }
}

/**
 * Generate 6-digit verification code
 */
function generateVerificationCode() {
    return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

