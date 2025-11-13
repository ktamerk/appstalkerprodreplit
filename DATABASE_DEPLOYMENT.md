# Appstalker - Database Deployment Guide

## 📊 Database Durumu: ✅ HAZIR!

PostgreSQL database **Replit'te zaten kurulu ve çalışıyor!** (Neon-backed)

---

## 🎯 İKİ SEÇENEK

### ✅ SEÇENEK 1: Backend'i Replit'te Çalıştır (ÖNERİLEN - EN KOLAY)

**Avantajlar:**
- ✅ Database zaten hazır (Neon PostgreSQL)
- ✅ Hiç PostgreSQL kurmanıza gerek yok
- ✅ Backend her zaman erişilebilir
- ✅ Ücretsiz (Replit üzerinde)
- ✅ Otomatik SSL, domain

**Nasıl Çalışır:**
```
[Android Emulator] → http://10.0.2.2:5000 (proxy) → [Replit Backend] → [PostgreSQL]
                                                        ↓
                                            https://your-repl.replit.dev
```

**Adımlar:**

1. **Replit'te Backend Çalışıyor Mu Kontrol:**
```bash
# Replit Shell'de
npm run dev
# Backend http://0.0.0.0:5000 üzerinde çalışmalı
```

2. **Replit Public URL'i Alın:**
   - Replit'te "Webview" açın
   - URL'i kopyalayın (örn: `https://appstalker.username.replit.dev`)

3. **Mobile App'te Replit URL'ini Kullan:**

`mobile/src/config/api.ts` dosyasını açın:
```typescript
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator Replit'e bağlanamazsa localhost proxy kullanın
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
  }
  // Production: Replit URL'inizi buraya yazın
  return 'https://appstalker.USERNAME.replit.dev'; // 👈 Buraya
};
```

4. **Local Proxy Kurma (Gerekirse):**

Eğer Android emulator Replit'e direkt bağlanamıyorsa, bilgisayarınızda proxy çalıştırın:

```bash
# Bilgisayarınızda (Windows/Mac/Linux)
# Option 1: SSH tunnel (Mac/Linux)
ssh -L 5000:0.0.0.0:5000 username@replit.com

# Option 2: Node proxy script
# proxy.js oluştur:
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
http.createServer((req, res) => {
  proxy.web(req, res, {
    target: 'https://appstalker.USERNAME.replit.dev',
    changeOrigin: true
  });
}).listen(5000);

# Çalıştır:
node proxy.js
```

**Özet:**
- Backend: Replit'te çalışıyor ✅
- Database: Replit PostgreSQL (Neon) ✅
- Mobile: Android emulator → Replit backend

---

### 🔧 SEÇENEK 2: Backend'i Bilgisayarınızda Çalıştır (İLERİ SEVİYE)

**Avantajlar:**
- Tam kontrol
- Offline çalışabilir
- Debug daha kolay

**Dezavantajlar:**
- ❌ Local PostgreSQL kurulumu gerekli
- ❌ Database konfigürasyonu gerekli
- ❌ Daha karmaşık

**Gereksinimler:**
- PostgreSQL 15+ kurulu
- Node.js 18+

---

### 📥 Local PostgreSQL Kurulumu

#### Windows:

1. **PostgreSQL İndir:**
   - https://www.postgresql.org/download/windows/
   - PostgreSQL 15 veya 16 seç
   - Installer'ı çalıştır

2. **Kurulum Ayarları:**
   - Port: `5432` (default)
   - Password: `postgres` (veya istediğiniz)
   - Superuser: `postgres`

3. **Database Oluştur:**
```bash
# PowerShell (Administrator olarak)
psql -U postgres

# PostgreSQL shell'de:
CREATE DATABASE appstalker;
\q
```

#### macOS:

```bash
# Homebrew ile
brew install postgresql@15
brew services start postgresql@15

# Database oluştur
createdb appstalker
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database oluştur
sudo -u postgres createdb appstalker
```

---

### 🔐 Backend Konfigürasyonu (Local)

1. **Environment Variables Oluştur:**

`.env` dosyası oluştur (root klasörde):
```bash
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appstalker

# Session Secret
SESSION_SECRET=your-super-secret-key-change-this

# Server Config
PORT=5000
NODE_ENV=development
```

2. **Database Schema Push:**
```bash
# Root klasörde
npm install
npm run db:push
```

3. **Backend Başlat:**
```bash
npm run dev
# Backend http://localhost:5000 üzerinde çalışacak
```

4. **Mobile App Otomatik Bağlanır:**
   - Android: `http://10.0.2.2:5000`
   - iOS: `http://localhost:5000`

---

## 📊 Database Schema Kontrol

```bash
# Drizzle Studio ile database'i görsel olarak incele
npm run db:studio
# http://localhost:4983 açılır
```

---

## 🔄 Database Migration (Gerekirse)

Eğer database schema değiştiyse:

```bash
# Yeni schema'yı push et
npm run db:push

# Eğer hata alırsanız (force ile):
npm run db:push -- --force
```

---

## 📋 Özet: HANGİ SEÇENEĞİ SEÇMELİYİM?

| Özellik | Replit Backend (Seçenek 1) | Local Backend (Seçenek 2) |
|---------|---------------------------|--------------------------|
| **Kurulum** | ✅ Hazır | ❌ PostgreSQL gerekli |
| **Kolay** | ✅✅✅ Çok kolay | ⚠️ Orta seviye |
| **Database** | ✅ Neon (ücretsiz) | ❌ Local PostgreSQL |
| **Erişim** | 🌐 Her yerden | 💻 Sadece local |
| **Hız** | ⚡ İyi | ⚡⚡ Çok hızlı |
| **Deployment** | ✅ Hazır | ❌ Ekstra adım |

---

## 🎯 ÖNERİ

**Başlangıç için:** ✅ **SEÇENEK 1** (Replit Backend)
- Hızlı test etmek için
- Database kurmak istemiyorsanız
- Mobil uygulamayı hızla denemek için

**Production için:** 🔧 **SEÇENEK 2** (Local Backend)
- Tam kontrole ihtiyacınız varsa
- Offline çalışmak istiyorsanız
- Database'i kendiniz yönetmek istiyorsanız

---

## ✅ Şu Anda Yapmanız Gereken

**HİÇBİR ŞEY!** 🎉

Backend zaten Replit'te çalışıyor:
```bash
# Replit Shell'de kontrol:
npm run dev
```

Mobile app otomatik olarak bağlanacak:
- Android: `http://10.0.2.2:5000` → Replit backend
- Database: Neon PostgreSQL (zaten hazır)

---

## 🚨 Troubleshooting

### Hata: "Connection refused" (Android'den)

**Çözüm 1:** Replit backend çalışıyor mu kontrol:
```bash
npm run dev
# http://0.0.0.0:5000 üzerinde çalışmalı
```

**Çözüm 2:** Replit public URL kullan:
```typescript
// mobile/src/config/api.ts
return 'https://your-repl.replit.dev';
```

**Çözüm 3:** Local proxy kullan (yukarıda anlatıldı)

### Hata: "Database connection failed"

**Çözüm:** Database hazır mı kontrol:
```bash
# Replit Shell'de
echo $DATABASE_URL
# postgresql://... gibi bir URL dönmeli
```

---

## 📞 Yardım

Sorun mu yaşıyorsunuz?

1. Backend çalışıyor mu: `npm run dev`
2. Database var mı: `echo $DATABASE_URL`
3. Mobile app doğru URL'e bağlanıyor mu: `mobile/src/config/api.ts`

Başarılar! 🚀
