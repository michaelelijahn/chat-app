import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const sendChat = async (req: Request, res: Response) => {
    try {
        const { chat } = req.body;
        const { id: targetUserId } = req.params;
        const { id: senderId } = req.user;

        let conversation = await prisma.conversation.findFirst({
            where: {
                memberIds: {
                    hasEvery: [senderId, targetUserId],
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    memberIds: {
                        set: [senderId, targetUserId]
                    }
                }
            });
        };

        const newChat = await prisma.chat.create({
            data: {
                conversationId: conversation.id,
                senderId,
                content: chat,
            }
        });

        if (newChat) {
            conversation = await prisma.conversation.update({ 
                where: {
                    id: conversation.id
                },
                data: {
                    chats: {
                        connect: {
                            id: newChat.id
                        }
                    }
                }
            });
        }

        res.status(201).json(newChat);
    } catch (error: any) {
        console.error("Error in sending a message: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }   
}

export const getChats = async (req: Request, res: Response): Promise<any> => {
    try {

        const { id: targetUserId } = req.params;
        const { id: senderId } = req.user;

        const conversation = await prisma.conversation.findFirst({
            where: {
                memberIds: {
                    hasEvery: [senderId, targetUserId]
                }
            },
            include: {
                chats: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(200).json([]);
        }

        return res.status(200).json(conversation.chats);
        
    } catch (error: any) {
        console.error("Error in getting chats: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getContacts = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;

        const contacts = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                }
            },
            select: {
                id: true,
                fullName: true,
                profilePic: true,
            }
        });

        res.status(200).json(contacts);

    } catch (error: any) {
        console.error("Error in getting user's existing chats: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}