# 🔐 Konfigurimi i Admin Panel për Subdomain

## 📋 Përmbledhje

Admin panel tani është konfiguruar që të jetë i aksesueshëm **VETËM** përmes subdomain-it `admin.durakubeschichtung.de`.

## 🚀 Hapat për Konfigurim

### 1. Konfigurimi i DNS

Në DNS settings të domain-it tuaj, shtoni:

```
Type: A Record
Name: admin
Value: [IP e serverit tuaj]
TTL: 3600 (ose default)
```

Ose nëse përdorni CNAME:

```
Type: CNAME
Name: admin
Value: durakubeschichtung.de
TTL: 3600
```

### 2. Konfigurimi i Serverit

#### A. Nëse përdorni Apache me Virtual Hosts:

Krijoni një Virtual Host për subdomain-in admin:

```apache
<VirtualHost *:80>
    ServerName admin.durakubeschichtung.de
    DocumentRoot /path/to/your/project/admin
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName admin.durakubeschichtung.de
    DocumentRoot /path/to/your/project/admin
    
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    
    # Allow access to admin files
    <Directory "/path/to/your/project/admin">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### B. Nëse përdorni cPanel ose hosting panel:

1. Shkoni te **Subdomains**
2. Krijoni subdomain: `admin`
3. Point to: `/admin` directory (ose root directory nëse admin files janë në root)
4. Aktivizoni SSL për subdomain-in

### 3. Struktura e Skedarëve

Nëse admin panel do të jetë në subdomain, ju mund të zgjidhni një nga këto opsione:

#### Opsioni A: Admin files në root të subdomain-it (RECOMMENDED)
```
admin.durakubeschichtung.de/
├── index.html
├── admin.js
├── admin.css
└── .htaccess
```

#### Opsioni B: Admin files në `/admin/` directory
```
durakubeschichtung.de/
├── admin/
│   ├── index.html
│   ├── admin.js
│   ├── admin.css
│   └── .htaccess
```

**Në këtë rast, kodi është konfiguruar për të funksionuar me Opsionin B** (admin files në `/admin/` directory).

### 4. Konfigurimi i .htaccess

#### A. Në root directory (durakubeschichtung.de):

`.htaccess` tashmë është konfiguruar për të bllokuar aksesin në `/admin/` nëse nuk vjen nga subdomain-i admin.

#### B. Në admin directory (nëse përdorni Opsionin A):

Krijoni një `.htaccess` në admin directory:

```apache
# Allow access only from admin subdomain
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Allow if from admin subdomain
    RewriteCond %{HTTP_HOST} ^admin\. [NC,OR]
    RewriteCond %{HTTP_HOST} ^admin$ [NC]
    RewriteRule ^ - [L]
    
    # Block all other access
    RewriteRule ^ - [F,L]
</IfModule>
```

### 5. CORS Configuration

Nëse admin panel është në subdomain dhe API është në domain kryesor, duhet të konfiguroni CORS në API files.

Kodi tashmë përmban CORS headers që lejojnë cross-origin requests, por sigurohuni që në `config/security.php`:

```php
header('Access-Control-Allow-Origin: https://admin.durakubeschichtung.de');
header('Access-Control-Allow-Credentials: true');
```

### 6. Testimi

1. **Testoni që `/admin/` është bllokuar në domain kryesor:**
   - Shkoni te: `https://durakubeschichtung.de/admin/`
   - Duhet të merrni 403 Forbidden

2. **Testoni që admin panel funksionon në subdomain:**
   - Shkoni te: `https://admin.durakubeschichtung.de/`
   - Duhet të shfaqet login screen

3. **Testoni API calls:**
   - Hapni browser console në admin panel
   - Verifikoni që API calls funksionojnë
   - Nëse ka CORS errors, përditësoni CORS headers në API files

## 🔒 Siguria

### Përfitimet e Subdomain Approach:

1. **Izolim më i mirë:** Admin panel është i izoluar nga website-i kryesor
2. **Siguri më e lartë:** Më e vështirë për attackers të gjejnë admin panel
3. **SSL i veçantë:** Mund të keni SSL certificate të veçantë për admin
4. **Rate limiting i veçantë:** Mund të konfiguroni rate limiting të veçantë për admin subdomain

### Rekomandime shtesë:

1. **IP Whitelisting (Opsionale):**
   ```apache
   # Në .htaccess të admin subdomain
   <RequireAll>
       Require ip YOUR_IP_ADDRESS
       Require ip YOUR_OFFICE_IP
   </RequireAll>
   ```

2. **Two-Factor Authentication:**
   - Tashmë është implementuar në admin panel
   - Aktivizoni 2FA për të gjithë admin users

3. **Strong Passwords:**
   - Përdorni password të fortë për admin accounts
   - Ndryshoni password-in default

## 📝 Ndryshimet e Bëra

1. ✅ `.htaccess` - Bllokon aksesin në `/admin/` nëse nuk vjen nga subdomain-i admin
2. ✅ `admin/admin.js` - Përditësuar API_BASE për të funksionuar me subdomain
3. ✅ `admin/admin.js` - Përditësuar image paths për të funksionuar me subdomain
4. ✅ `admin/index.html` - Përditësuar favicon dhe CSS paths për absolute URLs

## ⚠️ Shënime të Rëndësishme

1. **Nëse nuk konfiguroni subdomain-in, admin panel NUK do të funksionojë!**
2. **Sigurohuni që SSL certificate përfshin edhe subdomain-in admin**
3. **Testoni të gjitha funksionalitetet pas konfigurimit të subdomain-it**

## 🆘 Troubleshooting

### Problemi: "403 Forbidden" kur hyni në admin subdomain
**Zgjidhje:**
- Kontrolloni file permissions (755 për directories, 644 për files)
- Kontrolloni .htaccess për rules që bllokojnë aksesin
- Kontrolloni Virtual Host configuration

### Problemi: "CORS Error" në browser console
**Zgjidhje:**
- Përditësoni CORS headers në API files
- Sigurohuni që `Access-Control-Allow-Origin` përfshin admin subdomain
- Kontrolloni që `credentials: 'same-origin'` është në fetch calls

### Problemi: "Images nuk shfaqen"
**Zgjidhje:**
- Kontrolloni që image paths përdorin absolute URLs
- Verifikoni që uploads/ directory është accessible nga subdomain

---

**Pas konfigurimit të subdomain-it, admin panel do të jetë i aksesueshëm VETËM në `https://admin.durakubeschichtung.de`** 🔐

