import { useAuthContext } from "../../context/AuthContext"

const Chat = ({ chat } : {chat:ChatType}) => {
  const { user } = useAuthContext();
  const fromMe = chat?.senderId === user?.id;

  const chatDirection = fromMe ? "chat-end" : "chat-start";

  const formatTime = (time:string) => {
    const date = new Date(time);
    const hours = addZeroPadding(date.getHours());
    const minutes = addZeroPadding(date.getMinutes());
    return `${hours}:${minutes}`;

  }

  const addZeroPadding = (num:number) => {
    return num.toString().padStart(2, "0");
  }

  return (
    <div className="px-4">
        <div className={`chat ${chatDirection}`}>
            <div className={`chat-bubble text-white bg-indigo-600`}>{chat.content}</div>
            <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">{formatTime(chat.createdAt)}</div>
        </div>
    </div>
  )
}

export default Chat