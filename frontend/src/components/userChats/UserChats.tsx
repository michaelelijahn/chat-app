import Chats from "./Chats"
import Typing from "./Typing"
import useConversation from "../../zustand/useConversation"
import { useAuthContext } from "../../context/AuthContext"
import Avatar from '@mui/material/Avatar';


const UserChats = () => {
    const { selectedConversation } = useConversation();
    const { user } = useAuthContext();

    return (
        <div className="w-[72%] flex flex-col gap-4">
            {selectedConversation ? 
                <div className=" h-[90vh] py-3 bg-white rounded-xl shadow">
                    <div className="">
                        <div className="border-b-2 pb-2 mb-4">
                            <div className={`flex items-center gap-2 p-2 py-1 cursor-pointer mx-2 rounded-xl`}>
                                <div>
                                    <Avatar src="/broken-image.jpg" />
                                </div>
                                <div className='flex flex-col flex-1'>
                                    <p className='font-semibold'>{selectedConversation?.fullName}</p>
                                </div>
                            </div>
                        </div>
                        <Chats/>
                        <Typing/>
                    </div>
                </div>
            : 
                <div className=" h-[90vh] py-3 bg-white rounded-xl shadow flex flex-col justify-center items-center">
                    <h1 className="text-4xl mb-4 flex gap-2">Welcome <h1 className="font-bold text-blue-600">{user?.fullName} 👋</h1></h1>
                    <h1 className="text-2xl">Go Ahead and Start Chatting</h1>
                </div>
            }
        </div>
    )
}

export default UserChats