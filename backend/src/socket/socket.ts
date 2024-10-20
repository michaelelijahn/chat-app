import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const serverIO = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "DELETE"],
    }
});

const userSockets: { [key: string]: string } = {};

export const getReceiverSocketId = (receiverId: string) => {
    return userSockets[receiverId];
};

serverIO.on("connection", (socket) => {
    console.log("a user connected ", socket.id);
    const userId = socket.handshake.query.userId as string;

    if (userId) {
        userSockets[userId] = socket.id;
    }

    serverIO.emit("getOnlineUsers", Object.keys(userSockets));

    socket.on("disconnect", () => {
        console.log("user disconnected ", socket.id);
        delete userSockets[userId];
        serverIO.emit("getOnlineUsers", Object.keys(userSockets));
    });
});

export { app, serverIO, server }
