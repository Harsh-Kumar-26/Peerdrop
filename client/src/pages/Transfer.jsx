import { useSocket } from "../utils/SocketProvider"
import React,{ useState , useCallback} from "react";
import peer from "../services/peer";
import { useParams } from "react-router-dom";
import { useEffect } from "react";


const Transfer=()=>{
    const socket=useSocket();
    const {roomId}=useParams();
    const [localdes, setlocaldes]= useState(null);
    const [remotedes, setremotedes]= useState(null);

    


    useEffect(()=>{
        create_offer();
    },[create_offer]);
    
    return(
        <>
    
    </>
)
}

export default Transfer