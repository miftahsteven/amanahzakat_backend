-- AlterTable
ALTER TABLE "Muzakki" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Mustahik" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- DropIndex
DROP INDEX "Mustahik_nik_key";

-- CreateIndex
CREATE INDEX "Muzakki_deletedAt_idx" ON "Muzakki"("deletedAt");

-- CreateIndex
CREATE INDEX "Mustahik_deletedAt_idx" ON "Mustahik"("deletedAt");

-- Partial unique: NIK must be unique among active (non-deleted) mustahik
CREATE UNIQUE INDEX "Mustahik_nik_active_key" ON "Mustahik"("nik") WHERE "deletedAt" IS NULL;
