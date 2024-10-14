import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import { sendChat, getChats, getContacts  } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/conversations", protectedRoute, getContacts );
router.get("/:id", protectedRoute, getChats);
router.post("/send/:id", protectedRoute, sendChat);

export default router;