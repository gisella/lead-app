-- AlterTable
ALTER TABLE "lead_requests" ALTER COLUMN "request_status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "status" DROP NOT NULL;
