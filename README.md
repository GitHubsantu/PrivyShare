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
│   └── src-tauri/        # Tauri desktop app
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

## 📦 Release Notes (v1.0.0)

- Initial release
- Fully encrypted P2P file transfer
- Windows desktop app (Tauri)
- Real-time progress & speed indicator
- Clean modern UI
- Zero server-side storage

---

## 📜 License

MIT License  
Free & open-source ❤️
