import { prisma } from '../../lib/prisma';
import { coordsFromAlamat, resolveMustahikCoords } from '../../lib/geocode';

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
} as const;

function mapMustahik(row: {
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
  return { ...row, lat: coords.lat, lng: coords.lng };
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
    return rows.map(mapMustahik);
  }

  static async getById(id: string) {
    const row = await prisma.mustahik.findUnique({ where: { id }, select: mustahikSelect });
    if (!row) throw { statusCode: 404, message: 'Mustahik tidak ditemukan.' };
    return mapMustahik(row);
  }

  static async updateGps(id: string, lat: number, lng: number) {
    const row = await prisma.mustahik.update({
      where: { id },
      data: { lat, lng },
      select: mustahikSelect,
    });
    return mapMustahik(row);
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
    return mapMustahik(row);
  }
}
