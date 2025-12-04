import React, { useState, useEffect } from "react";
import peer from "../services/peer.js"; 
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Icons = {
    Upload: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    File: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    ArrowLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    )
};

const Transfer = () => {
    const { roomid } = useParams();
    const navigate = useNavigate();
    
    const [msg, setmsg] = useState("Connected via WebRTC");
    const [selectedFile, setSelectedFile] = useState(null);
    const [receivedFile, setReceivedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);

    useEffect(() => {
        const handleReceive = (event) => {
            const { blob, fileName } = event.detail;
            setmsg(`Received: ${fileName}`);
            const url = URL.createObjectURL(blob);
            setReceivedFile({ url, name: fileName });
            setIsReceiving(false);
            setProgress(100);
        };

        const handleProgress = (event) => {
            const percent = event.detail;
            setIsReceiving(true);
            setProgress(percent);
            setmsg(`Receiving... ${percent}%`);
        };

        window.addEventListener("fileReceived", handleReceive);
        window.addEventListener("downloadProgress", handleProgress);

        return () => {
            window.removeEventListener("fileReceived", handleReceive);
            window.removeEventListener("downloadProgress", handleProgress);
        };
    }, []);

    const handleSend = async () => {
        if (!selectedFile) return;

        setIsSending(true);
        setProgress(0);
        setmsg(`Sending ${selectedFile.name}...`);
        
        await peer.sendFile(selectedFile, (percent) => {
            setProgress(percent);
        });
        
        setmsg("File Sent Successfully!");
        setIsSending(false);
        setTimeout(() => {
            setSelectedFile(null);
            setProgress(0);
        }, 3000);
    };

    return (
        <div className="min-h-screen min-w-screen bg-gray-950 text-white w-full font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
            
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <nav className="relative z-20 w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                        <Icons.ArrowLeft />
                    </div>
                    <span className="text-sm font-medium">Leave Room</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-md rounded-full border border-gray-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-gray-400">Room: <span className="text-white">{roomid}</span></span>
                </div>
            </nav>

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto">
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full grid md:grid-cols-2 gap-8"
                >
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center h-full">
                        <div className="mb-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Icons.Upload />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Send File</h2>
                        <p className="text-gray-400 text-sm mb-8">Securely transfer files directly to your peer.</p>

                        <div className="w-full relative group">
                            <input 
                                type="file" 
                                onChange={(e) => setSelectedFile(e.target.files[0])} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                disabled={isSending}
                            />
                            <div className={`border-2 border-dashed rounded-2xl p-8 transition-all ${selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50'}`}>
                                {selectedFile ? (
                                    <div className="flex items-center gap-3 justify-center text-green-400">
                                        <Icons.Check />
                                        <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                                        <span className="font-medium">Click to browse</span> or drag file here
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedFile && !isSending && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleSend}
                                className="mt-6 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/20"
                            >
                                Send Now
                            </motion.button>
                        )}

                        {isSending && (
                            <div className="w-full mt-8 space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-400">
                                    <span>Sending...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center h-full relative overflow-hidden">
                        
                        <div className="absolute top-4 right-4">
                        </div>

                        <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                            <Icons.File />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Receive File</h2>
                        <p className="text-gray-400 text-sm mb-8">{msg}</p>

                        {isReceiving && (
                            <div className="w-full mt-auto mb-8 space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-purple-400">
                                    <span>Downloading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {receivedFile && !isReceiving && (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full mt-auto"
                            >
                                <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
                                    <p className="text-sm text-gray-300 truncate mb-1">{receivedFile.name}</p>
                                    <p className="text-xs text-green-400">Transfer Complete</p>
                                </div>
                                <a 
                                    href={receivedFile.url} 
                                    download={receivedFile.name}
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-lg shadow-green-900/20 "
                                >
                                    <Icons.Download /> Download File
                                </a>
                            </motion.div>
                        )}

                        {!isReceiving && !receivedFile && (
                            <div className="mt-auto flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-800 rounded-2xl w-full text-gray-600">
                                <span className="text-sm">Waiting for incoming files...</span>
                            </div>
                        )}
                    </div>
                </motion.div>

            </main>

            <footer className="relative z-10 w-full bg-black py-12 px-6 border-t border-gray-900 mt-12">
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
};

export default Transfer;