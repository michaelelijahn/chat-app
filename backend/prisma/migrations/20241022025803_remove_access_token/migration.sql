/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Token_accessToken_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "accessToken";
