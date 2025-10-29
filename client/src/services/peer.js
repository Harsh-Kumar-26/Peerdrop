class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:3478",
            ],
          },
        ],
      });
    }
  }

   initIceCandidateHandler(socket, roomId) {
    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };
  }


  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
  
  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setRemoteDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

async addIceCandidate(candidate) {
    try {
      await this.peer.addIceCandidate(candidate);
      console.log("Added ICE candidate:", candidate);
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  }

  
}

export default new PeerService();