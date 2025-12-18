-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageMetadata" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "ImageStatus" NOT NULL DEFAULT 'PENDING',
    "objectKey" TEXT,
    "format" TEXT,
    "error" TEXT,
    "params" JSONB,
    "width" INTEGER,
    "height" INTEGER,
    "seed" INTEGER,
    "modelCount" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "ImageMetadata_userId_createdAt_idx" ON "ImageMetadata"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImageMetadata_status_idx" ON "ImageMetadata"("status");

-- AddForeignKey
ALTER TABLE "ImageMetadata" ADD CONSTRAINT "ImageMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
