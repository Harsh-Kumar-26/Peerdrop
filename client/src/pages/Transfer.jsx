import React, { useState, useEffect } from "react";
import peer from "../services/peer";
import { useParams } from "react-router-dom";

const Transfer = () => {
    const { roomid } = useParams();
    const [msg, setmsg] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [receivedFile, setReceivedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);

    // 1. Listen for incoming files (Wrapped in useEffect)
    useEffect(() => {
        const handleReceive = (event) => {
            const {blob, fileName } = event.detail;
            setmsg(`Received: ${fileName}`);
            
            // Create a URL so the user can download it
            const url = URL.createObjectURL(blob);
            setReceivedFile({ url, name: fileName });
        };

        window.addEventListener("fileReceived", handleReceive);

        // CLEANUP: Important! Removes the listener when you leave the page
        return () => {
            window.removeEventListener("fileReceived", handleReceive);
        };
    }, []);

    // 2. Handle Sending
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
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Room ID: {roomid}</h2>
            
            {/* INPUT AREA */}
            <div style={{ margin: "20px 0" }}>
                <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                />
                <button 
                    onClick={handleSend}
                    disabled={!selectedFile || isSending}
                    style={{ marginLeft: "10px" }}
                >
                </button>
                    {isSending ? "Sending..." : "Send"}
                    {isSending && (<div style={{ marginTop: "10px" }}>
                        <progress value={progress} max="100"></progress>
                        <span> {progress}%</span>
                    </div>)}
            </div>

            <h3>Status: {msg}</h3>

            {/* DOWNLOAD AREA */}
            {receivedFile && (
                <div style={{ marginTop: "20px", padding: "10px", background: "#4CAF50", color: "white" }}>
                    <p>File Ready: {receivedFile.name}</p>
                    <a href={receivedFile.url} download={receivedFile.name} style={{ color: "yellow", fontWeight: "bold" }}>
                        Click to Download
                    </a>
                </div>
            )}
        </div>
    );
};

export default Transfer;