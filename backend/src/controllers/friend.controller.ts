import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const addFriend = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;
        const { id: friendId } = req.params;

        // const result = await prisma.$transaction([
        //     prisma.user.update({
        //         where: {
        //             id: userId
        //         },
        //         data: {
        //             friends: {
        //                 connect: { id: friendId }
        //             },
        //         }
        //     }),
        //     prisma.user.update({
        //         where: { 
        //             id: friendId
        //         },
        //         data: {
        //             friends: {
        //                 connect: { id: userId }
        //             }
        //         }
        //     })
        // ]);

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
}

export const deleteFriend = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;
        const { id: friendId } = req.params;

        // const result = await prisma.$transaction([
        //     prisma.user.update({
        //         where: {
        //             id: userId
        //         },
        //         data: {
        //             friends: {
        //                 disconnect: { id: friendId }
        //             },
        //         }
        //     }),
        //     prisma.user.update({
        //         where: { 
        //             id: friendId
        //         },
        //         data: {
        //             friends: {
        //                 disconnect: { id: userId }
        //             }
        //         }
        //     })
        // ]);

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
}

export const getAllFriends = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                friends: {
                    select: { id: true, fullName: true, profilePic: true }
                }
            }
        });

        if (user && user.friends) {
            res.status(200).json(user.friends);
        } else {
            res.status(200).json([]);
        }

        // res.status(200).json(friends);
    } catch (error: any) {
        console.error("Error in getting friends", error.message);
        res.status(500).json("Internal Server Error");
    }
}

export const getSuggestedFriends = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;

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
                profilePic: true,
            },
            take: 5
        });
        
        res.status(200).json(suggested);
    } catch (error: any) {
        console.error("Error in getting suggested friends", error.message);
        res.status(500).json("Internal Server Error");
    }
}