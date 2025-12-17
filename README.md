# 🚀 Peerdrop  

Peerdrop is a **real-time peer-to-peer file sharing platform** built with WebRTC, enabling fast, secure, and direct device-to-device transfers.  
It uses a lightweight **Node.js signaling server** with **Socket.IO**, while all file data flows **directly between peers**, ensuring privacy and high performance.

🌐 **Live Demo:** [*Frontend (Vercel)* ](https://peerdrop-nt51.vercel.app/) 

---

## ✨ Features  

- 🔐 **Secure Peer Connections**  
  - WebRTC encrypted DataChannels  
  - STUN/TURN support for restricted networks  
  - No file data stored on server (signaling only)  

- ⚡ **Real-time File Sharing**  
  - Direct P2P transfer between devices  
  - Chunk-based large file support  
  - Live progress updates  

- 🌍 **Cross-Device Compatibility**  
  - Works on mobile ↔ laptop ↔ desktop  
  - Optimized UI for all screen sizes  
  - Handles slow networks gracefully  

- 🛰️ **Network Reliability**  
  - ICE candidate exchange via Socket.IO  
  - Automatic TURN fallback  
  - Stable connection handling and reconnection logic  

- 🎨 **Clean UI/UX**  
  - Simple drag-and-drop interface  
  - Room-based sharing flow  
  - Minimal setup for instant usage  

---

## 🛠️ Tech Stack  

**Frontend:** Reactjs, WebRTC, Socket.IO Client  
**Backend:** Node.js, Express.js, Socket.IO  
**Real-time:** WebRTC (RTCPeerConnection + DataChannel)  
**NAT Traversal:** STUN/TURN  
**Deployment:** Vercel (Frontend), Render (Backend)  

---

