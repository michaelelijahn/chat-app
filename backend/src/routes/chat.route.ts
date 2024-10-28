import express from "express";
import { refreshAndAuthenticateToken } from "../utils/userTokenHelper.js";
import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getReceiverSocketId, serverIO } from "../socket/socket.js";

const router = express.Router();

router.get("/conversations", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = res.locals.user;

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
            }
        });

        res.status(200).json(contacts);

    } catch (error: any) {
        console.error("Error in getting user's existing chats: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:id", refreshAndAuthenticateToken, async (req: Request, res: Response): Promise<any> => {
    try {

        const { id: targetUserId } = req.params;
        const { id: senderId } = res.locals.user;

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
                    },
                    select: {
                        id: true,
                        encryptedContent: true,
                        senderId: true,
                        createdAt: true,
                        receiverEncryptedAESKey: true,
                        senderEncryptedAESKey: true,
                        iv: true,
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

router.post("/send/:id", refreshAndAuthenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: targetUserId } = req.params;
        const { id: senderId } = res.locals.user;
        const { senderEncryptedPK, receiverEncryptedPK, encryptedContent, iv } = req.body;

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
                encryptedContent,
                senderEncryptedAESKey: senderEncryptedPK,
                receiverEncryptedAESKey: receiverEncryptedPK,
                iv
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
            serverIO.to(receiverSocketId).emit("newChat", {
                id: newChat.id,
                encryptedContent: newChat.encryptedContent,
                senderId: newChat.senderId,
                createdAt: newChat.createdAt,
                senderEncryptedAESKey: newChat.senderEncryptedAESKey,
                receiverEncryptedAESKey: newChat.receiverEncryptedAESKey,
                iv: newChat.iv
            });
        }

        res.status(201).json(newChat);
    } catch (error: any) {
        console.error("Error in sending a message: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }   
});

export default router;