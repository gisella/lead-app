-- CreateEnum
CREATE TYPE "owner_type" AS ENUM ('FIRST', 'SECOND');

-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "owner_type" "owner_type" DEFAULT 'FIRST';
