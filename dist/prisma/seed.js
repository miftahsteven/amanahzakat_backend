"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Amanah Zakat ERP Database Seeder...');
    // 1. Create System Permissions
    const permissionsData = [
        { kodePermission: 'user.manage', namaPermission: 'Manajemen Pengguna', modul: 'User' },
        { kodePermission: 'acl.manage', namaPermission: 'Manajemen Access Control (ACL)', modul: 'User' },
        { kodePermission: 'penerimaan.read', namaPermission: 'Lihat Penerimaan ZIS', modul: 'Penghimpunan' },
        { kodePermission: 'penerimaan.create', namaPermission: 'Catat Penerimaan ZIS', modul: 'Penghimpunan' },
        { kodePermission: 'penyaluran.read', namaPermission: 'Lihat Penyaluran ZIS', modul: 'Penyaluran' },
        { kodePermission: 'penyaluran.create', namaPermission: 'Pengajuan Penyaluran ZIS', modul: 'Penyaluran' },
        { kodePermission: 'penyaluran.approve', namaPermission: 'Persetujuan Pencairan ZIS', modul: 'Penyaluran' },
        { kodePermission: 'finance.read', namaPermission: 'Lihat Laporan PSAK 109 & G/L', modul: 'Keuangan' },
        { kodePermission: 'finance.manage', namaPermission: 'Pencatatan Jurnal & Closing', modul: 'Keuangan' },
        { kodePermission: 'simba.export', namaPermission: 'Export Paket SIMBA BAZNAS', modul: 'Keuangan' },
    ];
    const permissions = [];
    for (const perm of permissionsData) {
        const created = await prisma.permission.upsert({
            where: { kodePermission: perm.kodePermission },
            update: perm,
            create: perm,
        });
        permissions.push(created);
    }
    console.log(`✅ Created ${permissions.length} System Permissions.`);
    // 2. Create Roles
    const superAdminRole = await prisma.role.upsert({
        where: { kodeRole: 'SUPER_ADMIN' },
        update: {},
        create: {
            kodeRole: 'SUPER_ADMIN',
            namaRole: 'Super Admin System',
            deskripsi: 'Aksess penuh ke seluruh fitur dan pengaturan sistem Amanah Zakat ERP',
            isSystem: true,
        },
    });
    const verifikatorRole = await prisma.role.upsert({
        where: { kodeRole: 'VERIFIKATOR' },
        update: {},
        create: {
            kodeRole: 'VERIFIKATOR',
            namaRole: 'Verifikator Keuangan & Proposal',
            deskripsi: 'Akses memverifikasi transaksi masuk & approval penyaluran bantuan',
            isSystem: true,
        },
    });
    const amilRole = await prisma.role.upsert({
        where: { kodeRole: 'AMIL' },
        update: {},
        create: {
            kodeRole: 'AMIL',
            namaRole: 'Staf Amil Operations',
            deskripsi: 'Staf operasional pencatatan ZIS & pendataan mustahik',
            isSystem: true,
        },
    });
    console.log('✅ Created Default Roles (SUPER_ADMIN, VERIFIKATOR, AMIL).');
    // Assign all permissions to SUPER_ADMIN
    for (const perm of permissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: perm.id,
            },
        });
    }
    // 3. Create Super Admin User (admin / password123)
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    const superAdminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { passwordHash, isActive: true },
        create: {
            username: 'admin',
            email: 'admin@amanahzakat.or.id',
            passwordHash,
            namaLengkap: 'Yoga Riai Hamzah (Super Admin)',
            nomorHp: '081234567890',
            nip: 'AML-2026-001',
            isActive: true,
            isOtpVerified: true,
        },
    });
    // Assign SUPER_ADMIN role to admin user
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: superAdminUser.id,
                roleId: superAdminRole.id,
            },
        },
        update: {},
        create: {
            userId: superAdminUser.id,
            roleId: superAdminRole.id,
        },
    });
    console.log('✅ Super Admin User Created:');
    console.log('   Username: admin');
    console.log('   Email   : admin@amanahzakat.or.id');
    console.log('   Password: password123');
    console.log('   Dummy OTP: 00000');
    console.log('🎉 Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
