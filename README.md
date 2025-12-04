🚀 PeerDrop - Secure P2P File Sharing

PeerDrop is a modern, high-speed file sharing application that allows users to transfer files directly between devices without uploading them to a cloud server. It leverages WebRTC for secure, peer-to-peer data transfer, ensuring privacy and speed.

✨ Features

Zero-Server Storage: Files are streamed directly from sender to receiver. No data is stored on any server.

Cross-Device Compatibility: Works seamlessly between laptops, smartphones, and tablets.

Global Connectivity: Integrated TURN servers allow connections across different networks (e.g., WiFi to Mobile Data) and firewalls.

End-to-End Encryption: Data is encrypted in transit using WebRTC security protocols.

Modern UI: A beautiful, responsive dark-themed interface built with React and Tailwind CSS.

Real-time Progress: Visual feedback on upload and download speeds.

🛠️ Tech Stack

Frontend: React.js, Vite, Tailwind CSS, Framer Motion

Backend: Node.js, Express, Socket.io (Signaling Server)

Core Technology: WebRTC (RTCPeerConnection, Data Channels)

🚀 Live Demo

Frontend (App): [https://peerdrop-nt51.vercel.app](https://peerdrop-nt51.vercel.app/)

Backend API: [https://peerdrop-backend.onrender.com](https://peerdrop-3r8g.onrender.com)

🚀 Getting Started

Prerequisites

Node.js (v16 or higher)

npm

Installation

Clone the repository

git clone [https://github.com/Harsh-Kumar-26/PeerDrop.git](https://github.com/Harsh-Kumar-26/PeerDrop.git)
cd PeerDrop



Install Dependencies (Root)

npm install



This will install dependencies for both client and server folders if set up as a workspace, otherwise navigate to each folder:

cd client && npm install
cd ../server && npm install



Running Locally

Start the Backend Server

cd server
npm run dev



The server will start on http://localhost:8000.

Start the Frontend Client

cd client
npm run dev



The app will be available at http://localhost:5173.

Environment Variables

Client (.env)
Create a .env file in the client folder:

VITE_SOCKET_URL=http://localhost:8000
# Optional: Add your own TURN server credentials here for production
# VITE_TURN_URL=turn:your.turn.server:3478
# VITE_TURN_USERNAME=your_username
# VITE_TURN_PASSWORD=your_password



Server (.env)
Create a .env file in the server folder:

PORT=8000
CORS_ORIGIN=*



🤝 How it Works

Signaling: User A creates a room. The browser connects to the Socket.io server to exchange "handshake" data (SDP Offer/Answer & ICE Candidates).

Connection: Once the handshake is complete, a direct WebRTC connection is established between User A and User B.

Transfer: When a file is selected, it is sliced into chunks and sent over the WebRTC Data Channel directly to the peer.

📄 License

This project is open source and available under the MIT License.

Developed with ❤️ by Harsh Kumar

