# 2FA dhe Ndryshimi i Fjalëkalimit - Udhëzime

## Konfigurimi i Gmail SMTP

### 1. Krijoni Gmail App Password

1. Shkoni te [Google Account Settings](https://myaccount.google.com/)
2. Zgjidhni **Security** (Siguria)
3. Aktivizoni **2-Step Verification** nëse nuk është aktivizuar
4. Shkoni te **App passwords** (Fjalëkalime për aplikacione)
5. Krijoni një App Password për "Mail"
6. Kopjoni fjalëkalimin e krijuar (16 karaktere)

### 2. Konfiguroni SMTP

Hapni `config/smtp.php` dhe përditësoni:

```php
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-16-char-app-password'); // App Password, jo fjalëkalimi i rregullt
define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
define('SMTP_FROM_NAME', 'Duraku Admin Panel');
```

### 3. Opsionale: Instaloni PHPMailer (Rekomanduar)

Për funksionim më të mirë, instaloni PHPMailer:

```bash
composer require phpmailer/phpmailer
```

Ose shkarkoni manualisht dhe vendoseni në `vendor/` directory.

## Përdorimi

### Ndryshimi i Fjalëkalimit

1. Hyni në admin panel
2. Shkoni te **Settings**
3. Në seksionin **Change Password**:
   - Vendosni fjalëkalimin aktual
   - Vendosni fjalëkalimin e ri (minimum 6 karaktere)
   - Konfirmoni fjalëkalimin e ri
4. Klikoni **Change Password**

### Aktivizimi i 2FA

1. Shkoni te **Settings**
2. Në seksionin **Two-Factor Authentication**:
   - Aktivizoni checkbox-in "Enable 2FA for this account"
   - Vendosni email-in ku dëshironi të merrni kodet e verifikimit
3. Klikoni **Save 2FA Settings**

### Login me 2FA

Kur 2FA është aktivizuar:

1. Hyni me username dhe password si zakonisht
2. Një kod verifikimi 6-shifror do t'ju dërgohet në email
3. Vendosni kodin në modal-in që hapet
4. Klikoni **Verify**

**Shënim:** Kodi skadon pas 10 minutash. Mund të klikoni **Resend Code** për të dërguar një kod të ri.

## Troubleshooting

### Email nuk dërgohet

1. **Kontrolloni konfigurimin SMTP** në `config/smtp.php`
2. **Sigurohuni që përdorni App Password**, jo fjalëkalimin e rregullt të Gmail
3. **Kontrolloni që 2-Step Verification është aktivizuar** në Google Account
4. **Kontrolloni error logs** për detaje

### PHPMailer nuk funksionon

Nëse PHPMailer nuk është i instaluar, sistemi do të përdorë funksionin `mail()` të PHP-së si fallback. Kjo mund të mos funksionojë në disa servera.

### Kodi 2FA nuk arrin

1. Kontrolloni spam/junk folder
2. Sigurohuni që email-i është i saktë
3. Kontrolloni që SMTP është i konfiguruar saktë
4. Provoni **Resend Code**

## Siguria

- **App Passwords** janë më të sigurta se fjalëkalimet e rregullta
- Kodet 2FA skadojnë pas 10 minutash
- Çdo kod mund të përdoret vetëm një herë
- Kodet janë 6-shifrorë dhe të rastësishëm

## Backup

Për backup, kopjoni direktorinë `data/` që përmban të gjitha konfigurimet, duke përfshirë settings për 2FA.

