import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  });
    console.log("Socket well running");
    
  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    socket.on("join-room",(roomid)=>{
      socket.join(roomid);
      console.log(`Socket ${socket.id} joined room ${roomid}`);
      const room = io.sockets.adapter.rooms.get(roomid);
      const num=room? room.size:0;
      if(num===2)
      socket.to(roomid).emit("user-joined",{id:socket.id});
    });

    socket.on("offer",(data)=>{
      console.log("offer: ",socket.id);
      console.log("roomId: ",data.roomId);
      
      socket.to(data.roomId).emit("offer", {
        from: socket.id,
        sdp: data.sdp
      });
    });

    socket.on("answer",(data)=>{
      console.log("answer: ",socket.id);
      socket.to(data.roomId).emit("answer", {
        from: socket.id,
        sdp: data.sdp
      });
    });


      socket.on("ice-candidate", (data) => {
        console.log("ice-candidate",data);
        
  socket.to(data.roomId).emit("ice-candidate", {
    from: socket.id,
    candidate: data.candidate,
  });
});


    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};