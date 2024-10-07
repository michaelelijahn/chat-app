import express from "express";
import { login, logout, register, getUser } from '../controllers/auth.controller.js';
import checkValidToken from "../middleware/checkValidToken.js";

const router = express.Router();

router.get("/user", checkValidToken, getUser);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;