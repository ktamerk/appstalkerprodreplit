# Windows Kullanıcıları için Özel Kurulum

## 📌 Windows için Environment Variables

### 1. JAVA_HOME Ayarlama

1. **Başlat** → **"Environment Variables"** ara
2. **"Edit the system environment variables"** tıkla
3. **Environment Variables** butonuna tıkla
4. **System variables** altında **New** tıkla:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Java\jdk-17`
5. **OK** tıkla

### 2. ANDROID_HOME Ayarlama

1. Aynı pencerede **New** tıkla:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
2. **OK** tıkla

### 3. Path'e Ekleme

1. **System variables** altında **Path** seç
2. **Edit** tıkla
3. **New** tıkla ve şunları ekle:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %JAVA_HOME%\bin
   ```
4. **OK** → **OK** → **OK**

### 4. PowerShell/CMD'yi Yeniden Başlat

Değişikliklerin etkinleşmesi için PowerShell/CMD'yi kapat ve tekrar aç.

### 5. Kontrol Et

```powershell
echo %ANDROID_HOME%
echo %JAVA_HOME%
java -version
adb version
```

---

## 🚀 Windows'ta Hızlı Başlatma

### PowerShell Script Oluştur

`start-appstalker.ps1` dosyası oluştur:

```powershell
# Backend'i başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# Metro Bundler'ı başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npx react-native start"

# Emulator'u başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "emulator -avd Pixel_6_API_33"

# 30 saniye bekle (emulator için)
Start-Sleep -Seconds 30

# Uygulamayı çalıştır
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npx react-native run-android"
```

Çalıştırmak için:
```powershell
.\start-appstalker.ps1
```

---

## ⚠️ Yaygın Windows Hataları ve Çözümleri

### Hata 1: "ANDROID_HOME is not set"
**Çözüm:**
```powershell
setx ANDROID_HOME "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
```

### Hata 2: "adb: command not found"
**Çözüm:**
```powershell
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

### Hata 3: "Java is not recognized"
**Çözüm:**
1. JDK 17'yi indir: https://adoptium.net/
2. Kur: `C:\Program Files\Java\jdk-17`
3. JAVA_HOME ayarla

### Hata 4: Gradle Build Çok Yavaş
**Çözüm:**
`mobile/android/gradle.properties` dosyasına ekle:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.daemon=true
```

### Hata 5: Port 8081 Kullanımda
**Çözüm:**
```powershell
netstat -ano | findstr :8081
taskkill /PID [PID_NUMBER] /F
```

### Hata 6: Emulator Başlamıyor
**Çözüm:**
1. Android Studio → AVD Manager → Cold Boot
2. BIOS'ta virtualization açık mı kontrol et
3. Hyper-V devre dışı mı kontrol et:
   ```powershell
   bcdedit /set hypervisorlaunchtype off
   ```
   (Restart gerekli)

---

## 🔧 VS Code Extensions (Önerilen)

1. **React Native Tools** (Microsoft)
2. **ES7+ React/Redux/React-Native snippets**
3. **Prettier - Code formatter**
4. **ESLint**
5. **GitLens**

---

## 📱 Android Emulator Kısayolları

- **Ctrl + M** - Developer menu
- **Ctrl + R** - Reload
- **Ctrl + D** - Debug menu

---

## 💡 İpuçları

1. **WSL kullanıyorsanız:**
   - Android Studio Windows'ta kurulu olmalı
   - Node.js hem Windows hem WSL'de olabilir
   - `adb connect` ile WSL'den Windows emulator'a bağlanabilirsiniz

2. **Antivirus:**
   - Gradle klasörünü exception'a ekleyin
   - node_modules klasörünü exception'a ekleyin

3. **Performance:**
   - SSD kullanın
   - En az 8GB RAM
   - Intel HAXM yükleyin (Intel CPU için)

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. PowerShell'i **Administrator** olarak çalıştırın
2. `npx react-native doctor` komutunu çalıştırın
3. Eksik olanları kurun

Başarılar! 🚀
