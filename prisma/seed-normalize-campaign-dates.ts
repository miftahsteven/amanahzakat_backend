import { PrismaClient } from '@prisma/client';
import { toIsoDate } from '../src/lib/campaign-date';

const prisma = new PrismaClient();

/** Normalisasi tenggat & kabar.tgl kampanye ke ISO YYYY-MM-DD (idempotent). */
async function main() {
  const campaigns = await prisma.campaign.findMany();
  let updated = 0;

  for (const camp of campaigns) {
    const tenggatIso = toIsoDate(camp.tenggat) || camp.tenggat;
    const kabarRaw = Array.isArray(camp.kabar) ? (camp.kabar as any[]) : [];
    const kabar = kabarRaw.map((row) => ({
      ...row,
      tgl: toIsoDate(row?.tgl) || row?.tgl || '',
    }));

    const changed =
      tenggatIso !== camp.tenggat || JSON.stringify(kabar) !== JSON.stringify(camp.kabar);

    if (!changed) continue;

    await prisma.campaign.update({
      where: { id: camp.id },
      data: { tenggat: tenggatIso, kabar },
    });
    updated += 1;
  }

  console.log(`✅ Normalized ${updated}/${campaigns.length} campaign date fields to ISO`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
