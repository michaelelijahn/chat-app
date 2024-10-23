import express from "express";
import prisma from "../db/prisma.js";
import { Request, Response } from "express"
import bcryptjs from "bcryptjs";
import { generateToken, deleteRefreshToken, isTokenValid, getUser, refreshAndAuthenticateToken } from "../utils/userTokenHelper.js";

const router = express.Router();

router.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, fullName, password, passwordConfirmation, publicKey } = req.body;


        if (!username || !fullName || !password || !passwordConfirmation) {
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

        const newUser = await prisma.user.create({
            data: {
                username,
                fullName,
                password : hashedPassword,
                publicKey
            }
        });

        if (newUser) {
            await generateToken(newUser.id, res);

            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                fullName: newUser.fullName,
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

        if (user.loginAttempts === 0) {
            return res.status(400).json({ error: "Too many failed login attempts, please reset your password"});
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            await prisma.user.update({
                where: {
                    username
                },
                data: {
                    loginAttempts: {
                        decrement: 1
                    }
                }
            });
            return res.status(400).json({ error: "Invalid Password" });
        } else {
            await prisma.user.update({
                where: {
                    username
                },
                data: {
                    loginAttempts: 5
                }
            })
        }

        await generateToken(user.id, res);

        res.status(200).json({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            publicKey: user.publicKey,
        });

    } catch (error: any) {
        console.log("Error in logging in user", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/logout", refreshAndAuthenticateToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        console.log("refresh token : ", refreshToken);

        if (! await isTokenValid(refreshToken)) {
            return res.status(401).json({ error: "Unauthorized, Invalid Token" });
        }

        const user = getUser(refreshToken);

        if (user === null) {
            res.status(403).json({ message: "Refresh token is invalid" });
        }

        await deleteRefreshToken(refreshToken);

        res.status(200).json({ message: "User successfully logged out" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;