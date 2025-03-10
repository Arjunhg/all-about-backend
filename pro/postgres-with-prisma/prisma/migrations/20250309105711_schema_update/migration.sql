/*
  Warnings:

  - You are about to drop the column `publishData` on the `Book` table. All the data in the column will be lost.
  - Added the required column `publishDate` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "publishData",
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL;
