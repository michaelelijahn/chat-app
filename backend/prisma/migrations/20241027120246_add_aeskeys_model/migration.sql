-- DropEnum
DROP TYPE "Gender";

-- CreateTable
CREATE TABLE "EncryptedConversationKeys" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,

    CONSTRAINT "EncryptedConversationKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EncryptedConversationKeys_conversationId_userId_key" ON "EncryptedConversationKeys"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "EncryptedConversationKeys" ADD CONSTRAINT "EncryptedConversationKeys_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncryptedConversationKeys" ADD CONSTRAINT "EncryptedConversationKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
