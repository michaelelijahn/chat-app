/*
  Warnings:

  - You are about to drop the `EncryptedConversationKeys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EncryptedConversationKeys" DROP CONSTRAINT "EncryptedConversationKeys_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "EncryptedConversationKeys" DROP CONSTRAINT "EncryptedConversationKeys_userId_fkey";

-- DropTable
DROP TABLE "EncryptedConversationKeys";
