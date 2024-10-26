import express from "express";
import { refreshAndAuthenticateToken } from "../utils/userTokenHelper.js";
import { Request, Response } from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

router.get("/all", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = res.locals.user;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                friends: {
                    select: { id: true, fullName: true }
                }
            }
        });

        if (user && user.friends) {
            res.status(200).json(user.friends);
        } else {
            res.status(200).json([]);
        }

    } catch (error: any) {
        console.error("Error in getting friends", error.message);
        res.status(500).json("Internal Server Error");
    }
});

router.get("/suggested", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = res.locals.user;

        const currentUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                friends: {
                    select: {
                        id: true
                    }
                }
            }
        });

        const userFriends = currentUser?.friends.map((friend) => friend.id);

        const suggested = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: userId } },
                    { id: { notIn: userFriends } },
                ]
            },
            select: {
                id: true, 
                fullName: true,
            },
            take: 5
        });
        
        res.status(200).json(suggested);
    } catch (error: any) {
        console.error("Error in getting suggested friends", error.message);
        res.status(500).json("Internal Server Error");
    }
});

router.post("/add/:id", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = res.locals.user;
        const { id: friendId } = req.params;

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { friends: { connect: { id: friendId } } },
                include: { friends: true, friendsOf: true }
            }),
            prisma.user.update({
                where: { id: friendId },
                data: { friendsOf: { connect: { id: userId } } },
                include: { friends: true, friendsOf: true }
            })
        ]);

        res.status(200).json(result);
        
    } catch (error: any) {
        console.error("Error in adding friend", error.message);
        res.status(500).json("Internal Server Error");
    }
});

router.delete("/delete/:id", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = res.locals.user;
        const { id: friendId } = req.params;

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { friends: { disconnect: { id: friendId } } },
                include: { friends: true, friendsOf: true }
            }),
            prisma.user.update({
                where: { id: friendId },
                data: { friendsOf: { disconnect: { id: userId } } },
                include: { friends: true, friendsOf: true }
            })
        ]);

        res.status(200).json(result);

    } catch (error: any) {
        console.error("Error in deleting friend", error.message);
        res.status(500).json("Internal Server Error");
    }
});

export default router;