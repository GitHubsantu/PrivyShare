# 🔐 PrivyShare

**PrivyShare** is a privacy-first, peer-to-peer (P2P) file sharing application built with  
**React, WebRTC, Socket.IO, and Tauri**.

Files are **encrypted on the sender’s device**, transferred **directly between peers**,  
and are **never stored on any server**.

---

## ✨ Features

- 🔒 End-to-End Encryption (AES-GCM, client-side)
- 🌐 True P2P transfer using WebRTC DataChannels
- 🚫 No cloud storage, no logging, no tracking
- ⚡ Real-time progress & speed indicator
- 🔗 Secure shareable links
- 🖥 Desktop app powered by Tauri (Windows)
- 🌙 Modern UI (Tailwind CSS + Framer Motion)
- 🧑‍💻 Android app (APK supported)
- 📱 QR code scanner added
- 📐 UI/UX improvements
- 🛠 Various bug fixes

---

## 🧠 How PrivyShare Works

1. Sender selects a file
2. File is encrypted locally on sender’s device
3. A secure P2P link is generated
4. Receiver opens the link inside PrivyShare
5. File is transferred directly device-to-device
6. Receiver decrypts the file locally

> ⚠️ The server is used **only for signaling**, never for file transfer or storage.

---

## 🗂 Project Structure

```txt
PrivyShare/
│
├── client/               # React + Vite frontend
│   ├── src/
│   ├── dist/             # Built frontend
│   └── src-tauri/        # Tauri desktop app & Android app
│
├── server/               # Signaling server (Socket.IO)
│   └── server.js
│
└── README.md
```
## 🛠 Requirements

### General
- Node.js **18+**
- npm or pnpm
- Git

### Desktop (Tauri – Windows)
- Rust (stable)
- Visual Studio Build Tools
  - Desktop development with C++
  - MSVC v143
  - Windows 10 / 11 SDK

### Android (Tauri – Android)
- Android Studio (latest)
- Android SDK
- Android NDK
- Java Development Kit (JDK 17)
- Rust (stable)
- Node.js (LTS)
#### Android Studio → SDK Manager
- Android SDK Platform 33+
- Android SDK Build-Tools
- Android Emulator (optional)
---

## 🚀 Local Setup (Development)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/githubsantu/privyshare.git
cd privyshare
```
### 2️⃣ Setup Signaling Server

```bash
cd server
npm install
node server.js
```
Server will run at:

```bash
http://localhost:5000
```

---

## 3️⃣ Setup Client (Web)

```bash
cd client
npm install
npm run dev
```
Client will run at:

```bash
http://localhost:5173
```
## 🖥 Build Desktop App (Tauri – Windows)

### 1️⃣ Install Rust
https://www.rust-lang.org/tools/install

### 2️⃣ Build App

```bash
cd client
npm run tauri build
```
Installer output path:

```txt
client/src-tauri/target/release/bundle/
```
## 📱 Build Android App (Tauri – Android)

### 1️⃣ Prerequisites
- Android Studio (latest)
- Android SDK & NDK
- JDK 17
- Rust (stable)
- Node.js (LTS)

### 2️⃣ Install Rust Android Targets
```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
```
(Optional – emulator support)
```bash
rustup target add x86_64-linux-android
```

### 3️⃣ Setup Android SDK
Open Android Studio → SDK Manager and install:
- Android SDK Platform 33+
- Android SDK Build-Tools
- Android NDK
- Platform Tools
Enable USB Debugging on your Android device.

### 4️⃣ Build Android APK
```bash
cd client
npm install
npm run tauri android build
```

### 5️⃣ APK Output Path
```txt
client/src-tauri/gen/android/app/build/outputs/apk/
```

### 6️⃣ Run on Device (Debug)
```bash
npm run tauri android dev
```
## 🌐 Signaling Server (Production)

PrivyShare uses a lightweight **Socket.IO signaling server**.

You can deploy it on:
- Fly.io
- Railway
- Render
- Self-hosted VPS

> ⚠️ The signaling server is used **only for WebRTC signaling**.  
> Files are **never uploaded or stored** on the server.

---

## 🔐 Security Notes

- Files are encrypted before leaving the sender’s device
- Decryption happens only on the receiver’s device
- No database
- No file logs
- No analytics or tracking

---

## 📦 Release Notes [(v1.0.1)](https://github.com/GitHubsantu/PrivyShare/releases/tag/v1.0.1)

- Initial release
- Fully encrypted P2P file transfer
- Windows desktop app (Tauri)
- Real-time progress & speed indicator
- Clean modern UI
- Zero server-side storage

---

## 📦 Release Notes [(v2.0.0)](https://github.com/GitHubsantu/PrivyShare/releases/tag/v2.0.0)

- Android app support (Tauri – Android)
- QR code scanner added
- Receive files via QR code
- Camera auto-stop on back navigation and page change
- Mobile-optimized and updated UI
- UI fixes and stability improvements
- Minor bug fixes

---

## 📜 License

MIT License  
Free & open-source ❤️
