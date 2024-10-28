import { useState } from "react"
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { authenticatedFetch } from "../../utils/util";
import { encryptAESChatKey, encryptChatContent, generateAESChatKey, decryptChatContent } from "../../utils/ChatKeys";

const Typing = () => {
    const [loading, setLoading] = useState(false);
    const { selectedConversation, setChats, chats, setEdited } = useConversation();
    const { accessToken, user } = useAuthContext();
    const [input, setInput] = useState("");

    const getFriendPublicKey = async (friendId: string) => {
        if (!accessToken) return;
        try {
            const { response } = await authenticatedFetch({
                url: `/api/auth/publicKey/${friendId}`,
                accessToken,
                options: {
                  method: "GET",
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data?.publicKey; 
            }

        } catch (error: any) {
            console.error(error);
        }
    }

    const sendChat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedConversation || !input) return;
        if (!accessToken) return;
        try {
            setLoading(true);
            const aesKey = await generateAESChatKey();

            const { encryptedContent, iv } = await encryptChatContent(input, aesKey);

            const senderPK = sessionStorage.getItem("publicKey") as string;
            const receiverPK = await getFriendPublicKey(selectedConversation.id); 

            const senderEncryptedPK = await encryptAESChatKey(senderPK, aesKey);
            const receiverEncryptedPK = await encryptAESChatKey(receiverPK, aesKey);

            const { response } = await authenticatedFetch({
                url: `/api/chat/send/${selectedConversation.id}`,
                accessToken,
                options: {
                    method: "POST",
                    body: JSON.stringify({
                        senderEncryptedPK,
                        receiverEncryptedPK,
                        encryptedContent,
                        iv,
                    }),
                }
            });
         
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            const chatData: ChatType = {
                id: data.id,
                encryptedContent: encryptedContent,
                senderId: data.senderId,
                createdAt: data.createdAt
            };

            try {
                const decryptedContent = await decryptChatContent(
                    encryptedContent,
                    senderEncryptedPK,
                    iv,
                    user?.id as string
                );
                chatData.encryptedContent = decryptedContent;
            } catch (error) {
                console.error("Failed to decrypt own message:", error);
            }
            
            setChats([...chats, chatData ]);
            setEdited(true);
        } catch (error: any) {
            console.log(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
            setInput("");
        }
    }

  return (
        <form onSubmit={sendChat}>
            <label className="sr-only">Your message</label>
            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <textarea id="chat" rows={1} className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your message..." value={input} onChange={(e) => setInput(e.target.value)}></textarea>
                <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                    <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                    </svg>
                </button>
            </div>
        </form>
    )
}

export default Typing