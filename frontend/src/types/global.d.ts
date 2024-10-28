type ConversationType = {
    id: string;
    fullName: string;
    profilePic: string;
}

type ChatType = {
    id: string;
    encryptedContent: string;
    senderId: string;
    createdAt: string;
    senderEncryptedAESKey?: string;
    receiverEncryptedAESKey?: string;
    iv?: string;
}

type ProfileType = {
    id: string;
    fullName: string;
    profilePic: string;
  };