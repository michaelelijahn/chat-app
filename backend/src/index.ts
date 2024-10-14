import express from "express";
import cookieParser from "cookie-parser";
import authenticationRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import friendRoutes from "./routes/friend.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authenticationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friend", friendRoutes);

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});