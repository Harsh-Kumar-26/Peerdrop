import React, { useState, useEffect, useCallback } from "react";
import peer from "../services/peer.js";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../utils/Socketprovider.jsx"; 
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaCheck, FaWifi, FaNetworkWired, FaLock, FaBolt, FaGlobe } from "react-icons/fa";
import { IoMdRocket } from "react-icons/io";
import { MdOutlineSecurity } from "react-icons/md";

const Connection = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    
    const [room, setRoom] = useState("");
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState("Idle");
    const [mode, setMode] = useState("initial"); 
    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 9);
        setRoom(newRoomId);
        setMode("creating");
        
        console.log("Creating and joining room:", newRoomId);
        setStatus(`Waiting for peer in room: ${newRoomId}`);
        socket.emit("join-room", newRoomId);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        const cleanRoom = room.trim();
        if (cleanRoom === "") return;
        
        setRoom(cleanRoom);
        setMode("joining");
        console.log("Joining room:", cleanRoom);
        setStatus(`Joining ${cleanRoom}...`);
        socket.emit("join-room", cleanRoom);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(room);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const create_offer = useCallback(async () => {
        setStatus("Creating Offer...");
        const offer = await peer.getOffer();
        socket.emit("offer", { sdp: offer, roomId: room });
        setStatus("Offer Sent! Waiting for Answer...");
    }, [socket, room]);

    const handle_second_user = useCallback((data) => {
        console.log("User 2 joined:", data.id);
        setStatus("Peer found! Initializing connection...");
        create_offer();
    }, [create_offer]);

    const reply_offer = useCallback(async (res) => {
        setStatus("Received Offer. Handshaking...");
        const answer = await peer.getAnswer(res.sdp);
        socket.emit("answer", { sdp: answer, roomId: room });
    }, [socket, room]);

    const ans_res = useCallback(async (res) => {
        setStatus("Finalizing connection...");
        await peer.setRemoteDescription(res.sdp);
    }, []);

    const ice_reply = useCallback(async (candidate) => {
        await peer.addIceCandidate(candidate);
    }, []);

    useEffect(() => {
        const next_page = () => navigate(`/transfer/${room}`);
        window.addEventListener("peerConnected", next_page);
        return () => window.removeEventListener("peerConnected", next_page);
    }, [navigate, room]);

    useEffect(() => {
        const handleIceCandidate = (event) => {
            const candidate = event.detail;
            socket.emit("ice-candidate", { candidate, roomId: room });
        };
        window.addEventListener("iceCandidate", handleIceCandidate);
        return () => window.removeEventListener("iceCandidate", handleIceCandidate);
    }, [socket, room]);

    useEffect(() => {
        socket.on("user-joined", handle_second_user);
        socket.on("offer", reply_offer);
        socket.on("answer", ans_res);
        socket.on("ice-candidate", ice_reply);

        return () => {
            socket.off("user-joined", handle_second_user);
            socket.off("offer", reply_offer);
            socket.off("answer", ans_res);
            socket.off("ice-candidate", ice_reply);
        };
    }, [socket, handle_second_user, reply_offer, ans_res, ice_reply]);

    
    useEffect(() => {
        peer.reset();
    }, []);


    return (
        <div className="min-h-screen min-w-screen bg-gray-950 text-white w-full overflow-x-hidden font-sans selection:bg-blue-500/30">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 w-full">
                
                <div className="w-full max-w-md mx-auto mb-12 text-center mt-3">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/5 backdrop-blur-sm mb-6 shadow-2xl shadow-blue-900/20">
                            <IoMdRocket className="text-5xl text-blue-400 drop-shadow-glow" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                                PeerDrop
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl font-light max-w-xs mx-auto">
                            Secure, limitless, peer-to-peer file sharing.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl ring-1 ring-white/5"
                >
                    <AnimatePresence mode="wait">
                        
                        {mode === "initial" && (
                            <motion.div
                                key="initial"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                {/* Option A: Create */}
                                <button 
                                    onClick={handleCreateRoom}
                                    className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/25"
                                >
                                    <div className="relative bg-gray-900/50 hover:bg-transparent transition-colors rounded-xl p-5 flex items-center justify-between h-full">
                                        <div className="text-left">
                                            <h3 className="font-bold text-xl text-white">Generate Room</h3>
                                            <p className="text-blue-100/80 text-sm mt-1 font-medium">Create a secure channel</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                                            <FaWifi className="text-xl text-white" />
                                        </div>
                                    </div>
                                </button>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-gray-700/50"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Or Join</span>
                                    <div className="flex-grow border-t border-gray-700/50"></div>
                                </div>

                                <form onSubmit={handleJoinRoom} className="space-y-4">
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FaNetworkWired className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input 
                                            onChange={(e) => setRoom(e.target.value)}
                                            value={room}
                                            placeholder="Enter Room ID to join..."
                                            className="w-full bg-gray-950/50 border border-gray-700/50 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-500 outline-none
                                            focus:placeholder-blue-900
                                            transition-all font-mono tracking-wide"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={!room}
                                        className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:text-white"
                                    >
                                        Connect
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {mode === "creating" && (
                            <motion.div
                                key="creating"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="relative mx-auto w-24 h-24">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                                    <div className="relative w-full h-full bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 backdrop-blur-md">
                                        <FaWifi className="text-3xl text-blue-400" />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Room Ready</h3>
                                    <p className="text-gray-400 text-sm mb-6">Share this ID with your peer</p>
                                    
                                    <div 
                                        onClick={copyToClipboard}
                                        className="group relative bg-gray-950 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        <code className="text-2xl font-mono font-bold text-blue-400 tracking-wider w-full text-center">{room}</code>
                                        <div className="absolute right-4 text-gray-500 group-hover:text-white transition-colors">
                                            {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                        </div>
                                        {copied && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold py-1 px-3 rounded-full"
                                            >
                                                Copied!
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-800/50">
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span>Waiting for peer connection...</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { setMode("initial"); setRoom(""); }}
                                    className="text-gray-500 text-sm hover:text-white transition-colors"
                                >
                                    Cancel & Go Back
                                </button>
                            </motion.div>
                        )}

                        {mode === "joining" && (
                            <motion.div
                                key="joining"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Connecting...</h3>
                                <p className="text-gray-400 font-mono text-sm">Room: {room}</p>
                                <p className="text-sm text-blue-400 mt-6 animate-pulse font-medium">{status}</p>
                                <br/>
                                <button 
                                    onClick={() => { setMode("initial"); setRoom(""); }}
                                    className="text-gray-500 text-sm hover:text-white transition-colors"
                                >
                                    Cancel & Go Back
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8"
                >
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 backdrop-blur-md text-xs font-medium text-gray-400">
                        <div className={`w-2 h-2 rounded-full mr-2 ${status === 'Idle' ? 'bg-gray-600' : 'bg-green-500 animate-pulse'}`}></div>
                        System Status: <span className="text-gray-300 ml-1">{status}</span>
                    </div>
                </motion.div>

                
            </div>

            

            <div className="relative z-10 w-full bg-gray-950 border-t border-gray-900 py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Zero Servers. Infinite Possibilities.
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <FeatureCard 
                            icon={<FaBolt className="text-yellow-400" />}
                            title="Instant Transfer"
                            desc="Direct device-to-device connection. No uploading to a cloud server means blazing fast speeds limited only by your network."
                        />
                        <FeatureCard 
                            icon={<MdOutlineSecurity className="text-green-400" />}
                            title="End-to-End Encrypted"
                            desc="Your data flows directly between peers using WebRTC security protocols. We never see your files."
                        />
                        <FeatureCard 
                            icon={<FaGlobe className="text-blue-400" />}
                            title="Cross-Device"
                            desc="Seamlessly send files between mobile, desktop, and tablets. Works on any modern browser."
                        />
                    </div>

                    <div className="bg-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-800">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6">How to use PeerDrop</h3>
                                <ul className="space-y-6">
                                    <Step number="1" title="Create a Room" desc="Click 'Generate Room' on your first device to create a unique secure ID." />
                                    <Step number="2" title="Connect Peer" desc="Open PeerDrop on the second device and enter the Room ID." />
                                    <Step number="3" title="Start Sharing" desc="Once connected, drag and drop files to transfer instantly." />
                                </ul>
                            </div>
                            <div className="hidden md:flex justify-center">
                                <div className="relative w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <FaNetworkWired className="text-8xl text-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="relative z-10 w-full bg-black py-12 px-6 border-t border-gray-900">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-bold text-white mb-2">PeerDrop</h4>
                        <p className="text-sm text-gray-500">Secure P2P File Transfer Protocol</p>
                    </div>
                    
                    <div className="text-center md:text-right text-gray-400 text-sm space-y-1">
                        <p>Developed by <span className="text-white font-medium">Harsh Kumar</span></p>
                        <p className="hover:text-blue-400 cursor-pointer transition-colors">harshkumar010377@gmail.com</p>
                        <p className="text-xs text-gray-600 mt-2">© 2025 PeerDrop. Open Source.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            {number}
        </div>
        <div>
            <h4 className="text-white font-bold mb-1">{title}</h4>
            <p className="text-gray-400 text-sm">{desc}</p>
        </div>
    </div>
);

export default Connection;