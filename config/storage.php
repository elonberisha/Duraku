<?php
/**
 * JSON-based Storage System
 * Replaces database with JSON file storage
 */

define('DATA_DIR', __DIR__ . '/../data/');
define('UPLOAD_DIR', __DIR__ . '/../uploads/gallery/');

// Ensure data directory exists
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Ensure upload directory exists
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Read JSON file
 */
function readJSON($filename) {
    $filepath = DATA_DIR . $filename;
    if (!file_exists($filepath)) {
        return [];
    }
    $content = file_get_contents($filepath);
    return json_decode($content, true) ?: [];
}

/**
 * Write JSON file
 */
function writeJSON($filename, $data) {
    $filepath = DATA_DIR . $filename;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($filepath, $json) !== false;
}

/**
 * Get next ID for a collection
 */
function getNextId($filename) {
    $data = readJSON($filename);
    if (empty($data)) {
        return 1;
    }
    $maxId = 0;
    foreach ($data as $item) {
        if (isset($item['id']) && $item['id'] > $maxId) {
            $maxId = $item['id'];
        }
    }
    return $maxId + 1;
}

/**
 * Initialize default data if files don't exist
 */
function initializeData() {
    // Initialize admin users
    if (!file_exists(DATA_DIR . 'admin_users.json')) {
        $adminUsers = [
            [
                'id' => 1,
                'username' => 'admin',
                'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
                'email' => 'admin@duraku.com',
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
        writeJSON('admin_users.json', $adminUsers);
    }
    
    // Initialize categories
    if (!file_exists(DATA_DIR . 'categories.json')) {
        $categories = [
            [
                'id' => 1,
                'name_sq' => 'Dyshet Industriale',
                'name_de' => 'Industrieböden',
                'description_sq' => 'Veshje dhe restaurim i dysheveve industriale për qëndrueshmëri dhe ngarkesë maksimale.',
                'description_de' => 'Beschichtung und Sanierung von Industrieböden für maximale Haltbarkeit und Belastbarkeit.',
                'created_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => 2,
                'name_sq' => 'Parkingje & Garazhe Nëntokësore',
                'name_de' => 'Parkhäuser & Tiefgaragen',
                'description_sq' => 'Veshje të specializuara për parkingje dhe garazhe nëntokësore me mbrojtje optimale.',
                'description_de' => 'Spezialisierte Beschichtungen für Parkhäuser und Tiefgaragen mit optimalem Schutz gegen Wasser und Verschleiß.',
                'created_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => 3,
                'name_sq' => 'Veshje të Të Gjitha Llojeve',
                'name_de' => 'Beschichtung aller Art',
                'description_sq' => 'Veshje profesionale për të gjitha kërkesat - nga epoksi deri te poliuretani.',
                'description_de' => 'Professionelle Beschichtungen für alle Anforderungen - von Epoxidharz bis Polyurethan.',
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
        writeJSON('categories.json', $categories);
    }
    
    // Initialize gallery items (empty)
    if (!file_exists(DATA_DIR . 'gallery_items.json')) {
        writeJSON('gallery_items.json', []);
    }
    
    // Initialize hero section (empty)
    if (!file_exists(DATA_DIR . 'hero_section.json')) {
        writeJSON('hero_section.json', []);
    }
    
    // Initialize about section (empty)
    if (!file_exists(DATA_DIR . 'about_section.json')) {
        writeJSON('about_section.json', []);
    }
}

// Auto-initialize on first load
initializeData();

