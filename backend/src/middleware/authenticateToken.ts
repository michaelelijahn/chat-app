import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma.js";

interface validToken extends JwtPayload {
    userId: string;
}

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: string;
            }
        }
    }
}

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "Unathorized, No Token" });
        }

        const validToken  = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as validToken;

        if (!validToken) {
            return res.status(401).json({ error: "Unauthorized, Invalid Token" });
        }

        const user = await prisma.user.findUnique({ where: { id: validToken.userId }, select: { id: true, username: true, fullName: true, profilePic: true} });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        
        next();
        
    } catch (error: any) {
        console.log("Error : Invalid JWT protectRoute in middleware : ", error.message);
        res.status(500).json({ error: "Internal Server Error "});
    }
}

export default authenticateToken;