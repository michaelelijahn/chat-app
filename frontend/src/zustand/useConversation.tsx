import { create } from "zustand";

interface ConversationState {
    selectedConversation: ConversationType | null;
    chats: ChatType[];
    setSelectedConversation: (conversation: ConversationType | null) => void;
    setChats: (chats: ChatType[]) => void;
    edited: Boolean;
    setEdited: (edited: Boolean) => void;
}

const useConversation = create<ConversationState>((set) => ({
    selectedConversation: null,
    setSelectedConversation: (conversation) =>  set({selectedConversation: conversation}),
    chats: [],
    setChats: (chats) => set({chats}),
    edited: false,
    setEdited: (edited) => set({edited}),
}));

export default useConversation;