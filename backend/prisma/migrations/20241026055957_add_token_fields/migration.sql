/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Token` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isValid` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Token_accessToken_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "accessToken",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isValid" BOOLEAN NOT NULL;
