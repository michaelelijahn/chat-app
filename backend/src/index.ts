import express from "express";
import cookieParser from "cookie-parser";
import authenticationRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import friendRoutes from "./routes/friend.route.js";
import dotenv from "dotenv";
import { app, server } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3002;

// const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authenticationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friend", friendRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});