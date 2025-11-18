# 🔧 Ndryshimet që Duhen Bërë në Kod për Deployment

## ⚠️ E RËNDËSISHME: Lexoni këtë dokument para deployment!

Ky dokument përmban **të gjitha ndryshimet** që duhet të bëni në kod para se të vendosni projektin në server.

---

## 📝 1. NDRYSHIMET NË HTML FILES

### A. Përditësimi i URLs në Meta Tags

#### `index.html` - Linjat 20-25, 28-41
**Nga:**
```html
<link rel="canonical" href="https://www.durakubeschichtung.de/">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Në:**
```html
<!-- Zëvendësoni me domain-in tuaj real -->
<link rel="canonical" href="https://www.durakubeschichtung.de/">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Structured Data - Linjat 48-83:**
```json
{
  "url": "https://www.durakubeschichtung.de",  // ← Ndrysho këtu
  "logo": "https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg",  // ← Ndrysho këtu
  "image": "https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg"  // ← Ndrysho këtu
}
```

#### `about.html` - Linjat 17, 20-21, 25, 28, 33, 36
**Nga:**
```html
<link rel="canonical" href="https://www.durakubeschichtung.de/about.html">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/about.html">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/about.html?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/about.html">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/about.html">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Në:** Zëvendësoni me domain-in tuaj real

#### `services.html` - Linjat 17, 20-21, 25, 28, 33, 36
**Nga:**
```html
<link rel="canonical" href="https://www.durakubeschichtung.de/services.html">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/services.html">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/services.html?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/services.html">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/services.html">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Në:** Zëvendësoni me domain-in tuaj real

**Structured Data - Linjat 42-83:**
```json
{
  "url": "https://www.durakubeschichtung.de/services.html"  // ← Ndrysho këtu
}
```

#### `gallery.html` - Linjat 17, 20-21, 25, 28, 33, 36
**Nga:**
```html
<link rel="canonical" href="https://www.durakubeschichtung.de/gallery.html">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/gallery.html">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/gallery.html?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/gallery.html">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/gallery.html">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Në:** Zëvendësoni me domain-in tuaj real

#### `contact.html` - Linjat 17, 20-21, 25, 28, 33, 36, 48
**Nga:**
```html
<link rel="canonical" href="https://www.durakubeschichtung.de/contact.html">
<link rel="alternate" hreflang="de" href="https://www.durakubeschichtung.de/contact.html">
<link rel="alternate" hreflang="sq" href="https://www.durakubeschichtung.de/contact.html?lang=sq">
<meta property="og:url" content="https://www.durakubeschichtung.de/contact.html">
<meta property="og:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
<meta property="twitter:url" content="https://www.durakubeschichtung.de/contact.html">
<meta property="twitter:image" content="https://www.durakubeschichtung.de/uploads/gallery/hero-page.jpg">
```

**Në:** Zëvendësoni me domain-in tuaj real

**Structured Data - Linjat 42-50:**
```json
{
  "url": "https://www.durakubeschichtung.de/contact.html"  // ← Ndrysho këtu
}
```

---

## 📝 2. NDRYSHIMET NË CONFIG FILES

### A. `config/security.php` - Linja 56

**Nga:**
```php
$allowedOrigin = '*';
```

**Në (Production):**
```php
// Për një domain:
$allowedOrigin = 'https://www.durakubeschichtung.de';

// Ose për multiple domains:
$allowedOrigins = [
    'https://www.durakubeschichtung.de',
    'https://durakubeschichtung.de'
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    $allowedOrigin = $_SERVER['HTTP_ORIGIN'];
} else {
    $allowedOrigin = 'https://www.durakubeschichtung.de'; // Default
}
```

**⚠️ E RËNDËSISHME:** Kjo ndryshim është për siguri. Në development, mund të lini `*`, por në production duhet të specifikoni domain-in tuaj.

---

### B. `config/smtp.php` - Linjat 11-13

**Nga:**
```php
define('SMTP_USERNAME', 'elonberisha1999@gmail.com');
define('SMTP_PASSWORD', 'gaeljivemwmoacxr');
define('SMTP_FROM_EMAIL', 'elonberisha1999@gmail.com');
```

**Në:**
```php
// Nëse përdorni Gmail (si tani):
define('SMTP_USERNAME', 'elonberisha1999@gmail.com'); // Email juaj
define('SMTP_PASSWORD', 'gaeljivemwmoacxr'); // App Password (jo fjalëkalimi i rregullt)
define('SMTP_FROM_EMAIL', 'elonberisha1999@gmail.com'); // Email për contact form

// Nëse përdorni email custom (p.sh. info@durakubeschichtung.de):
// Kontaktoni hosting provider-in tuaj për SMTP settings
// P.sh.:
// define('SMTP_HOST', 'smtp.durakubeschichtung.de');
// define('SMTP_PORT', 587);
// define('SMTP_USERNAME', 'info@durakubeschichtung.de');
// define('SMTP_PASSWORD', 'password-juaj');
// define('SMTP_FROM_EMAIL', 'info@durakubeschichtung.de');
```

**⚠️ E RËNDËSISHME:** 
- Për Gmail, duhet të përdorni **App Password**, jo fjalëkalimin e rregullt
- Për email custom, kontaktoni hosting provider-in tuaj për SMTP settings

---

## 📝 3. NDRYSHIMET NË ROBOTS.TXT

### `robots.txt` - Linja 30

**Nga:**
```
Sitemap: https://www.durakubeschichtung.de/sitemap.xml
```

**Në:**
```
Sitemap: https://www.durakubeschichtung.de/sitemap.xml
# Zëvendësoni me domain-in tuaj real
```

---

## 📝 4. NDRYSHIMET NË SITEMAP.XML

### `sitemap.xml` - Të gjitha URLs

**Nga:**
```xml
<loc>https://www.durakubeschichtung.de/</loc>
<loc>https://www.durakubeschichtung.de/about.html</loc>
<loc>https://www.durakubeschichtung.de/services.html</loc>
<loc>https://www.durakubeschichtung.de/gallery.html</loc>
<loc>https://www.durakubeschichtung.de/contact.html</loc>
```

**Në:** Zëvendësoni të gjitha `https://www.durakubeschichtung.de` me domain-in tuaj real

**Gjithashtu përditësoni:**
```xml
<lastmod>2025-01-27</lastmod>  <!-- Ndrysho me datën e sotme -->
```

---

## 📝 5. NDRYSHIMET NË .HTACCESS

### `.htaccess` - HTTPS Redirect

**Tashmë është shtuar në fund:**
```apache
# Force HTTPS (Production)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

**⚠️ E RËNDËSISHME:** 
- Kjo do të redirectojë automatikisht nga HTTP në HTTPS
- Sigurohuni që SSL Certificate është instaluar para se të aktivizoni këtë

---

## 📝 6. NDRYSHIMET NË JAVASCRIPT FILES (Nëse ka nevojë)

### A. `admin/admin.js` - API_BASE

**Kontrolloni nëse ka hardcoded URLs:**
```javascript
// Nëse ka:
const API_BASE = 'http://localhost/api';

// Ndrysho në:
const API_BASE = 'api'; // Ose relative path
```

### B. `*-api.js` files

**Kontrolloni nëse ka hardcoded URLs:**
```javascript
// Nëse ka:
const API_BASE = 'http://localhost/api';

// Ndrysho në:
// Përdorni window.API_BASE || 'api' (si tani)
```

---

## 📝 7. CHECKLIST I PLOTË

### Para Deployment:

- [ ] **index.html** - URLs në meta tags (linjat 20-41, 48-83)
- [ ] **about.html** - URLs në meta tags (linjat 17, 20-21, 25, 28, 33, 36)
- [ ] **services.html** - URLs në meta tags (linjat 17, 20-21, 25, 28, 33, 36, 42-83)
- [ ] **gallery.html** - URLs në meta tags (linjat 17, 20-21, 25, 28, 33, 36)
- [ ] **contact.html** - URLs në meta tags (linjat 17, 20-21, 25, 28, 33, 36, 48)
- [ ] **config/security.php** - CORS origin (linja 56)
- [ ] **config/smtp.php** - SMTP settings (linjat 11-13)
- [ ] **robots.txt** - Sitemap URL (linja 30)
- [ ] **sitemap.xml** - Të gjitha URLs dhe lastmod dates
- [ ] **.htaccess** - HTTPS redirect (tashmë është shtuar)

### Pas Deployment:

- [ ] Testoni që të gjitha URLs funksionojnë
- [ ] Testoni HTTPS redirect
- [ ] Testoni email sending
- [ ] Testoni admin panel
- [ ] Testoni contact form
- [ ] Testoni gallery upload

---

## 🔍 SI TË GJENI TË GJITHA URLS

### Metoda 1: Search në të gjitha files
```bash
# Në terminal (nëse përdorni Linux/Mac):
grep -r "durakubeschichtung.de" .

# Ose përdorni Find & Replace në editor-in tuaj
```

### Metoda 2: Manual Search
Hapni çdo file dhe kërkoni për:
- `https://www.durakubeschichtung.de`
- `durakubeschichtung.de`
- `localhost`
- `127.0.0.1`

---

## 📋 TEMPLATE PËR FIND & REPLACE

### Nëse përdorni Find & Replace në editor:

**Find:**
```
https://www.durakubeschichtung.de
```

**Replace with:**
```
https://www.durakubeschichtung.de
```
(Zëvendësoni me domain-in tuaj real)

**Files to search in:**
- `*.html`
- `*.xml`
- `*.txt`
- `*.php` (vetëm në config files)

---

## ⚠️ PARAQITJE TË RËNDËSISHME

### 1. **Mos harroni të përditësoni Structured Data (JSON-LD)**
- `index.html` - LocalBusiness schema
- `services.html` - Service schema
- `contact.html` - ContactPage schema

### 2. **Mos harroni të përditësoni hreflang tags**
- Të gjitha faqet kanë hreflang tags që duhen përditësuar

### 3. **Mos harroni të përditësoni sitemap.xml**
- Të gjitha URLs dhe lastmod dates

### 4. **Testoni para deployment**
- Testoni në localhost me domain name simulation
- Ose testoni në staging server

---

## 🚀 PAS DEPLOYMENT

### Verifikoni:
1. [ ] Të gjitha faqet ngarkohen me HTTPS
2. [ ] Meta tags shfaqen saktë në social media (përdorni [Facebook Debugger](https://developers.facebook.com/tools/debug/))
3. [ ] Structured Data është valid (përdorni [Google Rich Results Test](https://search.google.com/test/rich-results))
4. [ ] Sitemap është accessible: `https://www.durakubeschichtung.de/sitemap.xml`
5. [ ] Robots.txt është accessible: `https://www.durakubeschichtung.de/robots.txt`

---

## 📞 NDIHMË

Nëse keni probleme:
1. Kontrolloni që të gjitha URLs janë përditësuar
2. Kontrolloni që SSL Certificate është instaluar
3. Kontrolloni file permissions
4. Kontrolloni error logs në server

---

## ✅ PËRFUNDIM

Pas ndjekjes së këtyre hapave, projekti juaj do të jetë i gatshëm për production!

**Suksese! 🚀**

