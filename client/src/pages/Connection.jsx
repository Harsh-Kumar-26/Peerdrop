import React from "react";
import peer from "../services/peer";
import {useNavigate} from "react-router-dom";
import {useSocket} from "../utils/Socketprovider";
import { useCallback,useState, useEffect } from "react";
import { use } from "react";


const Connection = () => {
    const navigate=useNavigate();
    const [room,setroom]=useState("");
    const socket = useSocket();
    const [localdes, setlocaldes]= useState(null);
    const [remotedes, setremotedes]= useState(null);

    // const createroom=()=>{
    //     const roomid=Math.random().toString(36).substring(2,10);
    //     setroom(roomid);
    // };

    // useEffect(()=>{
    //     createroom();
    // },[]);
    

    
    useEffect(() => {
    const handleIceCandidate = (event) => {
    const candidate = event.detail;
    socket.emit("ice-candidate", { candidate, roomId: room });
    console.log("Dispatching ICE candidate:", candidate);
  };

  window.addEventListener("iceCandidate", handleIceCandidate);

  return () => {
    window.removeEventListener("iceCandidate", handleIceCandidate);
  };
}, [socket,room]);

useEffect(()=>{
const next_page=()=>{
    navigate(`/transfer/${room}`);
};

window.addEventListener("peerConnected",next_page);

return ()=>{
    window.removeEventListener("peerConnected",next_page);
}
},[navigate,room]);


    const join=async(e)=>{
        e.preventDefault();
        if(room.trim()===""){
            return;
        }
        socket.emit("join-room",room);
    }
    
    const create_offer=async()=>{
        const offer= await peer.getOffer();
        console.log("Offer: ",offer);
        setlocaldes(offer);
        console.log("Roomid: ",room);
        
        socket.emit("offer",{sdp:offer, roomId:room});
    }

const handle_second_user = (data)=>{
    const {id}=data;
    console.log("User 2 joined ",id);
    create_offer();
}



    const reply_offer=async(res)=>{
        console.log(res.sdp);
        setremotedes(res.sdp);
        const answer=await peer.getAnswer(res.sdp);
        console.log("answer: ",answer);
        setlocaldes(answer);
        socket.emit("answer",{sdp:answer, roomId:room});
    }

    const ans_res=async(res)=>{
        console.log(res.sdp);
        setremotedes(res.sdp);
        const response=await peer.setRemoteDescription(res.sdp);
        console.log("response: ",response);
    }

    const ice_reply=async(candidate)=>{
        console.log("Received ICE candidate:", candidate);
        await peer.addIceCandidate(candidate);
    }
useEffect(()=>{
    peer.reset();
},[]);
    

useEffect(()=>{
    socket.on("user-joined",handle_second_user);
    socket.on("offer",reply_offer);
    socket.on("answer",ans_res);
    socket.on("ice-candidate",ice_reply);
    // socket.on("ice-candidate",handle_ice_candidate);

    return ()=>{
        socket.off("user-joined",handle_second_user);
        socket.off("offer",reply_offer);
        socket.off("answer",ans_res);
        socket.off("ice-candidate",ice_reply);
        // socket.on("ice-candidate",handle_ice_candidate);
    }
},[socket,handle_second_user,reply_offer,ans_res]);


    return (
        <>
            <form onSubmit={join} style={{display:"flex",alignItems:"center",justifyContent:"center",marginTop:"20px"}}>
            <input onChange={(e)=>setroom(e.target.value)} placeholder="RoomID" style={{backgroundColor:"white", color:"black",padding:"10px"}}/>
            <button type="submit" style={{padding:"10px",marginLeft:"10px",backgroundColor:"blue",color:"white"}}>Enter Room</button>
            </form>
            <div>{room}</div>
                    <h4>Local Description:</h4>
                   <h4>{localdes ? JSON.stringify(localdes, null, 2) : "Not yet created"}</h4>
                    <h4>Remote Description:</h4>
                   <h4>{remotedes ? JSON.stringify(remotedes, null, 2) : "Not yet created"}</h4>
        </>
    );
}

export default Connection;