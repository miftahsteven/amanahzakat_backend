-- CreateTable
CREATE TABLE "Modul" (
    "id" TEXT NOT NULL,
    "kodeModul" TEXT NOT NULL,
    "namaModul" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "kodeMenu" TEXT NOT NULL,
    "namaMenu" TEXT NOT NULL,
    "kodeTampil" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "tampilDiSidebar" BOOLEAN NOT NULL DEFAULT true,
    "tampilDiHeader" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modul_kodeModul_key" ON "Modul"("kodeModul");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_kodeMenu_key" ON "Menu"("kodeMenu");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reset old permission catalog (refilled by prisma seed)
DELETE FROM "RolePermission";
DELETE FROM "Permission";

-- AlterTable Permission: bind to Menu + action
ALTER TABLE "Permission" DROP COLUMN "modul";
ALTER TABLE "Permission" ADD COLUMN "aksi" TEXT NOT NULL;
ALTER TABLE "Permission" ADD COLUMN "menuId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_menuId_aksi_key" ON "Permission"("menuId", "aksi");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
