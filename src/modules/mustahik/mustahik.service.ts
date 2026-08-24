import { prisma } from '../../lib/prisma';
import { coordsFromAlamat, detectWilayahNama, resolveMustahikCoords } from '../../lib/geocode';

const mustahikSelect = {
  id: true,
  nik: true,
  nama: true,
  kategoriAsnaf: true,
  hp: true,
  alamat: true,
  pekerjaan: true,
  jumlahTanggungan: true,
  penghasilanBulanan: true,
  rekeningBank: true,
  statusSurvei: true,
  skorKelayakan: true,
  totalBantuanDiterima: true,
  lat: true,
  lng: true,
  createdAt: true,
} as const;

function inisialNama(nama: string) {
  return nama
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function mapMustahikBase(row: {
  id: string;
  nik: string;
  nama: string;
  kategoriAsnaf: string;
  hp: string;
  alamat: string;
  pekerjaan: string;
  jumlahTanggungan: number;
  penghasilanBulanan: number;
  rekeningBank: string;
  statusSurvei: string;
  skorKelayakan: number;
  totalBantuanDiterima: number;
  lat: number | null;
  lng: number | null;
}) {
  const coords = resolveMustahikCoords(row.alamat, row.lat, row.lng, row.nik);
  return {
    ...row,
    kategoriAsnaf: row.kategoriAsnaf as
      | 'Fakir'
      | 'Miskin'
      | 'Amil'
      | 'Mualaf'
      | 'Riqab'
      | 'Gharim'
      | 'Fisabilillah'
      | 'Ibnus Sabil',
    statusSurvei: row.statusSurvei as 'Terverifikasi' | 'Perlu Survei' | 'Indikasi Ganda',
    lat: coords.lat,
    lng: coords.lng,
  };
}

async function mapMustahikDetail(
  row: {
    id: string;
    nik: string;
    nama: string;
    kategoriAsnaf: string;
    hp: string;
    alamat: string;
    pekerjaan: string;
    jumlahTanggungan: number;
    penghasilanBulanan: number;
    rekeningBank: string;
    statusSurvei: string;
    skorKelayakan: number;
    totalBantuanDiterima: number;
    lat: number | null;
    lng: number | null;
    createdAt: Date;
  }
) {
  const base = mapMustahikBase(row);

  const penyaluranRows = await prisma.transaksiPenyaluran.findMany({
    where: { mustahikId: row.id },
    include: { program: true },
    orderBy: { tanggal: 'desc' },
    take: 15,
  });

  const programList = [...new Set(penyaluranRows.map((p) => p.program.nama))];
  const tgl = row.createdAt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    ...base,
    inisial: inisialNama(row.nama),
    wilayah: detectWilayahNama(row.alamat),
    programList,
    programCount: programList.length,
    penyaluranRows: penyaluranRows.map((p) => ({
      id: p.id,
      noPenyaluran: p.noPenyaluran,
      tanggal: p.tanggal,
      programNama: p.program.nama,
      nominal: p.nominal,
      danaMustahik: p.danaMustahik,
      status: p.status,
    })),
    dokumen: [
      { nama: 'Fotokopi KTP / KK', status: 'Lengkap' },
      { nama: 'Surat keterangan tidak mampu', status: row.statusSurvei === 'Terverifikasi' ? 'Lengkap' : 'Menunggu' },
      { nama: 'Berita acara survei lapangan', status: row.statusSurvei === 'Terverifikasi' ? 'Lengkap' : 'Menunggu' },
      { nama: 'Foto rumah / kondisi ekonomi', status: row.statusSurvei === 'Terverifikasi' ? 'Lengkap' : 'Menunggu' },
    ],
    riwayatSurvei: [
      { title: 'Pendaftaran mustahik', desc: 'Data NIK dan profil ekonomi tercatat', waktu: tgl, done: true },
      {
        title: 'Survei lapangan',
        desc: 'Petugas amil melakukan verifikasi alamat & kondisi',
        waktu: row.statusSurvei === 'Terverifikasi' ? tgl : undefined,
        done: row.statusSurvei === 'Terverifikasi',
      },
      {
        title: 'Skoring kelayakan',
        desc: `Skor kelayakan ${row.skorKelayakan}/100`,
        waktu: row.statusSurvei === 'Terverifikasi' ? tgl : undefined,
        done: row.statusSurvei === 'Terverifikasi',
      },
      {
        title: 'Status verifikasi',
        desc: row.statusSurvei,
        waktu: row.statusSurvei === 'Terverifikasi' ? tgl : undefined,
        done: row.statusSurvei === 'Terverifikasi',
      },
    ],
  };
}

function computeSkorKelayakan(penghasilanBulanan: number, jumlahTanggungan: number): number {
  const incomePenalty = Math.min(25, Math.floor(penghasilanBulanan / 400000));
  const dependBonus = Math.min(25, jumlahTanggungan * 5);
  return Math.min(100, Math.max(50, 75 + dependBonus - incomePenalty));
}

export class MustahikService {
  static async list(asnaf?: string) {
    const rows = await prisma.mustahik.findMany({
      where:
        asnaf && asnaf !== 'Semua'
          ? { kategoriAsnaf: { equals: asnaf, mode: 'insensitive' } }
          : undefined,
      orderBy: [{ skorKelayakan: 'desc' }, { nama: 'asc' }],
      select: mustahikSelect,
    });
    return rows.map((r) => mapMustahikBase(r));
  }

  static async getById(id: string) {
    const row = await prisma.mustahik.findUnique({ where: { id }, select: mustahikSelect });
    if (!row) throw { statusCode: 404, message: 'Mustahik tidak ditemukan.' };
    return mapMustahikDetail(row);
  }

  static async updateGps(id: string, lat: number, lng: number) {
    const row = await prisma.mustahik.update({
      where: { id },
      data: { lat, lng },
      select: mustahikSelect,
    });
    return mapMustahikDetail(row);
  }

  static async create(input: {
    nik: string;
    nama: string;
    kategoriAsnaf: string;
    hp: string;
    alamat: string;
    pekerjaan: string;
    jumlahTanggungan: number;
    penghasilanBulanan: number;
    rekeningBank: string;
  }) {
    const existing = await prisma.mustahik.findUnique({
      where: { nik: input.nik },
    });

    if (existing) {
      throw {
        statusCode: 409,
        message: 'NIK sudah terdaftar di database Mustahik. Indikasi penerima ganda.',
      };
    }

    const skorKelayakan = computeSkorKelayakan(input.penghasilanBulanan, input.jumlahTanggungan);
    const gps = coordsFromAlamat(input.alamat, input.nik);

    const row = await prisma.mustahik.create({
      data: {
        nik: input.nik,
        nama: input.nama,
        kategoriAsnaf: input.kategoriAsnaf,
        hp: input.hp,
        alamat: input.alamat,
        pekerjaan: input.pekerjaan,
        jumlahTanggungan: input.jumlahTanggungan,
        penghasilanBulanan: input.penghasilanBulanan,
        rekeningBank: input.rekeningBank,
        statusSurvei: 'Terverifikasi',
        skorKelayakan,
        totalBantuanDiterima: 0,
        lat: gps.lat,
        lng: gps.lng,
      },
      select: mustahikSelect,
    });
    return mapMustahikDetail(row);
  }
}
