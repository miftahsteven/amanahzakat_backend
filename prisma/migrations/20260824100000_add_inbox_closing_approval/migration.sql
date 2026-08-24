-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "linkScreen" TEXT,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosingPeriode" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "stepRekon" BOOLEAN NOT NULL DEFAULT false,
    "stepJurnal" BOOLEAN NOT NULL DEFAULT false,
    "stepSaldo" BOOLEAN NOT NULL DEFAULT false,
    "stepLaporan" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosingPeriode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalPengajuan" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "pengaju" TEXT NOT NULL,
    "tahap" INTEGER NOT NULL DEFAULT 1,
    "tipe" TEXT NOT NULL DEFAULT 'penyaluran',
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "penyaluranId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalPengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClosingPeriode_periode_key" ON "ClosingPeriode"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalPengajuan_ref_key" ON "ApprovalPengajuan"("ref");
