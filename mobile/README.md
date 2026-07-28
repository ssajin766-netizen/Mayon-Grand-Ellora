# 📱 Mayon Grand Ellora - Android & iOS Mobile Application

This directory contains the cross-platform mobile application for **Mayon Grand Ellora (E-Society)** built with **React Native & Expo**.

---

## ✨ Mobile App Features

1. **🔐 Mobile Login Screen**:
   - **Login with Phone Number (OTP)**: Send and verify SMS OTP code (Twilio integration).
   - **Login with Google**: One-tap Google OAuth 2.0 Sign-In.
   - **Login with Email & Password**: Full backward compatibility for existing resident/admin accounts.
2. **🏠 Resident Dashboard**:
   - Society notices & announcements.
   - Maintenance bills tracking & payment option.
   - Complaints & Helpdesk ticket system.
   - Tap-to-call emergency contacts (Police, Ambulance, Security, Electrician, Plumber, Lift Service).
   - Profile management & session control.

---

## 🚀 Setup & Running Locally

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Backend Endpoint (API)
Open `mobile/src/services/api.js` and set the backend URL (e.g. `https://e-society-erp9.onrender.com` or your local machine IP `http://192.168.1.X:3000`).

### 3. Start Expo Dev Server
```bash
npx expo start
```
- Press `a` for **Android Emulator**.
- Press `i` for **iOS Simulator** (macOS).
- Scan the QR code using the **Expo Go** app on a physical Android or iPhone device.

---

## 📦 Building Mobile App Binaries (Android & iOS)

### Build Android App (`.apk` / `.aab`)
To create a standalone Android APK for installation:
```bash
npx eas-cli build -p android --profile preview
```

To create an Android App Bundle (`.aab`) for Google Play Store:
```bash
npx eas-cli build -p android --profile production
```

### Build iOS App (`.ipa`)
To build for iOS (Apple App Store / TestFlight):
```bash
npx eas-cli build -p ios --profile production
```

---

## 🛠 Project Structure

```
mobile/
├── assets/
├── src/
│   ├── context/
│   │   └── AuthContext.js         # Session & Auth state management
│   ├── screens/
│   │   ├── LoginScreen.js         # Phone & Google Login Screen
│   │   ├── OtpScreen.js           # 6-Digit OTP verification
│   │   ├── HomeScreen.js          # Resident Dashboard
│   │   ├── NoticesScreen.js       # Society Notices
│   │   ├── BillsScreen.js         # Maintenance Bills
│   │   ├── ComplaintsScreen.js    # Complaints & Helpdesk
│   │   ├── ContactsScreen.js      # Emergency Contacts
│   │   └── ProfileScreen.js       # Profile & Logout
│   ├── services/
│   │   └── api.js                 # Axios API Client
│   └── theme/
│       └── colors.js              # Color palette
├── App.js                         # Root Navigation Stack
├── app.json                       # Expo config (bundle IDs & package names)
└── package.json
```
