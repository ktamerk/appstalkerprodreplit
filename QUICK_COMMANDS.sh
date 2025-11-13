#!/bin/bash
# Appstalker - Quick Deployment Commands
# Copy-paste these commands in order

echo "=== APPSTALKER DEPLOYMENT QUICK REFERENCE ==="
echo ""

# ============================================
# ADIM 1: GIT YAPÝLANDIRMASI (Replit Shell)
# ============================================
echo "## STEP 1: Git Configuration"
git config --global user.name "YOUR_NAME"
git config --global user.email "your_email@example.com"

# ============================================
# ADIM 2: GITHUB'A PUSH (Replit Shell)
# ============================================
echo "## STEP 2: Push to GitHub"
git init
git add .
git commit -m "Initial commit: Appstalker MVP with Premium UI/UX"
git remote add origin https://github.com/USERNAME/appstalkerv1.git
git branch -M main
git push -u origin main

# Token ile push:
# git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/appstalkerv1.git
# git push -u origin main

# ============================================
# ADIM 3: CLONE & OPEN (Bilgisayarınız)
# ============================================
echo "## STEP 3: Clone and Open in VS Code"
cd ~/Desktop
git clone https://github.com/USERNAME/appstalkerv1.git
cd appstalkerv1
code .

# ============================================
# ADIM 4: ANDROID SETUP (Bilgisayarınız)
# ============================================
echo "## STEP 4: Android Setup"

# React Native CLI kur
npm install -g react-native-cli

# Mobile klasörüne git
cd mobile

# Expo'dan React Native CLI'ye geç (SEÇENEK 1)
npx expo prebuild

# VEYA sıfırdan React Native projesi (SEÇENEK 2)
# npx react-native init Appstalker
# cd Appstalker
# (Sonra src klasörünü buraya kopyala)

# Dependencies kur
npm install

# ============================================
# ADIM 5: BACKEND ÇALIŞTIR (Terminal 1)
# ============================================
echo "## STEP 5: Run Backend"
cd server
npm install
npm run dev
# Backend runs on http://localhost:5000

# ============================================
# ADIM 6: METRO BUNDLER (Terminal 2)
# ============================================
echo "## STEP 6: Start Metro Bundler"
cd mobile
npx react-native start
# veya
# npm start

# ============================================
# ADIM 7: ANDROID EMULATOR (Terminal 3)
# ============================================
echo "## STEP 7: Start Android Emulator"

# Emulator listesi
emulator -list-avds

# Emulator başlat (isim değiştir!)
emulator -avd Pixel_6_API_33

# ============================================
# ADIM 8: APP ÇALIÞTIR (Terminal 4)
# ============================================
echo "## STEP 8: Run App on Android"
cd mobile
npx react-native run-android

# ============================================
# TROUBLESHOOTING
# ============================================
echo "## Troubleshooting Commands"

# Gradle clean
# cd mobile/android && ./gradlew clean && cd ..

# Metro cache temizle
# npx react-native start --reset-cache

# Port kill (8081)
# lsof -ti:8081 | xargs kill -9  # macOS/Linux
# netstat -ano | findstr :8081   # Windows

# Node modules temizle
# rm -rf node_modules package-lock.json
# npm install

echo ""
echo "=== DEPLOYMENT COMPLETE! ==="
echo "App should be running on Android Emulator"
