/*
  Warnings:

  - You are about to drop the column `contraints` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "contraints",
ADD COLUMN     "constraints" TEXT;
