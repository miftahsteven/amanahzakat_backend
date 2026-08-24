import { prisma } from '../../lib/prisma';

function formatWaktu(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export class InboxService {
  static async list() {
    const rows = await prisma.notifikasi.findMany({ orderBy: { waktu: 'desc' } });
    return rows.map((r) => ({
      id: r.id,
      judul: r.judul,
      pesan: r.pesan,
      kategori: r.kategori,
      linkScreen: r.linkScreen,
      dibaca: r.dibaca,
      waktu: formatWaktu(r.waktu),
    }));
  }

  static async markRead(id: string) {
    return prisma.notifikasi.update({ where: { id }, data: { dibaca: true } });
  }

  static async markAllRead() {
    await prisma.notifikasi.updateMany({ data: { dibaca: true } });
    return { ok: true };
  }

  /** Generate inbox from live ERP events (safe to re-run) */
  static async syncFromEvents() {
    const [pendingPenerimaan, pendingApproval, mitraLpj] = await Promise.all([
      prisma.transaksiPenerimaan.findMany({
        where: { status: 'Menunggu Verifikasi' },
        include: { muzakki: true },
        take: 5,
        orderBy: { tanggal: 'desc' },
      }),
      prisma.approvalPengajuan.findMany({
        where: { status: 'Menunggu' },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mitraPenyalur.findMany({
        where: { statusLaporanLpj: 'Menunggu LPJ' },
        take: 3,
      }),
    ]);

    // If an approval has moved out of "Menunggu", mark its related inbox item as read.
    // (notif text is `${ref} — ${perihal}`, so we can parse ref from pesan)
    const pendingApprovalRefs = new Set(pendingApproval.map((a) => a.ref));
    const existingApprovalNotifs = await prisma.notifikasi.findMany({
      where: { judul: 'Pengajuan Menunggu Approval', kategori: 'Approval', dibaca: false },
      take: 500,
    });
    for (const n of existingApprovalNotifs) {
      const refFromPesan = n.pesan.split(' — ')[0]?.trim();
      if (!refFromPesan || !pendingApprovalRefs.has(refFromPesan)) {
        await prisma.notifikasi.update({ where: { id: n.id }, data: { dibaca: true } });
      }
    }

    const events: { judul: string; pesan: string; kategori: string; linkScreen: string }[] = [];

    for (const p of pendingPenerimaan) {
      events.push({
        judul: 'Penerimaan Menunggu Verifikasi',
        pesan: `${p.muzakki.nama} — ${p.jenisZis} Rp ${p.nominal.toLocaleString('id-ID')}`,
        kategori: 'Penerimaan',
        linkScreen: 'penerimaan',
      });
    }
    for (const a of pendingApproval) {
      events.push({
        judul: 'Pengajuan Menunggu Approval',
        pesan: `${a.ref} — ${a.perihal}`,
        kategori: 'Approval',
        linkScreen: 'approval',
      });
    }
    for (const m of mitraLpj) {
      events.push({
        judul: 'LPJ Mitra Menunggu',
        pesan: `${m.nama} belum menyerahkan LPJ penyaluran.`,
        kategori: 'System',
        linkScreen: 'mitra',
      });
    }

    events.push({
      judul: 'Pengingat Tutup Buku',
      pesan: 'Periode berjalan siap dikunci setelah verifikasi 4 langkah pra-tutup.',
      kategori: 'Closing',
      linkScreen: 'closing',
    });

    for (const ev of events) {
      const exists = await prisma.notifikasi.findFirst({
        where: { judul: ev.judul, pesan: ev.pesan },
      });
      if (!exists) {
        await prisma.notifikasi.create({ data: ev });
      }
    }
  }
}
