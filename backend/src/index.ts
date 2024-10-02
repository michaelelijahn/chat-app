import express from "express";
import authenticationRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js"

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use("/api/auth", authenticationRoutes);
app.use("/api/chats", chatRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});