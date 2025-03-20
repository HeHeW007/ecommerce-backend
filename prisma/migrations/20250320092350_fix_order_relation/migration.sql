/*
  Warnings:

  - Added the required column `image` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "image" TEXT; -- Add image column (nullable by default)
ALTER TABLE "Product" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP; -- Add updatedAt column with a default value