-- CreateEnum
CREATE TYPE "status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('NEW', 'PROCESSING', 'DONE', 'ERROR', 'REJECTED');

-- CreateTable
CREATE TABLE "leads" (
    "id" BIGSERIAL NOT NULL,
    "phone_nr" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_requests" (
    "id" BIGSERIAL NOT NULL,
    "lead_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "house_worth" BIGINT NOT NULL,
    "city" TEXT NOT NULL,
    "request_status" "request_status" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "lead_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" BIGSERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "monthly_income" BIGINT NOT NULL,
    "monthly_payments" INTEGER NOT NULL,
    "lead_request_id" BIGINT NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_nr_key" ON "leads"("phone_nr");

-- CreateIndex
CREATE INDEX "owners_lead_request_id_idx" ON "owners"("lead_request_id");

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_lead_request_id_fkey" FOREIGN KEY ("lead_request_id") REFERENCES "lead_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
