import { useEffect, useRef, useState } from "react";
import useConversation from "../../zustand/useConversation";
import Chat from "./Chat"
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { authenticatedFetch } from "../../utils/util";

const Chats = () => {
  const { selectedConversation, setChats, chats } = useConversation();
  const { accessToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();
  const ref = useRef<HTMLElement>() as React.MutableRefObject<HTMLDivElement> ;

  useEffect(() => {
    socket?.on("newChat", (newChat) => {
        setChats([...chats, newChat]);
    });
}, [socket, chats, setChats]);

  useEffect(() => {

    if (!accessToken) {
      return;
    }

    const getChat = async () => {
      if (!selectedConversation) return;
      
      try {
        setLoading(true);
        setChats([]);

        const { response } = await authenticatedFetch({
          url: `/api/chat/${selectedConversation.id}`,
          accessToken,
          options: {
            method: "GET",
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error in getting previous chats");
        }

        setChats(data);
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    getChat();
  }, [selectedConversation, setChats]);

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
        !loading && chats.map((chat) => <Chat key={chat.id} chat={chat} />)
      )}
    </div>
  )
}

export default Chats