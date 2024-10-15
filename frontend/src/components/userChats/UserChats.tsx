import { useState } from "react"
import Profile from "../sidebar/Profile"
import Chats from "./Chats"
import Typing from "./Typing"

const UserChats = () => {
    const [selectedChat, setSelectedChat] = useState(false);

    return (
        <div className="w-[72%] flex flex-col gap-4">
            {selectedChat ? 
                <div className=" h-[90vh] py-3 bg-white rounded-xl shadow">
                    <div className="">
                        <div className="border-b-2 pb-2 mb-4">
                            <Profile />
                        </div>

                        {/* Messages */}
                        <Chats/>

                        {/* Typing */}
                        <Typing/>
                    </div>
                </div>
            : 
                <div className=" h-[90vh] py-3 bg-white rounded-xl shadow flex justify-center items-center">
                    <h1 className="text-6xl">No Chats</h1>
                </div>
            }
        </div>
    )
}

export default UserChats