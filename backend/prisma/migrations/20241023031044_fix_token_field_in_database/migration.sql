/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "expiresAt",
ADD COLUMN     "accessToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");
