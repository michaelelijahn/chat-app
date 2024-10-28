import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { hash } from "./hash.js";
import { Request, Response, NextFunction } from "express";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const generateToken = async (userId: string, username: string, res: Response) => {
    const accessToken: string = generateAccessToken(userId, username);
    const refreshToken: string = generateRefreshToken(userId);

    try {
        const hashedRefreshToken = hash(refreshToken);

        await prisma.token.create({
            data: {
                userId,
                refreshToken: hashedRefreshToken,
                isValid: true,
                expiresAt: new Date(Date.now() + SEVEN_DAYS_MS)
            }
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: SEVEN_DAYS_MS,
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });

    } catch (error: any) {
        console.error(error.message);
    }

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
    };
}

const generateAccessToken = (userId: string, username: string): string => {
    return jwt.sign({ userId, username, type: "access" }, process.env.JWT_ACCESS_SECRET! as string, {
        expiresIn: "15m",
    });
}

const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET! as string, {
        expiresIn: "7d"
    });
}

const getUser = async (userId: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });

        return user || null;
    } catch (error) {
        console.error("failed to get user: ", error);
        throw error;
    }
}

export const deleteRefreshToken = async (refreshToken: string) => {
    try {
        await prisma.token.deleteMany({
            where: {
                refreshToken: hash(refreshToken)
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to delete token");
        return false;
    }
}

const isTokenValid = async (refreshToken: string) => {
    try {

        const token = await prisma.token.findFirst({
            where: {
                refreshToken: hash(refreshToken),
                isValid: true,
                expiresAt: {
                    gt: new Date()
                },
            }
        });

        return !!token;
    } catch (error) {
        console.error("Invalid Token");
    }
}

export const refreshAndAuthenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        const refreshToken = req.cookies?.refreshToken;

        if (!accessToken && !refreshToken) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
                const user = await getUser(decoded.userId);
                res.locals.user = user;
                return next();
            } catch (error: any) {
                if (error.name !== 'TokenExpiredError' || !refreshToken) {
                    res.status(401).json({ error: error.message });
                    return;
                }
            }
        }

        if (!refreshToken) {
            return res.status(401).json({ error: "No Refresh Token Provided" });
        }

        try {

            if (! await isTokenValid(refreshToken)) {
                throw new Error('Invalid refresh token');
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
            await generateToken(decoded.userId, decoded.username, res);

            const hashedRefreshToken = hash(refreshToken);

            await prisma.token.updateMany({
                where: {
                    refreshToken: hashedRefreshToken,
                    userId: decoded.userId,
                },
                data: {
                    isValid: false,
                }
            });
            const user = await getUser(decoded.userId);
            res.locals.user = user;
            return next();

        } catch (error) {
            res.clearCookie('refreshToken');
            res.status(401).json({ error: "Authentication failed" });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}