/*
  Warnings:

  - You are about to drop the column `content` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `encryptedContent` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverEncryptedAESKey` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderEncryptedAESKey` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "content",
ADD COLUMN     "encryptedContent" TEXT NOT NULL,
ADD COLUMN     "receiverEncryptedAESKey" TEXT NOT NULL,
ADD COLUMN     "senderEncryptedAESKey" TEXT NOT NULL;
