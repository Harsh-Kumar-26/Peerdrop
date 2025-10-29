import React from "react";
import peer from "../services/peer";
import {useNavigate} from "react-router-dom";
import {useSocket} from "../utils/SocketProvider";
import { useCallback,useState, useEffect } from "react";


const Connection = () => {
    const navigate=useNavigate();
    const [room,setroom]=useState("");
    const socket = useSocket();
    const [localdes, setlocaldes]= useState(null);
    const [remotedes, setremotedes]= useState(null);
    

    

    const join=async(e)=>{
        e.preventDefault();
        if(room.trim()===""){
            return;
        }
        socket.emit("join-room",room);
        await peer.initIceCandidateHandler(socket, room);
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

    const handle_ice_candidate=async(data)=>{
    console.log("Received ICE candidate:", data.candidate);
    await peer.addIceCandidate(data.candidate);
    }

// useEffect(()=>{
//     if(socket){        
//         console.log("Room: ",room);
//         peer.initIceCandidateHandler(socket, room);
//     }
//          },[socket,room]);

useEffect(()=>{
    socket.on("user-joined",handle_second_user);
    socket.on("offer",reply_offer);
    socket.on("answer",ans_res);
    socket.on("ice-candidate",handle_ice_candidate);

    return ()=>{
        socket.off("user-joined",handle_second_user);
        socket.off("offer",reply_offer);
        socket.off("answer",ans_res);
        socket.on("ice-candidate",handle_ice_candidate);
    }
},[socket,handle_second_user,reply_offer,ans_res]);


    return (
        <>
            
            <input onChange={(e)=>setroom(e.target.value)} placeholder="RoomID" style={{backgroundColor:"white", color:"black",padding:"10px"}}/>
            <button onClick={join} style={{padding:"10px",marginLeft:"10px",backgroundColor:"blue",color:"white"}}>Enter Room</button>
            <div>{room}</div>
                    <h4>Local Description:</h4>
                   <h4>{localdes ? JSON.stringify(localdes, null, 2) : "Not yet created"}</h4>
                    <h4>Remote Description:</h4>
                   <h4>{remotedes ? JSON.stringify(remotedes, null, 2) : "Not yet created"}</h4>
        </>
    );
}

export default Connection;