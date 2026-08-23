const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.transaksiPenerimaan.count();
  const sample = await prisma.transaksiPenerimaan.findMany({ take: 3, select: { noKwitansi: true, jenisZis: true, status: true } });
  console.log('count:', count);
  console.log('sample:', JSON.stringify(sample, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
