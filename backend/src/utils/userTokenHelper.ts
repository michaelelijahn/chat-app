import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { generateRandomID, hash } from "./hash.js";
import { Request, Response, NextFunction } from "express";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const generateToken = async (userId: string, res: Response) => {
    const accessToken: string = generateAccessToken(userId);
    const refreshToken: string = generateRefreshToken(userId);

    try {
        const hashedAccessToken = hash(accessToken);
        const hashedRefreshToken = hash(refreshToken);

        await prisma.token.create({
            data: {
                userId,
                accessToken: hashedAccessToken,
                refreshToken: hashedRefreshToken,
            }
        });

        res.cookie("accessToken", accessToken, {
            maxAge: FIFTEEN_MINUTES_MS,
            httpOnly: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ?  "none" : "lax",
            secure: process.env.NODE_ENV !== "development",
            path: "/"
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: SEVEN_DAYS_MS,
            httpOnly: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV !== "development" ?  "none" : "lax",
            secure: process.env.NODE_ENV !== "development",
            path: "/"
        });

        res.header("Access-Control-Allow-Credentials", "true");

    } catch (error: any) {
        console.error(error.message);
    }

    return {
        accessToken: accessToken,
        refreshToken : refreshToken,
    };
}

const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId, tokenId: generateRandomID(), type: "access" }, process.env.JWT_ACCESS_SECRET! as string, {
        expiresIn: "15m",
    });
}

const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId, tokenId: generateRandomID(), type: "refresh" }, process.env.JWT_REFRESH_SECRET! as string, {
        expiresIn: "7d"
    });
}
export const getUser = async (refreshToken: string) => {
    try {
        const token = await prisma.token.findFirst({
            where: {
                refreshToken: hash(refreshToken),
            },
            select: {
                user: true
            }
        });

        return token?.user || null;

    } catch (error: any) {
        console.error("failed to verify token: ", error);
        throw error;
    }
}

export const deleteRefreshToken = async (refreshToken: string) => {
    try {
        await prisma.token.delete({
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

export const isTokenValid = async (refreshToken: string) => {
    try {

        const token = await prisma.token.findFirst({
            where: {
                refreshToken: hash(refreshToken)
            }
        });

        if (token === null) {
            return false;
        }

        const validToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

        if (!validToken) {
            return false;
        }

        return true;
    } catch (error) {
        console.error("Invalid Token");
    }
}

export const refreshAndAuthenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ error: "Unathorized, No Access Token and Refresh Token" });
    }

    let validToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

    try {
        if (!validToken || !accessToken) {
            if (!refreshToken) {
                return res.status(401).json({ error: "No Refresh Token Provided" });
            }

            if (! await isTokenValid(refreshToken)) {
                return res.status(401).json({ error: "Unauthorized, Invalid Token" });
            } 
    
            const user = await getUser(refreshToken);
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const { accessToken } = await generateToken(user.id, res);
            await deleteRefreshToken(refreshToken);

            validToken = jwt.verify(accessToken as string, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
        }

        const user = await prisma.user.findUnique({ where: { id: validToken?.userId }, select: { id: true, username: true, fullName: true, loginAttempts: true } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
    
        if (user.loginAttempts <= 0) {
            return res.status(403).json({ error: "This account is banned"});
        }
    
        res.locals.user = user;
        next();
        
    } catch (error: any) {
        console.error(error.message);
        res.status(403).json({ error: "Failed to Refresh and Authenticate Token" });
    }
}