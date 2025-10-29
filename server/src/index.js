import dotenv from "dotenv";

import {createServer} from "http";
import app from "./app.js";
import {initSocket} from "./socket.js"; 

dotenv.config();

const server = createServer(app);
console.log("Socket server created");

initSocket(server);

const PORT = process.env.PORT || 8000;
// connectDB()
try{
    server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
catch(error){
  console.error("Database connection failed:", error);
};