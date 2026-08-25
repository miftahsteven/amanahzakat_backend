import { DonasiWeb } from '@prisma/client';
import { prisma } from './prisma';
import { mapFundTypeToErp, mapKanalToErp } from './donation-web';
import { activeOnly } from './soft-delete';

function webCatatanMarker(transactionId: string) {
  return `web:${transactionId}`;
}

function buildCatatan(donation: DonasiWeb) {
  const base = `Pembayaran online web ${donation.transactionId}`;
  return donation.message ? `${base} — Pesan: ${donation.message} — ${webCatatanMarker(donation.transactionId)}` : `${base} — ${webCatatanMarker(donation.transactionId)}`;
}

async function resolveMuzakki(donation: DonasiWeb) {
  let erpMuzakki = await prisma.muzakki.findFirst({
    where: {
      ...activeOnly,
      OR: [
        ...(donation.donorEmail ? [{ email: donation.donorEmail }] : []),
        ...(donation.donorPhone ? [{ hp: donation.donorPhone }] : []),
        { nama: donation.donorName },
      ],
    },
  });

  if (!erpMuzakki) {
    const randMzkNum = `MZK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    erpMuzakki = await prisma.muzakki.create({
      data: {
        nomor: randMzkNum,
        nama: donation.donorName,
        tipe: 'Perorangan',
        nikAtauNpwp: 'Terlampir pada Form Web',
        hp: donation.donorPhone || '0812XXXXXXXX',
        email: donation.donorEmail || `${donation.donorName.toLowerCase().replace(/\s+/g, '')}@donatur.com`,
        alamat: 'Indonesia (Donasi Online Web)',
        totalSetoran: 0,
        transaksiCount: 0,
        tanggalBergabung: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  }

  return erpMuzakki;
}

export async function syncPendingPenerimaanFromWeb(donation: DonasiWeb) {
  const marker = webCatatanMarker(donation.transactionId);
  const existing = await prisma.transaksiPenerimaan.findFirst({
    where: { catatan: { contains: marker } },
  });

  if (existing) return existing;

  const muzakki = await resolveMuzakki(donation);
  const pendingNo = `KWT-PENDING/${donation.transactionId}`;

  return prisma.transaksiPenerimaan.create({
    data: {
      noKwitansi: pendingNo,
      tanggal: new Date().toISOString().slice(0, 10),
      muzakkiId: muzakki.id,
      jenisZis: mapFundTypeToErp(donation.fundType),
      programNama: donation.campaignTitle,
      nominal: donation.amount,
      kanal: mapKanalToErp(donation.paymentProvider, donation.paymentMethod),
      rekeningTujuan: 'Rekening ZIS AmanahZakat (Web)',
      status: 'Menunggu Verifikasi',
      catatan: buildCatatan(donation),
    },
  });
}

export async function finalizePenerimaanFromWeb(donation: DonasiWeb) {
  const marker = webCatatanMarker(donation.transactionId);
  const sbmzNumber = `SBMZ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/ASK${Math.floor(100000 + Math.random() * 900000)}`;
  const noKwitansi = `KWT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

  const existing = await prisma.transaksiPenerimaan.findFirst({
    where: { catatan: { contains: marker } },
  });

  const muzakki = await resolveMuzakki(donation);

  await prisma.muzakki.update({
    where: { id: muzakki.id },
    data: {
      totalSetoran: { increment: donation.amount },
      transaksiCount: { increment: 1 },
    },
  });

  if (existing) {
    return prisma.transaksiPenerimaan.update({
      where: { id: existing.id },
      data: {
        noKwitansi,
        noSbmz: sbmzNumber,
        status: 'Terverifikasi',
        nominal: donation.amount,
        kanal: mapKanalToErp(donation.paymentProvider, donation.paymentMethod),
        catatan: buildCatatan(donation),
      },
    });
  }

  return prisma.transaksiPenerimaan.create({
    data: {
      noKwitansi,
      noSbmz: sbmzNumber,
      tanggal: new Date().toISOString().slice(0, 10),
      muzakkiId: muzakki.id,
      jenisZis: mapFundTypeToErp(donation.fundType),
      programNama: donation.campaignTitle,
      nominal: donation.amount,
      kanal: mapKanalToErp(donation.paymentProvider, donation.paymentMethod),
      rekeningTujuan: 'Rekening ZIS AmanahZakat',
      status: 'Terverifikasi',
      catatan: buildCatatan(donation),
    },
  });
}

export async function incrementCampaignStatsIfLinked(donation: DonasiWeb) {
  if (!donation.campaignId) return;

  await prisma.campaign.update({
    where: { id: donation.campaignId },
    data: {
      terkumpul: { increment: donation.amount },
      donaturCount: { increment: 1 },
    },
  });
}
