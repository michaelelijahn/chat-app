-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_refreshToken_key" ON "Token"("refreshToken");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
