# Duraku Gallery - Pa Bazë të Dhënave

Sistemi përdor skedarë JSON në vend të bazës së të dhënave. E thjeshtë dhe e lehtë për instalim!

## Instalimi

### 1. Krijoni Direktoritë

Sistemi do t'i krijojë automatikisht, por mund t'i krijoni manualisht:

```bash
mkdir -p data
mkdir -p uploads/gallery
chmod 755 data
chmod 755 uploads/gallery
```

### 2. Sigurohuni që PHP ka të drejta shkrimi

Direktoritë `data/` dhe `uploads/gallery/` duhet të kenë të drejta shkrimi për PHP.

### 3. Gjithçka tjetër është automatik!

Kur hapni admin panel për herë të parë, sistemi do të krijojë automatikisht:
- `data/admin_users.json` - Përdoruesit e admin
- `data/categories.json` - Kategoritë
- `data/gallery_items.json` - Fotot e galerisë

## Kredencialet e Paracaktuara

- **Username:** `admin`
- **Password:** `admin123`

**IMPORTANTE:** Ndryshoni fjalëkalimin pas instalimit!

## Ndryshimi i Fjalëkalimit

Hapni `data/admin_users.json` dhe zëvendësoni `password_hash` me:

```php
<?php
echo password_hash('your_new_password', PASSWORD_DEFAULT);
?>
```

Ose përdorni `change_password.php` (modifikojeni fillimisht).

## Struktura e Skedarëve

```
Duraku/
├── data/                    # Skedarët JSON (krijohen automatikisht)
│   ├── admin_users.json     # Përdoruesit e admin
│   ├── categories.json      # Kategoritë
│   └── gallery_items.json   # Fotot e galerisë
├── uploads/
│   └── gallery/             # Fotot e uploaduara
├── config/
│   └── storage.php          # Sistemi i ruajtjes JSON
└── api/                     # API endpoints
```

## Avantazhet e Sistemit pa Bazë të Dhënave

✅ **E thjeshtë** - Nuk ka nevojë për MySQL/MariaDB  
✅ **Portable** - Mund të kopjoni lehtësisht skedarët  
✅ **Backup i lehtë** - Thjesht kopjoni direktorinë `data/`  
✅ **Nuk kërkon konfigurim** - Funksionon menjëherë  
✅ **I shpejtë** - Për projekte të vogla/mesatare  

## Kufizimet

⚠️ **Jo i përshtatshëm për:**  
- Projekte me shumë përdorues (1000+)  
- Aplikacione me shumë trafik  
- Kur kërkohet ACID compliance  

✅ **I përshtatshëm për:**  
- Galeri fotosh  
- Admin panel të thjeshtë  
- Projekte të vogla/mesatare  

## Backup

Për backup, thjesht kopjoni direktorinë `data/`:

```bash
cp -r data/ backup_data_$(date +%Y%m%d)/
```

## Restaurimi

Për restaurim, thjesht zëvendësoni `data/` me backup-in tuaj.

## Siguria

1. **Mbroni direktorinë `data/`** - Shtoni në `.htaccess`:
   ```apache
   <FilesMatch "\.json$">
       Order allow,deny
       Deny from all
   </FilesMatch>
   ```

2. **Ndryshoni fjalëkalimin** pas instalimit

3. **Përdorni HTTPS** në production

4. **Kufizoni aksesin** te `admin/` dhe `api/` në production

## Troubleshooting

### Skedarët nuk krijohen

- Kontrolloni që PHP ka të drejta shkrimi në direktorinë `data/`
- Kontrolloni `chmod 755 data`

### Upload nuk funksionon

- Kontrolloni që `uploads/gallery/` ka të drejta shkrimi
- Kontrolloni `upload_max_filesize` në php.ini

### Session nuk funksionon

- Kontrolloni që session directory ka të drejta shkrimi
- Kontrolloni `session.save_path` në php.ini

## Përdorimi

Identik me versionin me bazë të dhënave:

1. Hapni `http://localhost/your-project/admin/`
2. Hyni me kredencialet e admin
3. Shtoni, modifikoni ose fshini fotot

Gjithçka tjetër funksionon njësoj!

