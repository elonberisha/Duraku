# 📋 Guida e Plotë për Deployment dhe Optimizim të Projektit

## 🎯 Përmbledhje

Ky dokument përmban të gjitha hapat që duhet të ndiqni për të përgatitur projektin tuaj për production, me domain dhe optimizim maksimal.

---

## 📝 HAPET PËR DEPLOYMENT

### 1. ✅ Përgatitja e Domain-it

#### A. Blerja e Domain-it
- [ ] Blini domain: `durakubeschichtung.de`
- [ ] Verifikoni ownership në registrar (GoDaddy, Namecheap, etj.)
- [ ] Aktivizoni SSL Certificate (HTTPS) - **OBLIGATIVE!**

#### B. Konfigurimi i DNS
- [ ] Vendosni A Record që tregon në IP-në e serverit tuaj
- [ ] Vendosni CNAME për www: `www.durakubeschichtung.de` → `durakubeschichtung.de`
- [ ] Vendosni MX Records nëse përdorni email custom
- [ ] Pritni 24-48 orë për DNS propagation

#### C. SSL Certificate (HTTPS)
- [ ] Instaloni Let's Encrypt (falas) ose SSL Certificate tjetër
- [ ] Konfiguroni redirect nga HTTP në HTTPS
- [ ] Verifikoni që të gjitha faqet funksionojnë me HTTPS

---

### 2. 🔧 Konfigurimi i Serverit

#### A. Kërkesat e Serverit
- [ ] PHP 7.4+ (ose 8.0+ për performance më të mirë)
- [ ] Apache me mod_rewrite enabled
- [ ] MySQL (opsionale, nuk përdoret në këtë projekt)
- [ ] Composer (për PHPMailer)
- [ ] File permissions të sakta (755 për folders, 644 për files)

#### B. File Permissions
```bash
# Në server, ekzekutoni:
chmod 755 data/
chmod 755 uploads/
chmod 755 uploads/gallery/
chmod 644 data/*.json
chmod 644 uploads/gallery/*
```

#### C. PHP Extensions
Sigurohuni që këto extensions janë aktivizuar:
- [ ] `json`
- [ ] `session`
- [ ] `fileinfo`
- [ ] `mbstring`
- [ ] `openssl`
- [ ] `curl`

---

### 3. 📁 Upload i Skedarëve

#### A. Skedarët që duhen uploaduar:
```
/
├── index.html
├── about.html
├── services.html
├── gallery.html
├── contact.html
├── admin/
│   ├── index.html
│   ├── admin.js
│   └── admin.css
├── api/
│   ├── *.php (të gjitha API files)
├── config/
│   ├── smtp.php
│   ├── security.php
│   └── storage.php
├── data/
│   ├── *.json (të gjitha JSON files)
├── uploads/
│   └── gallery/
│       └── *.jpg (të gjitha fotot)
├── *.js (të gjitha JavaScript files)
├── styles.css
├── i18n.js
├── robots.txt
├── sitemap.xml
├── .htaccess
└── composer.json
```

#### B. Skedarët që NUK duhen uploaduar:
- [ ] `vendor/` (do të instalohet në server me Composer)
- [ ] `composer.lock` (do të krijohet në server)
- [ ] `.git/` (nëse përdorni Git)
- [ ] `*.md` (dokumentacioni, opsionale)

---

### 4. 🔐 Konfigurimi i Sigurisë

#### A. Përditësimi i URLs në Meta Tags
Në të gjitha faqet HTML, zëvendësoni:
```html
<!-- Nga: -->
https://www.durakubeschichtung.de/

<!-- Në: -->
https://www.durakubeschichtung.de/ (ose domain-in tuaj real)
```

**Faqet që duhen përditësuar:**
- [ ] `index.html` - Canonical, OG tags, Structured Data
- [ ] `about.html` - Canonical, OG tags
- [ ] `services.html` - Canonical, OG tags, Structured Data
- [ ] `gallery.html` - Canonical, OG tags
- [ ] `contact.html` - Canonical, OG tags, Structured Data

#### B. Përditësimi i robots.txt
```txt
# Zëvendësoni:
Sitemap: https://www.durakubeschichtung.de/sitemap.xml

# Me domain-in tuaj real
```

#### C. Përditësimi i sitemap.xml
```xml
<!-- Zëvendësoni të gjitha: -->
https://www.durakubeschichtung.de/

<!-- Me domain-in tuaj real -->
```

#### D. Konfigurimi i SMTP
Në `config/smtp.php`, përditësoni:
```php
define('SMTP_USERNAME', 'elonberisha1999@gmail.com'); // Email juaj
define('SMTP_PASSWORD', 'gaeljivemwmoacxr'); // App Password
define('SMTP_FROM_EMAIL', 'elonberisha1999@gmail.com'); // Email për contact form
```

**Nëse përdorni email custom (p.sh. info@durakubeschichtung.de):**
- [ ] Konfiguroni SMTP settings për email-in tuaj custom
- [ ] Përditësoni `SMTP_FROM_EMAIL` në email-in tuaj custom

---

### 5. 📦 Instalimi i Dependencies

#### Në server, ekzekutoni:
```bash
cd /path/to/your/project
composer install
```

Kjo do të instalojë:
- [ ] PHPMailer 7.0+

---

### 6. ⚙️ Konfigurimi i .htaccess

#### A. Verifikoni që .htaccess është aktiv
- [ ] Apache `mod_rewrite` është enabled
- [ ] `.htaccess` është në root directory
- [ ] Apache lejon `.htaccess` files

#### B. Përditësimi i .htaccess për Production
Shtoni në fund të `.htaccess`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Force www (opsionale)
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

### 7. 🗺️ Konfigurimi i Sitemap

#### A. Përditësimi i sitemap.xml
- [ ] Zëvendësoni të gjitha URLs me domain-in tuaj real
- [ ] Përditësoni `lastmod` dates me datën e sotme
- [ ] Verifikoni që të gjitha faqet janë të listuara

#### B. Submit në Google Search Console
- [ ] Krijoni account në [Google Search Console](https://search.google.com/search-console)
- [ ] Verifikoni domain-in tuaj
- [ ] Submit sitemap: `https://www.durakubeschichtung.de/sitemap.xml`
- [ ] Submit robots.txt: `https://www.durakubeschichtung.de/robots.txt`

---

### 8. 🔍 Optimizimi për Google

#### A. Google My Business
- [ ] Krijoni Google My Business profile
- [ ] Shtoni informacionin e biznesit
- [ ] Shtoni fotot
- [ ] Verifikoni biznesin

#### B. Google Analytics (Opsionale)
- [ ] Krijoni Google Analytics account
- [ ] Shtoni tracking code në `<head>` të të gjitha faqeve
- [ ] Konfiguroni goals dhe conversions

#### C. Google Tag Manager (Opsionale)
- [ ] Krijoni GTM account
- [ ] Shtoni GTM code në faqet

---

### 9. 📱 Optimizimi i Performance

#### A. Image Optimization
- [ ] Kompresoni të gjitha fotot (përdorni TinyPNG ose ImageOptim)
- [ ] Konvertoni në WebP format (për browser-a që e mbështesin)
- [ ] Shtoni lazy loading për imazhet

#### B. CSS/JS Minification (Opsionale)
- [ ] Minifikoni CSS dhe JS files
- [ ] Ose përdorni CDN për fonts dhe icons

#### C. Caching
- [ ] Aktivizoni browser caching në `.htaccess`:
```apache
# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### 10. 🧪 Testimi Para Deployment

#### A. Testi Lokal
- [ ] Testoni të gjitha faqet në localhost
- [ ] Testoni admin panel login
- [ ] Testoni contact form
- [ ] Testoni gallery upload
- [ ] Testoni language switching
- [ ] Testoni në mobile devices

#### B. Testi në Server (Para Public)
- [ ] Testoni të gjitha faqet në server
- [ ] Testoni HTTPS
- [ ] Testoni email sending
- [ ] Testoni file uploads
- [ ] Testoni admin panel
- [ ] Testoni në mobile devices

---

### 11. 🚀 Deployment Final

#### A. Upload i Skedarëve
- [ ] Uploadoni të gjitha skedarët në server (përdorni FTP/SFTP)
- [ ] Verifikoni file permissions
- [ ] Instaloni dependencies me Composer

#### B. Konfigurimi Final
- [ ] Përditësoni URLs në meta tags
- [ ] Përditësoni SMTP settings
- [ ] Përditësoni sitemap.xml
- [ ] Përditësoni robots.txt

#### C. Verifikimi
- [ ] Hapni faqen në browser: `https://www.durakubeschichtung.de`
- [ ] Verifikoni HTTPS (green lock)
- [ ] Testoni të gjitha funksionalitetet
- [ ] Kontrolloni në Google Search Console

---

### 12. 📊 Monitoring dhe Maintenance

#### A. Backup
- [ ] Konfiguroni backup automatik për:
  - `data/*.json` (të dhënat)
  - `uploads/gallery/*` (fotot)
  - Database (nëse përdorni në të ardhmen)

#### B. Monitoring
- [ ] Monitoroni uptime (përdorni UptimeRobot ose Pingdom)
- [ ] Monitoroni error logs
- [ ] Monitoroni performance

#### C. Updates
- [ ] Përditësoni PHP version kur është e nevojshme
- [ ] Përditësoni Composer dependencies
- [ ] Përditësoni content-in e faqes

---

## 🔧 KONFIGURIMET E DETAJUARA

### 1. SMTP Configuration (`config/smtp.php`)

```php
// Për Gmail (aktualisht)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
define('SMTP_USERNAME', 'elonberisha1999@gmail.com');
define('SMTP_PASSWORD', 'gaeljivemwmoacxr');
define('SMTP_FROM_EMAIL', 'elonberisha1999@gmail.com');

// Për email custom (p.sh. info@durakubeschichtung.de)
// Kontaktoni hosting provider-in tuaj për SMTP settings
```

### 2. Security Configuration (`config/security.php`)

Për production, në `config/security.php`, linja 56:
```php
// Nga:
$allowedOrigin = '*';

// Në:
$allowedOrigin = 'https://www.durakubeschichtung.de';
// Ose për multiple domains:
$allowedOrigins = [
    'https://www.durakubeschichtung.de',
    'https://durakubeschichtung.de'
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    $allowedOrigin = $_SERVER['HTTP_ORIGIN'];
}
```

### 3. .htaccess Configuration

Shtoni në fund të `.htaccess`:
```apache
# Force HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 1 day"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## 📋 CHECKLIST FINAL

### Para Deployment:
- [ ] Domain është blerë dhe konfiguruar
- [ ] SSL Certificate është instaluar
- [ ] Server është i gatshëm (PHP, Apache, extensions)
- [ ] Të gjitha skedarët janë uploaduar
- [ ] Composer dependencies janë instaluar
- [ ] File permissions janë të sakta
- [ ] URLs janë përditësuar në meta tags
- [ ] SMTP settings janë konfiguruar
- [ ] sitemap.xml është përditësuar
- [ ] robots.txt është përditësuar
- [ ] .htaccess është konfiguruar
- [ ] Të gjitha faqet janë testuar

### Pas Deployment:
- [ ] Faqja funksionon me HTTPS
- [ ] Të gjitha faqet ngarkohen saktë
- [ ] Admin panel funksionon
- [ ] Contact form dërgon email
- [ ] Gallery upload funksionon
- [ ] Language switching funksionon
- [ ] Mobile responsive funksionon
- [ ] Google Search Console është konfiguruar
- [ ] Sitemap është submituar
- [ ] Backup është konfiguruar

---

## 🆘 PROBLEME TË ZAKONSHME

### 1. "403 Forbidden" Error
**Zgjidhje:**
- Kontrolloni file permissions (755 për folders, 644 për files)
- Kontrolloni .htaccess për rules që bllokojnë access

### 2. "500 Internal Server Error"
**Zgjidhje:**
- Kontrolloni PHP error logs
- Kontrolloni .htaccess për syntax errors
- Kontrolloni file permissions

### 3. Email nuk dërgohet
**Zgjidhje:**
- Kontrolloni SMTP settings
- Kontrolloni që PHPMailer është instaluar
- Kontrolloni firewall settings në server

### 4. Images nuk shfaqen
**Zgjidhje:**
- Kontrolloni file permissions për uploads/
- Kontrolloni paths në database/JSON files
- Kontrolloni .htaccess për rules që bllokojnë images

### 5. HTTPS nuk funksionon
**Zgjidhje:**
- Verifikoni që SSL Certificate është instaluar
- Kontrolloni .htaccess për HTTPS redirect
- Kontrolloni server configuration

---

## 📞 KONTAKT PËR NDIHMË

Nëse keni probleme me deployment:
1. Kontrolloni error logs në server
2. Kontrolloni dokumentacionin e hosting provider-it
3. Kontaktoni hosting support

---

## ✅ PËRFUNDIM

Pas ndjekjes së këtyre hapave, projekti juaj do të jetë:
- ✅ I gatshëm për production
- ✅ I optimizuar për SEO
- ✅ I sigurt (HTTPS, security headers)
- ✅ I shpejtë (caching, compression)
- ✅ I optimizuar për mobile
- ✅ I gatshëm për Google indexing

**Suksese me deployment-in! 🚀**

