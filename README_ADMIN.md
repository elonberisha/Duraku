# Duraku Gallery Admin Panel

Sistemi i plotë i menaxhimit të galerisë me backend PHP dhe admin panel.

## Karakteristika

- ✅ Galeri fullscreen me navigim (para/pas me shigjeta ose swipe)
- ✅ Admin panel për menaxhimin e fotove
- ✅ Upload fotosh në galeri
- ✅ Menaxhim kategorish
- ✅ Komente dhe emra për fotot
- ✅ Backend PHP me MySQL
- ✅ API RESTful për të gjitha operacionet

## Instalimi

### 1. Krijimi i Bazës së të Dhënave

Hapni MySQL dhe ekzekutoni skedarin `database.sql`:

```bash
mysql -u root -p < database.sql
```

Ose importojeni përmes phpMyAdmin.

### 2. Konfigurimi i Bazës së të Dhënave

Hapni `config/database.php` dhe përditësoni kredencialet:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'duraku_gallery');
define('DB_USER', 'root');
define('DB_PASS', ''); // Vendosni fjalëkalimin tuaj
```

### 3. Krijimi i Direktorive për Upload

Krijoni direktorinë për upload:

```bash
mkdir -p uploads/gallery
chmod 755 uploads/gallery
```

### 4. Kredencialet e Admin

Kredencialet e paracaktuara:
- **Username:** `admin`
- **Password:** `admin123`

**IMPORTANTE:** Ndryshoni fjalëkalimin pas instalimit!

Për të ndryshuar fjalëkalimin, ekzekutoni në MySQL:

```sql
UPDATE admin_users 
SET password_hash = '$2y$10$...' 
WHERE username = 'admin';
```

Ose përdorni PHP:

```php
$newPassword = password_hash('your_new_password', PASSWORD_DEFAULT);
```

## Përdorimi

### Hyrja në Admin Panel

1. Shkoni te: `http://localhost/your-project/admin/`
2. Hyni me kredencialet e admin
3. Shtoni, modifikoni ose fshini fotot nga galeria

### API Endpoints

#### Authentication
- `POST /api/auth.php?action=login` - Login
- `POST /api/auth.php?action=logout` - Logout
- `GET /api/auth.php?action=check` - Kontrollo statusin e login

#### Gallery
- `GET /api/gallery.php?action=list&category=all` - Listo të gjitha fotot
- `GET /api/gallery.php?action=get&id=1` - Merr një foto
- `GET /api/gallery.php?action=categories` - Merr kategoritë
- `POST /api/gallery.php?action=create` - Krijo foto të re
- `PUT /api/gallery.php?action=update&id=1` - Përditëso foto
- `DELETE /api/gallery.php?action=delete&id=1` - Fshi foto

#### Upload
- `POST /api/upload.php` - Upload foto

### Integrimi me Galerinë Ekzistuese

Për të integruar API-n me galerinë ekzistuese, mund të përdorni `gallery-api.js`:

```html
<script src="gallery-api.js"></script>
```

Ky skedar do të ngarkojë automatikisht fotot nga API dhe do t'i shfaqë në galeri.

## Struktura e Projektit

```
Duraku/
├── admin/
│   ├── index.html          # Admin panel
│   ├── admin.css          # Stilet e admin panel
│   └── admin.js           # Logjika e admin panel
├── api/
│   ├── auth.php           # API për autentifikim
│   ├── gallery.php        # API për galeri
│   └── upload.php          # API për upload
├── config/
│   └── database.php        # Konfigurimi i bazës së të dhënave
├── uploads/
│   └── gallery/           # Fotot e uploaduara
├── database.sql           # Skema e bazës së të dhënave
└── README_ADMIN.md        # Ky dokument
```

## Siguria

1. **Ndryshoni fjalëkalimin e admin** pas instalimit
2. **Kufizoni aksesin** te `admin/` dhe `api/` në production
3. **Përdorni HTTPS** në production
4. **Validoni inputet** përpara se t'i ruani në database
5. **Përdorni prepared statements** (tashmë e implementuar)

## Troubleshooting

### Problemet e Upload

- Sigurohuni që `uploads/gallery/` ka të drejta shkrimi (chmod 755)
- Kontrolloni `upload_max_filesize` dhe `post_max_size` në php.ini

### Problemet e Bazës së të Dhënave

- Kontrolloni kredencialet në `config/database.php`
- Sigurohuni që MySQL është duke punuar
- Kontrolloni që baza e të dhënave është krijuar

### Problemet e Session

- Sigurohuni që session directory ka të drejta shkrimi
- Kontrolloni `session.save_path` në php.ini

## Mbështetje

Për pyetje ose probleme, kontaktoni zhvilluesin.

