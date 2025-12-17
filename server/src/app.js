import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import rateLimit from "express-rate-limit";

const app=express();
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
app.use(cors({
    origin:process.env.CORS_ORIGIN || "*",
    credentials:true
}));
app.use(express.json({limit: "16kb"}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
}));
app.use(express.static("public"));
app.use(express.urlencoded({extended:true , limit: "16kb"}));
app.use(cookieParser());

app.use(errorHandler);
app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});

export default app