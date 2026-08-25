import { PrismaClient } from '@prisma/client';
import { heroSlidersMockData } from './data/hero-sliders.mock-data';
import { campaignsMockData } from './data/campaigns.mock-data';

const prisma = new PrismaClient();

async function seedHero() {
  console.log('🌱 Seeding hero sliders (mock webpublic)...');
  for (const h of heroSlidersMockData) {
    await prisma.heroSlider.upsert({
      where: { id: h.id },
      update: {
        title: h.title,
        subtitle: h.subtitle,
        tag: h.tag,
        ctaText: h.ctaText,
        ctaLink: h.ctaLink,
        secondaryCtaText: h.secondaryCtaText,
        secondaryCtaLink: h.secondaryCtaLink,
        imageUrl: h.imageUrl,
        badge: h.badge,
        badgeColor: h.badgeColor,
        isActive: h.isActive,
        order: h.order,
      },
      create: h,
    });
  }
  console.log(`✅ ${heroSlidersMockData.length} hero slider tersimpan.`);
}

async function seedCampaigns() {
  console.log('🌱 Seeding kampanye (mock webpublic)...');
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
  console.log(`✅ ${(await prisma.campaign.count())} kampanye di database.`);
}

async function main() {
  await seedHero();
  await seedCampaigns();
  console.log('✅ Seed gambar mock webpublic selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed media webpublic:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
