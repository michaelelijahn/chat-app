import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import prisma from "../db/prisma.js";
import { Request, Response } from "express"
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

router.get("/user", authenticateToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ error: "User not found"});
        }

        res.status(200).json({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            profilePic: user.profilePic,
        })

    } catch (error: any) {
        console.log("Error in getting current user");
        res.status(500).json({ error: "Internal Server Error "});
    }
});

router.post("/register", async (req: Request, res: Response): Promise<any> => {

    try {
        const { username, fullName, password, passwordConfirmation, gender } = req.body;

        if (!username || !fullName || !password || !passwordConfirmation || !gender) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }

        if (password !== passwordConfirmation) {
            return res.status(400).json({ error : "Password does not match" });
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const maleAvatar = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleAvatar = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = await prisma.user.create({
            data: {
                username,
                fullName,
                password : hashedPassword,
                gender,
                profilePic : gender === "male" ? maleAvatar : femaleAvatar,
            }
        });

        if (newUser) {

            generateToken(newUser.id, res);

            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error: any) {
        console.log("Error in registering user", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(400).json({ error: "Invalid Username" });
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid Password" });
        }

        generateToken(user.id, res);

        res.status(200).json({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            profilePic: user.profilePic
        });

    } catch (error: any) {
        console.log("Error in logging in user", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/logout", async (req: Request, res: Response) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "User successfully logged out" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;