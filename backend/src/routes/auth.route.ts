import express from "express";
import { login, logout, register, getUser } from '../controllers/auth.controller.js';
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/user", protectedRoute, getUser);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;