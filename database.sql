-- Database schema for Duraku Gallery Admin Panel
-- Create database
CREATE DATABASE IF NOT EXISTS duraku_gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE duraku_gallery;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery categories table
CREATE TABLE IF NOT EXISTS gallery_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_sq VARCHAR(100) NOT NULL,
    name_de VARCHAR(100) NOT NULL,
    description_sq TEXT,
    description_de TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    before_image VARCHAR(500) NOT NULL,
    after_image VARCHAR(500) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES gallery_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using password_hash() with PASSWORD_DEFAULT
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@duraku.com');

-- Insert default categories
INSERT INTO gallery_categories (name_sq, name_de, description_sq, description_de) VALUES
('Dyshet Industriale', 'Industrieböden', 
 'Veshje dhe restaurim i dysheveve industriale për qëndrueshmëri dhe ngarkesë maksimale.', 
 'Beschichtung und Sanierung von Industrieböden für maximale Haltbarkeit und Belastbarkeit.'),
('Parkingje & Garazhe Nëntokësore', 'Parkhäuser & Tiefgaragen',
 'Veshje të specializuara për parkingje dhe garazhe nëntokësore me mbrojtje optimale.',
 'Spezialisierte Beschichtungen für Parkhäuser und Tiefgaragen mit optimalem Schutz gegen Wasser und Verschleiß.'),
('Veshje të Të Gjitha Llojeve', 'Beschichtung aller Art',
 'Veshje profesionale për të gjitha kërkesat - nga epoksi deri te poliuretani.',
 'Professionelle Beschichtungen für alle Anforderungen - von Epoxidharz bis Polyurethan.');

