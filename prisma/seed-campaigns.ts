import { PrismaClient } from '@prisma/client';
import { campaignsMockData } from './data/campaigns.mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding kampanye (mock data)...');

  for (const c of campaignsMockData) {
    await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: {
        nama: c.nama,
        program: c.program,
        lokasi: c.lokasi,
        target: c.target,
        terkumpul: c.terkumpul,
        donaturCount: c.donaturCount,
        tenggat: c.tenggat,
        ringkas: c.ringkas,
        cerita: c.cerita,
        imageUrl: c.imageUrl,
        rincian: c.rincian,
        kabar: c.kabar,
        donaturList: c.donaturList,
        status: c.status,
        isFeatured: c.isFeatured,
      },
      create: {
        slug: c.slug,
        nama: c.nama,
        program: c.program,
        lokasi: c.lokasi,
        target: c.target,
        terkumpul: c.terkumpul,
        donaturCount: c.donaturCount,
        tenggat: c.tenggat,
        ringkas: c.ringkas,
        cerita: c.cerita,
        imageUrl: c.imageUrl,
        rincian: c.rincian,
        kabar: c.kabar,
        donaturList: c.donaturList,
        status: c.status,
        isFeatured: c.isFeatured,
      },
    });
  }

  const count = await prisma.campaign.count();
  console.log(`✅ Selesai — ${count} kampanye di database.`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed kampanye:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
