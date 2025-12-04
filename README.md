🚀 PeerDrop - Secure P2P File Sharing

PeerDrop is a high-speed, secure file transfer application that enables direct device-to-device sharing without cloud storage. Powered by WebRTC, it ensures privacy, speed, and cross-platform compatibility.

✨ Key Features

🔒 Zero-Server Storage: Files stream directly between peers. Nothing is ever stored on a server.

📱 Cross-Device: Works seamlessly across laptops, smartphones, and tablets.

🌍 Global Connectivity: Integrated TURN servers bypass strict firewalls and mobile carrier NATs.

🛡️ End-to-End Encryption: Data is encrypted in transit using WebRTC security protocols.

🎨 Modern UI: A responsive, dark-themed interface built with React, Tailwind CSS, and Framer Motion.

⚡ Real-Time Progress: Visual feedback for upload and download speeds.

🛠️ Tech Stack

Component

Technologies

Frontend

React.js, Vite, Tailwind CSS, Framer Motion

Backend

Node.js, Express, Socket.io (Signaling)

Core

WebRTC (RTCPeerConnection, Data Channels)

🚀 Live Demo

Frontend (App): https://peerdrop-nt51.vercel.app

Backend API: https://peerdrop-backend.onrender.com

🚀 Getting Started

Prerequisites

Node.js (v16+)

npm

Installation

Clone the Repository

git clone [https://github.com/Harsh-Kumar-26/PeerDrop.git](https://github.com/Harsh-Kumar-26/PeerDrop.git)
cd PeerDrop


Install Dependencies

# Install for both client and server
cd client && npm install
cd ../server && npm install


Running Locally

Start Backend

cd server
npm run dev
# Server runs on http://localhost:8000


Start Frontend

cd client
npm run dev
# App runs on http://localhost:5173


Environment Variables

Client (client/.env)

VITE_SOCKET_URL=http://localhost:8000
# Optional: Add TURN credentials for production
# VITE_TURN_URL=turn:your.turn.server:3478
# VITE_TURN_USERNAME=your_username
# VITE_TURN_PASSWORD=your_password


Server (server/.env)

PORT=8000
CORS_ORIGIN=*


🤝 How it Works

Signaling: Users join a room via Socket.io to exchange handshake data (SDP & ICE Candidates).

Connection: A direct, encrypted P2P tunnel is established using WebRTC.

Transfer: Files are sliced into chunks and streamed directly to the peer via Data Channels.

📄 License

This project is open source and available under the MIT License.

<p align="center">
Developed with ❤️ by <b>Harsh Kumar</b>
</p>
