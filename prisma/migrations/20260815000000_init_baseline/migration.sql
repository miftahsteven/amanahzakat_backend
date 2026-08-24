-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nomorHp" TEXT,
    "nip" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOtpVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "kodeRole" TEXT NOT NULL,
    "namaRole" TEXT NOT NULL,
    "deskripsi" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "kodePermission" TEXT NOT NULL,
    "namaPermission" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Muzakki" (
    "id" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "nikAtauNpwp" TEXT NOT NULL,
    "hp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "totalSetoran" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transaksiCount" INTEGER NOT NULL DEFAULT 0,
    "tanggalBergabung" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Muzakki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPenerimaan" (
    "id" TEXT NOT NULL,
    "noKwitansi" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "muzakkiId" TEXT NOT NULL,
    "jenisZis" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "kanal" TEXT NOT NULL,
    "rekeningTujuan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiPenerimaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mustahik" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategoriAsnaf" TEXT NOT NULL,
    "hp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "jumlahTanggungan" INTEGER NOT NULL,
    "penghasilanBulanan" DOUBLE PRECISION NOT NULL,
    "rekeningBank" TEXT NOT NULL,
    "statusSurvei" TEXT NOT NULL,
    "skorKelayakan" INTEGER NOT NULL DEFAULT 80,
    "totalBantuanDiterima" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mustahik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramZis" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pilar" TEXT NOT NULL,
    "paguAnggaran" DOUBLE PRECISION NOT NULL,
    "terpakai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetPenerima" INTEGER NOT NULL,
    "realisasiPenerima" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Berjalan',
    "penanggungJawab" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramZis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPenyaluran" (
    "id" TEXT NOT NULL,
    "noPenyaluran" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "mustahikId" TEXT NOT NULL,
    "asnaf" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "metodePembayaran" TEXT NOT NULL,
    "rekeningTujuan" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "potonganAmil" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "danaMustahik" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiPenyaluran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountCoA" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "grup" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountCoA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurnalEntry" (
    "id" TEXT NOT NULL,
    "noJurnal" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "debitKode" TEXT NOT NULL,
    "debitNama" TEXT NOT NULL,
    "kreditKode" TEXT NOT NULL,
    "kreditNama" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Posted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JurnalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSimba" (
    "id" TEXT NOT NULL,
    "kodeForm" TEXT NOT NULL,
    "namaForm" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "totalNilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSimba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitraPenyalur" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bentukLembaga" TEXT NOT NULL,
    "noMou" TEXT NOT NULL,
    "masaKerjasama" TEXT NOT NULL,
    "picKontak" TEXT NOT NULL,
    "hpPic" TEXT NOT NULL,
    "totalPenyaluran" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statusLaporanLpj" TEXT NOT NULL DEFAULT 'Terverifikasi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MitraPenyalur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpzCabang" (
    "id" TEXT NOT NULL,
    "kodeUpz" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "totalPenghimpunan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPenyaluran" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hakPengelolaanPct" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "statusKepatuhan" TEXT NOT NULL DEFAULT 'Patuh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpzCabang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmilKaryawan" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "gajiPokok" DOUBLE PRECISION NOT NULL,
    "tunjanganAmil" DOUBLE PRECISION NOT NULL,
    "potonganZakat" DOUBLE PRECISION NOT NULL,
    "keikutsertaanPayroll" BOOLEAN NOT NULL DEFAULT true,
    "statusKerja" TEXT NOT NULL DEFAULT 'Tetap',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmilKaryawan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_kodeRole_key" ON "Role"("kodeRole");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_kodePermission_key" ON "Permission"("kodePermission");

-- CreateIndex
CREATE UNIQUE INDEX "Muzakki_nomor_key" ON "Muzakki"("nomor");

-- CreateIndex
CREATE UNIQUE INDEX "TransaksiPenerimaan_noKwitansi_key" ON "TransaksiPenerimaan"("noKwitansi");

-- CreateIndex
CREATE UNIQUE INDEX "Mustahik_nik_key" ON "Mustahik"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "TransaksiPenyaluran_noPenyaluran_key" ON "TransaksiPenyaluran"("noPenyaluran");

-- CreateIndex
CREATE UNIQUE INDEX "AccountCoA_kode_key" ON "AccountCoA"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "JurnalEntry_noJurnal_key" ON "JurnalEntry"("noJurnal");

-- CreateIndex
CREATE UNIQUE INDEX "FormSimba_kodeForm_key" ON "FormSimba"("kodeForm");

-- CreateIndex
CREATE UNIQUE INDEX "MitraPenyalur_noMou_key" ON "MitraPenyalur"("noMou");

-- CreateIndex
CREATE UNIQUE INDEX "UpzCabang_kodeUpz_key" ON "UpzCabang"("kodeUpz");

-- CreateIndex
CREATE UNIQUE INDEX "AmilKaryawan_nip_key" ON "AmilKaryawan"("nip");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenerimaan" ADD CONSTRAINT "TransaksiPenerimaan_muzakkiId_fkey" FOREIGN KEY ("muzakkiId") REFERENCES "Muzakki"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyaluran" ADD CONSTRAINT "TransaksiPenyaluran_mustahikId_fkey" FOREIGN KEY ("mustahikId") REFERENCES "Mustahik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyaluran" ADD CONSTRAINT "TransaksiPenyaluran_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ProgramZis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
