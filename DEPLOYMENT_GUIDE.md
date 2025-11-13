# Appstalker - GitHub & Android Emulator Deployment Guide

## 📋 Gereksinimler

### Bilgisayarınızda Kurulu Olması Gerekenler:
- **Node.js** (v18+)
- **JDK 17** (Java Development Kit)
- **Android Studio** (Android SDK ile)
- **VS Code**
- **Git**

---

## 🚀 ADIM 1: GitHub Repository Oluşturma

### 1.1 GitHub'da Yeni Repo Oluştur
1. GitHub.com'a git
2. "New Repository" tıkla
3. Repository name: `appstalkerv1`
4. **Public** veya **Private** seç
5. **Create Repository** (README, .gitignore, license ekleme!)

### 1.2 GitHub Personal Access Token Oluştur (Gerekirse)
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Scope: `repo` seç
4. Token'ı kopyala ve kaydet (bir daha göremezsin!)

---

## 📤 ADIM 2: Replit'ten GitHub'a Push

### 2.1 Replit Shell'de Git Yapılandırması
```bash
# Git kullanıcı bilgilerini ayarla
git config --global user.name "SİZİN_ADINIZ"
git config --global user.email "sizin_email@example.com"
```

### 2.2 GitHub Remote Ekle ve Push Yap
```bash
# Git repository'yi başlat (zaten başlatılmış olabilir)
git init

# Tüm dosyaları stage'e ekle
git add .

# İlk commit
git commit -m "Initial commit: Appstalker MVP with Premium UI/UX"

# GitHub remote ekle (USERNAME yerine kendi kullanıcı adınızı yazın)
git remote add origin https://github.com/USERNAME/appstalkerv1.git

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a push (token gerekirse: https://TOKEN@github.com/USERNAME/appstalkerv1.git)
git push -u origin main
```

**Not:** Token kullanıyorsanız:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/appstalkerv1.git
git push -u origin main
```

---

## 💻 ADIM 3: VS Code'da Açma

### 3.1 Repository'yi Clone Et
```bash
# Bilgisayarınızda terminalde
cd ~/Desktop  # veya istediğiniz klasör
git clone https://github.com/USERNAME/appstalkerv1.git
cd appstalkerv1
```

### 3.2 VS Code'da Aç
```bash
code .
```

Ya da VS Code'u açıp `File → Open Folder → appstalkerv1`

---

## 📱 ADIM 4: Expo OLMADAN Android Emulator'de Çalıştırma

### 4.1 React Native CLI Kurulumu
```bash
# React Native CLI global olarak kur
npm install -g react-native-cli
```

### 4.2 Android Studio ve SDK Kurulumu

#### Android Studio İndir ve Kur:
1. https://developer.android.com/studio indir
2. Kur ve aç
3. **SDK Manager** aç (More Actions → SDK Manager)
4. Şunları kur:
   - ✅ Android SDK Platform 33 (Android 13)
   - ✅ Android SDK Build-Tools 33.0.0
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools

#### Environment Variables Ayarla:

**Windows:**
```powershell
# Sistem Ortam Değişkenleri
ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17

# Path'e ekle:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\emulator
%JAVA_HOME%\bin
```

**macOS/Linux:**
```bash
# ~/.zshrc veya ~/.bashrc dosyasına ekle
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$JAVA_HOME/bin

# Kaydet ve yenile
source ~/.zshrc  # veya source ~/.bashrc
```

### 4.3 Android Emulator Oluştur

1. Android Studio → **Device Manager** (yan panel)
2. **Create Device**
3. **Pixel 6** seç (ya da herhangi bir cihaz)
4. **System Image**: Android 13 (API 33) indir ve seç
5. **Finish**

### 4.4 Expo'yu Kaldır ve React Native CLI'ye Geç

#### Mevcut Expo Bağımlılıklarını Kaldır:
```bash
cd mobile

# Expo paketlerini kaldır
npm uninstall expo expo-status-bar

# React Native CLI için gerekli paketleri kur
npm install react-native
```

#### package.json'u Güncelle:

`mobile/package.json` dosyasını aç ve `scripts` bölümünü güncelle:

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest"
  }
}
```

### 4.5 Android Klasörü Oluştur (Eject)

```bash
cd mobile

# React Native Android projesi oluştur
npx react-native init AppStalkerMobile --skip-install
cd AppStalkerMobile

# Mevcut src klasörünüzü buraya kopyalayın
cp -r ../src ./
cp -r ../assets ./
cp ../package.json ./
npm install
```

**VEYA** daha kolay yöntem:

```bash
# Eğer expo projesi ise
cd mobile
npx expo prebuild
```

Bu komut otomatik olarak `android/` ve `ios/` klasörlerini oluşturur.

### 4.6 Metro Bundler'ı Başlat

```bash
cd mobile
npm start
# veya
npx react-native start
```

### 4.7 Android Emulator'ü Başlat

**Yöntem 1: Android Studio'dan**
- Android Studio → Device Manager → Emulator'unuzu başlat

**Yöntem 2: Komut satırından**
```bash
# Emulator listesini gör
emulator -list-avds

# Emulator'u başlat (AVD_NAME yerine kendi isminizi yazın)
emulator -avd Pixel_6_API_33
```

### 4.8 Uygulamayı Emulator'de Çalıştır

**Yeni terminal açın:**
```bash
cd mobile
npx react-native run-android
```

İlk defa çalıştırıyorsanız Gradle build süreci 5-10 dakika sürebilir.

---

## 🔧 Alternatif: Tamamen Yeni React Native Projesi

Eğer Expo'dan tamamen çıkmak istiyorsanız:

```bash
# Yeni React Native CLI projesi oluştur
npx react-native init Appstalker
cd Appstalker

# Mevcut kaynak kodunuzu kopyalayın
# mobile/src/* dosyalarını buraya taşıyın
```

Sonra:
```bash
# Dependencies kur
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context react-native-screens
npm install @react-native-async-storage/async-storage

# Android'de çalıştır
npx react-native run-android
```

---

## 🛠️ Troubleshooting

### Gradle Build Hatası
```bash
cd mobile/android
./gradlew clean
cd ..
npx react-native run-android
```

### Metro Bundler Port Hatası
```bash
# Port 8081'i temizle
npx react-native start --reset-cache
```

### Android SDK Bulunamadı
```bash
# SDK path'i kontrol et
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME%  # Windows
```

### JDK Versiyonu Hatası
```bash
# JDK versiyonunu kontrol et (17 olmalı)
java -version
javac -version
```

---

## 🔧 Environment Variables (İHTİYAÇ YOK!)

**ÖNEMLİ:** Bu proje için **.env dosyasına ihtiyacınız YOK!** 🎉

API URL'leri otomatik olarak platform bazlı seçiliyor:
- **Android Emulator**: `http://10.0.2.2:5000` (otomatik)
- **iOS Simulator**: `http://localhost:5000` (otomatik)
- **Production**: Deploy ederken güncellersiniz

Kaynak: `mobile/src/config/api.ts`

URL'leri değiştirmek isterseniz:
```typescript
// mobile/src/config/api.ts dosyasını açın
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000'; // Buradan değiştirin
    }
    return 'http://localhost:5000';
  }
  return 'https://your-production-url.com'; // Production URL
};
```

---

## 📊 Özet Komutlar

### GitHub'a Push:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/appstalkerv1.git
git branch -M main
git push -u origin main
```

### VS Code'da Aç:
```bash
cd ~/Desktop
git clone https://github.com/USERNAME/appstalkerv1.git
cd appstalkerv1
code .
```

### Android'de Çalıştır:
```bash
# Terminal 1: Metro Bundler
cd mobile
npm install
npx react-native start

# Terminal 2: Emulator başlat
emulator -avd Pixel_6_API_33

# Terminal 3: App çalıştır
cd mobile
npx react-native run-android
```

---

## ✅ Başarı Kriterleri

- ✅ GitHub repo'sunda kod görünüyor
- ✅ VS Code'da proje açık
- ✅ Android emulator çalışıyor
- ✅ Uygulama emulator'de görünüyor
- ✅ Backend API'ye bağlanıyor

---

## 📞 Backend Connection

Emulator'den bilgisayarınızdaki backend'e bağlanmak için:

`mobile/src/config/api.ts` dosyasında:

```typescript
// localhost yerine 10.0.2.2 kullan (Android emulator için)
const API_BASE_URL = 'http://10.0.2.2:5000';
```

Backend'i Replit'te çalışır durumda tutun veya lokal olarak çalıştırın:
```bash
cd server
npm install
npm run dev
```

---

## 🎯 Sonuç

Tebrikler! Appstalker artık:
- ✅ GitHub'da
- ✅ VS Code'da açık
- ✅ Android emulator'de çalışıyor (Expo olmadan!)

**React Native CLI** ile tam native control sahibisiniz! 🚀
