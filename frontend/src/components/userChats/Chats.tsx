import { useEffect, useRef, useState } from "react";
import useConversation from "../../zustand/useConversation";
import Chat from "./Chat"
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { authenticatedFetch } from "../../utils/util";
import { decryptChatContent } from "../../utils/ChatKeys";

const Chats = () => {
  const { selectedConversation, setChats, chats } = useConversation();
  const { accessToken, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();
  const ref = useRef<HTMLElement>() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    socket?.on("newChat", async (newChat: ChatType) => {
        try {
            const encryptedAESKey = newChat.senderId === user?.id 
                ? newChat.senderEncryptedAESKey 
                : newChat.receiverEncryptedAESKey;

            if (encryptedAESKey && newChat.iv) {

                const decryptedContent = await decryptChatContent(
                  newChat.encryptedContent,
                  encryptedAESKey,
                  newChat.iv,
                  user?.id as string
              );

                const decryptedChat: ChatType = {
                    ...newChat,
                    encryptedContent: decryptedContent
                };

                setChats([...chats, decryptedChat]);
            } else {
                setChats([...chats, newChat]);
            }
        } catch (error) {
            console.error("Failed to decrypt new message:", error);
            setChats([...chats, newChat]);
        }
    });

    return () => {
        socket?.off("newChat");
    };
}, [socket, user?.id, setChats, chats]); 

  useEffect(() => {
    if (!accessToken) return;

    const getChat = async () => {
      if (!selectedConversation) return;
      
      try {
        setLoading(true);
        setChats([]);

        const { response } = await authenticatedFetch({
          url: `/api/chat/${selectedConversation.id}`,
          accessToken,
          options: { method: "GET" }
        });
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error in getting previous chats");
        }

        if (!data.length) {
            console.log("No messages found");
            setChats([]);
            return;
        }

        const decryptedMessages = await Promise.all(data.map(async (message: any) => {
            try {

                const encryptedAESKey = message.senderId === user?.id 
                    ? message.senderEncryptedAESKey 
                    : message.receiverEncryptedAESKey;

                const decryptedContent = await decryptChatContent(
                  message.encryptedContent,
                  encryptedAESKey,
                  message.iv,
                  user?.id as string
                );

                return {
                    id: message.id,
                    encryptedContent: decryptedContent,
                    senderId: message.senderId,
                    createdAt: message.createdAt
                } as ChatType;
            } catch (error) {
                console.error(`Failed to decrypt message ${message.id}:`, error);
                return {
                    id: message.id,
                    encryptedContent: "Failed to decrypt message",
                    senderId: message.senderId,
                    createdAt: message.createdAt
                } as ChatType;
            }
        }));

        setChats(decryptedMessages);
      } catch (error: any) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    getChat();
  }, [selectedConversation, setChats, accessToken, user?.id]);

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, 100)
  }, [chats]);

  return (
    <div className="px-4 h-[75vh] max-h-[75vh] flex-1 flex-col overflow-auto text-black" ref={ref}>
      {!loading && chats.length === 0 ? (
        <p className="text-center text-black">Send a chat to start conversation</p>
      ) : (
        !loading && chats.map((chat: ChatType) => <Chat key={chat.id} chat={chat} />)
      )}
    </div>
  );
};

export default Chats