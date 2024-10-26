import express from "express";
import prisma from "../db/prisma.js";
import { Request, Response } from "express"
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
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
            const { accessToken } = await generateToken(newUser.id, newUser.username, res);
            res.status(201).json({
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    fullName: newUser.fullName,
                },
                accessToken,
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

        const { accessToken } = await generateToken(user.id, user.username, res);
        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                publicKey: user.publicKey,
            },
            accessToken,
        });
    } catch (error: any) {
        console.log("Error in logging in user", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/logout", refreshAndAuthenticateToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        await deleteRefreshToken(refreshToken);
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "User successfully logged out" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/auth/refresh", async (req: Request, res: Response): Promise<any> => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token" });
        }

        const isValid = await isTokenValid(refreshToken);
        if (!isValid) {
            res.clearCookie("refreshToken");
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

        const { accessToken } = await generateToken(decoded.id, decoded.username, res);
        await deleteRefreshToken(refreshToken);

        res.status(200).json({
            accessToken,
        });
    } catch (error: any) {
        console.log("Error in refresing user token", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/auth/publicKey", refreshAndAuthenticateToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: userId } = res.locals.user;

        const publicKey = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                publicKey: true,
            }
        });

        res.status(200).json({ publicKey });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to get public key" });
    }
});


export default router;