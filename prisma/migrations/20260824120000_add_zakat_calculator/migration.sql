-- CreateEnum
CREATE TYPE "ZakatJenisHitung" AS ENUM ('PROFESI', 'MAAL', 'PERTANIAN', 'FITRAH');

-- CreateTable
CREATE TABLE "ZakatConfig" (
    "id" TEXT NOT NULL DEFAULT 'default-zakat-config',
    "hargaEmasPerGram" INTEGER NOT NULL DEFAULT 1450000,
    "hargaBerasPerKg" INTEGER NOT NULL DEFAULT 15000,
    "nisabEmasGram" DOUBLE PRECISION NOT NULL DEFAULT 85,
    "nisabBerasKg" DOUBLE PRECISION NOT NULL DEFAULT 522,
    "nisabPertanianKg" DOUBLE PRECISION NOT NULL DEFAULT 653,
    "zakatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.025,
    "fitrahKgPerJiwa" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZakatConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZakatPerhitunganLog" (
    "id" TEXT NOT NULL,
    "jenis" "ZakatJenisHitung" NOT NULL,
    "inputData" JSONB NOT NULL,
    "hasilNominal" INTEGER NOT NULL,
    "wajibZakat" BOOLEAN NOT NULL,
    "sumber" TEXT NOT NULL DEFAULT 'ERP',
    "userId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZakatPerhitunganLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZakatPerhitunganLog_jenis_createdAt_idx" ON "ZakatPerhitunganLog"("jenis", "createdAt");

-- CreateIndex
CREATE INDEX "ZakatPerhitunganLog_sumber_createdAt_idx" ON "ZakatPerhitunganLog"("sumber", "createdAt");

-- Seed default config
INSERT INTO "ZakatConfig" ("id", "hargaEmasPerGram", "hargaBerasPerKg", "nisabEmasGram", "nisabBerasKg", "nisabPertanianKg", "zakatRate", "fitrahKgPerJiwa", "updatedAt")
VALUES ('default-zakat-config', 1450000, 15000, 85, 522, 653, 0.025, 2.5, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
