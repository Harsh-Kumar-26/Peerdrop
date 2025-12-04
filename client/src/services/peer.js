class PeerService {
  constructor() {
    this.peer = null;
    this.dataChannel = null;
    this.receiveChannel = null;
    this.fileBuffer = [];
    this._initpeer();
    this.remoteCandidatesQueue = [];
    this.datatype = null;
  }

  _initpeer() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:3478",
            ],
          },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          }
        ],
      });

      this.dataChannel = this.peer.createDataChannel("file-transfer");
      this.dataChannel.onopen = () => console.log("Local Data Channel Open");
      this.dataChannel.onclose = () => console.log("Local Data Channel Closed");

      this.peer.ondatachannel = (event) => {
        console.log("Received Remote Data Channel");
        this.receiveChannel = event.channel;
        
        // IMPORTANT: Force the channel to give us ArrayBuffers (raw bytes)
        this.receiveChannel.binaryType = "arraybuffer"; 

        this.receiveChannel.onmessage = (event) => {
          const data = event.data;
          
          // String messages (Metadata or EOF) are handled normally
          if (typeof data === "string") {
            if (data === "EOF") {
              console.log("File transfer done");
              
              // Reassemble the file from the ArrayBuffers
              const file = new Blob(this.fileBuffer, { type: this.datatype?.type });
              
              window.dispatchEvent(
                new CustomEvent("fileReceived", { 
                  detail: { 
                    blob: file, 
                    fileName: this.datatype?.name || "unknown_file" 
                  } 
                })
              );
              
              // Cleanup
              this.fileBuffer = [];
              this.datatype = null;
            } else {
              // It's the metadata JSON
              try {
                this.datatype = JSON.parse(data);
                console.log("Receiving file:", this.datatype?.name);
              } catch (err) {
                console.error("Failed to parse metadata", err);
              }
            }
          } else {
            // It's a binary chunk (ArrayBuffer), add it to our buffer
            this.fileBuffer.push(data);
          }
        };

        this.receiveChannel.onopen = () => console.log("Remote Data Channel Open");
      };

      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          window.dispatchEvent(
            new CustomEvent("iceCandidate", { detail: event.candidate })
          );
        }
      };

      this.peer.onconnectionstatechange = () => {
        if (this.peer.connectionState === "connected") {
          console.log("Peers connected! Dispatching event...");
          window.dispatchEvent(new CustomEvent("peerConnected"));
        }
      };
    }
  }

  async _flushCandidatesQueue() {
    if (this.remoteCandidatesQueue.length > 0) {
      for (const candidate of this.remoteCandidatesQueue) {
        try {
          await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding queued candidate:", error);
        }
      }
      this.remoteCandidatesQueue = [];
    }
  }

  async sendFile(file,onProgress) {
    this._initpeer();

    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      return console.error("Connection not ready to send files");
    }

    // 1. Send Metadata
    const metadata = JSON.stringify({
      name: file.name,
      type: file.type,
      size: file.size
    });
    this.dataChannel.send(metadata);

    // 2. Send File Chunks
    const CHUNK_SIZE = 16 * 1024; 
    console.log(`Sending file: ${file.name} (${file.size} bytes)`);

    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      
      // CRITICAL FIX: Convert Blob to ArrayBuffer before sending
      const buffer = await chunk.arrayBuffer(); 
      
      this.dataChannel.send(buffer);
      
      offset += CHUNK_SIZE;

      // Progress callback
      if (onProgress) {
        const percentage = Math.round((Math.min(offset, file.size) / file.size) * 100);
          onProgress(percentage);
      }
      
      // Backpressure handling to prevent crash
      const MAX_BUFFER_AMOUNT = 1 * 1024 * 1024; // 1MB
      if (this.dataChannel.bufferedAmount > MAX_BUFFER_AMOUNT) {
        while (this.dataChannel.bufferedAmount > MAX_BUFFER_AMOUNT) {
          await new Promise(r => setTimeout(r, 5));
        }
      }
    }

    // 3. Send End of File
    this.dataChannel.send("EOF"); 
    console.log("File sent successfully");
  }

  reset() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
      this.fileBuffer = [];
      this.datatype = null;
      console.log("Peer connection reset");
    }
  }

  async getOffer() {
    this._initpeer();
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
  
  async getAnswer(offer) {
    this._initpeer();
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      await this._flushCandidatesQueue();
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setRemoteDescription(ans) {
    this._initpeer();
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      await this._flushCandidatesQueue();
    }
  }

  async addIceCandidate(candidate) {
    this._initpeer();
    try {
      if (!this.peer.remoteDescription) {
        this.remoteCandidatesQueue.push(candidate);
        return;
      }
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  }
}

export default new PeerService();