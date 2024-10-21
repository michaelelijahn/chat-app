import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getReceiverSocketId, serverIO } from "../socket/socket.js";

const router = express.Router();

router.get("/conversations", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.user;

        const conversations = await prisma.conversation.findMany({
            where: {
              memberIds: {
                has: userId
              }
            },
            select: {
              memberIds: true
            }
        });
        
        const contactIds = Array.from(new Set(
            conversations.flatMap(conv => conv.memberIds.filter(id => id !== userId))
        ));
        
        const contacts = await prisma.user.findMany({
            where: {
              id: {
                in: contactIds
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
});

router.get("/:id", authenticateToken, async (req: Request, res: Response): Promise<any> => {
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
});

router.post("/send/:id", authenticateToken, async (req: Request, res: Response) => {
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

        const receiverSocketId = getReceiverSocketId(targetUserId);

        if (receiverSocketId) {
            serverIO.to(receiverSocketId).emit("newChat", newChat);
        }

        res.status(201).json(newChat);
    } catch (error: any) {
        console.error("Error in sending a message: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }   
});

export default router;