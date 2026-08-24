import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.zakatConfig.upsert({
    where: { id: 'default-zakat-config' },
    update: {},
    create: {
      id: 'default-zakat-config',
      hargaEmasPerGram: 1450000,
      hargaBerasPerKg: 15000,
      nisabEmasGram: 85,
      nisabBerasKg: 522,
      nisabPertanianKg: 653,
      zakatRate: 0.025,
      fitrahKgPerJiwa: 2.5,
    },
  });
  console.log('✅ Zakat Config seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
