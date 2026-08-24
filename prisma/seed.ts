import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// 1. ACL & ERP CONFIG DATA
// ==========================================
const modulesData = [
  { kodeModul: 'IKHTISAR', namaModul: 'IKHTISAR', urutan: 1 },
  { kodeModul: 'OPERASIONAL_ZIS', namaModul: 'OPERASIONAL ZIS', urutan: 2 },
  { kodeModul: 'KONTEN_WEB', namaModul: 'MANAJEMEN KONTEN WEB', urutan: 3 },
  { kodeModul: 'KEUANGAN', namaModul: 'KEUANGAN & AKUNTANSI', urutan: 4 },
  { kodeModul: 'PERALATAN', namaModul: 'PERALATAN', urutan: 5 },
  { kodeModul: 'PEMBERITAHUAN', namaModul: 'PEMBERITAHUAN', urutan: 6 },
  { kodeModul: 'PENGATURAN', namaModul: 'PENGATURAN SISTEM', urutan: 7 },
];

const read = (nama: string) => [{ aksi: 'read', nama }];

const menusData = [
  { kodeModul: 'IKHTISAR', kodeMenu: 'dashboard', namaMenu: 'Dashboard ERP', kodeTampil: 'DB', icon: 'LayoutDashboard', urutan: 1, actions: read('Lihat Dashboard') },
  { kodeModul: 'IKHTISAR', kodeMenu: 'laporan', namaMenu: 'Laporan Distribusi', kodeTampil: 'LD', icon: 'FileBarChart', urutan: 2, actions: [...read('Lihat Laporan Distribusi'), { aksi: 'export', nama: 'Ekspor Laporan Distribusi' }] },
  { kodeModul: 'IKHTISAR', kodeMenu: 'peta', namaMenu: 'Peta Sebaran Mustahik', kodeTampil: 'PT', icon: 'Map', urutan: 3, actions: read('Lihat Peta Sebaran') },
  { kodeModul: 'IKHTISAR', kodeMenu: 'dampak', namaMenu: 'Dampak Publik', kodeTampil: 'DP', icon: 'HeartHandshake', urutan: 4, actions: read('Lihat Dampak Publik') },

  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'penerimaan', namaMenu: 'Penerimaan ZIS & Kwitansi', kodeTampil: 'PN', icon: 'Wallet', urutan: 1, actions: [...read('Lihat Penerimaan ZIS'), { aksi: 'create', nama: 'Catat Penerimaan ZIS' }, { aksi: 'update', nama: 'Ubah Penerimaan ZIS' }, { aksi: 'delete', nama: 'Hapus Penerimaan ZIS' }, { aksi: 'verify', nama: 'Verifikasi Penerimaan ZIS' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'penyaluran', namaMenu: 'Penyaluran 8 Asnaf', kodeTampil: 'PY', icon: 'HandCoins', urutan: 2, actions: [...read('Lihat Penyaluran'), { aksi: 'create', nama: 'Ajukan Penyaluran' }, { aksi: 'update', nama: 'Ubah Penyaluran' }, { aksi: 'delete', nama: 'Hapus Penyaluran' }, { aksi: 'verify', nama: 'Verifikasi / Cairkan Penyaluran' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'muzakki', namaMenu: 'Data Muzakki', kodeTampil: 'MZ', icon: 'Users', urutan: 3, actions: [...read('Lihat Data Muzakki'), { aksi: 'create', nama: 'Tambah Muzakki' }, { aksi: 'update', nama: 'Ubah Muzakki' }, { aksi: 'delete', nama: 'Hapus Muzakki' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'program', namaMenu: 'Program & Pagu Anggaran', kodeTampil: 'PR', icon: 'FolderKanban', urutan: 4, actions: [...read('Lihat Program ZIS'), { aksi: 'update', nama: 'Ubah Program & Pagu' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'mitra', namaMenu: 'Dashboard Mitra Penyalur', kodeTampil: 'MT', icon: 'Building2', urutan: 5, actions: [...read('Lihat Mitra Penyalur'), { aksi: 'create', nama: 'Tambah Mitra' }, { aksi: 'update', nama: 'Ubah Mitra' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'portalUpz', namaMenu: 'Portal UPZ Korporat', kodeTampil: 'PU', icon: 'Globe2', urutan: 6, actions: read('Akses Portal UPZ Korporat') },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'upz', namaMenu: 'Dashboard UPZ Cabang', kodeTampil: 'UP', icon: 'Landmark', urutan: 7, actions: [...read('Lihat Dashboard UPZ'), { aksi: 'update', nama: 'Ubah Data UPZ' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'payroll', namaMenu: 'Payroll UPZ', kodeTampil: 'PL', icon: 'Banknote', urutan: 8, actions: [...read('Lihat Payroll UPZ'), { aksi: 'update', nama: 'Proses Payroll UPZ' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'mustahik', namaMenu: 'Data Mustahik & Scoring', kodeTampil: 'MS', icon: 'UserRoundSearch', urutan: 9, actions: [...read('Lihat Data Mustahik'), { aksi: 'create', nama: 'Tambah Mustahik' }, { aksi: 'update', nama: 'Ubah Mustahik' }, { aksi: 'delete', nama: 'Hapus Mustahik' }] },

  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-hero', namaMenu: 'Hero Slider & Banner', kodeTampil: 'HS', icon: 'Sliders', urutan: 1, actions: [...read('Lihat Hero Slider'), { aksi: 'create', nama: 'Tambah Hero Slider' }, { aksi: 'update', nama: 'Ubah Hero Slider' }, { aksi: 'delete', nama: 'Hapus Hero Slider' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-campaigns', namaMenu: 'Program & Kampanye ZIS', kodeTampil: 'KP', icon: 'FolderKanban', urutan: 2, actions: [...read('Lihat Kampanye CMS'), { aksi: 'create', nama: 'Tambah Kampanye' }, { aksi: 'update', nama: 'Ubah Kampanye' }, { aksi: 'delete', nama: 'Hapus Kampanye' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-distributions', namaMenu: 'Kabar Penyaluran Lapangan', kodeTampil: 'KB', icon: 'FileBarChart', urutan: 3, actions: [...read('Lihat Kabar Penyaluran CMS'), { aksi: 'create', nama: 'Tambah Kabar' }, { aksi: 'update', nama: 'Ubah Kabar' }, { aksi: 'delete', nama: 'Hapus Kabar' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-testimonials', namaMenu: 'Testimoni & Kisah Nyata', kodeTampil: 'TM', icon: 'HeartHandshake', urutan: 4, actions: [...read('Lihat Testimoni CMS'), { aksi: 'create', nama: 'Tambah Testimoni' }, { aksi: 'update', nama: 'Ubah Testimoni' }, { aksi: 'delete', nama: 'Hapus Testimoni' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-faqs', namaMenu: 'Kelola FAQ & Ustaz Digital', kodeTampil: 'FQ', icon: 'Info', urutan: 5, actions: [...read('Lihat FAQ CMS'), { aksi: 'create', nama: 'Tambah FAQ' }, { aksi: 'update', nama: 'Ubah FAQ' }, { aksi: 'delete', nama: 'Hapus FAQ' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-impact', namaMenu: 'Laporan Dampak & Audit', kodeTampil: 'DP', icon: 'FileBarChart', urutan: 6, actions: [...read('Lihat Dampak CMS'), { aksi: 'update', nama: 'Ubah Laporan Dampak' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-assistance', namaMenu: 'Verifikasi Permohonan Mustahik', kodeTampil: 'PB', icon: 'UserRoundSearch', urutan: 7, actions: [...read('Lihat Pengajuan Bantuan'), { aksi: 'verify', nama: 'Verifikasi / Survei Permohonan' }] },
  { kodeModul: 'KONTEN_WEB', kodeMenu: 'cms-settings', namaMenu: 'Pengaturan Web Publik', kodeTampil: 'PW', icon: 'Globe2', urutan: 8, actions: [...read('Lihat Pengaturan Web'), { aksi: 'update', nama: 'Ubah Pengaturan Web' }] },

  { kodeModul: 'KEUANGAN', kodeMenu: 'jurnal', namaMenu: 'Pencatatan Jurnal & G/L PSAK 109', kodeTampil: 'JR', icon: 'BookOpen', urutan: 1, actions: [...read('Lihat Jurnal & G/L'), { aksi: 'create', nama: 'Catat Jurnal' }] },
  { kodeModul: 'KEUANGAN', kodeMenu: 'closing', namaMenu: 'Closing Periode Akuntansi', kodeTampil: 'CL', icon: 'Lock', urutan: 2, actions: [...read('Lihat Closing Periode'), { aksi: 'execute', nama: 'Eksekusi Closing Periode' }] },
  { kodeModul: 'KEUANGAN', kodeMenu: 'simba', namaMenu: 'Export Paket SIMBA BAZNAS', kodeTampil: 'SB', icon: 'Package', urutan: 3, actions: [...read('Lihat Export SIMBA'), { aksi: 'export', nama: 'Ekspor Paket SIMBA' }] },

  { kodeModul: 'PERALATAN', kodeMenu: 'kalkulator', namaMenu: 'Kalkulator Zakat Maal/Fitrah', kodeTampil: 'KL', icon: 'Calculator', urutan: 1, actions: [...read('Gunakan Kalkulator ZIS'), { aksi: 'update', nama: 'Kelola Parameter Nisab Zakat' }] },
  { kodeModul: 'PERALATAN', kodeMenu: 'portal', namaMenu: 'Portal Informasi Publik', kodeTampil: 'PO', icon: 'Info', urutan: 2, actions: read('Akses Portal Publik') },

  { kodeModul: 'PEMBERITAHUAN', kodeMenu: 'inbox', namaMenu: 'Pesan & Inbox Notifikasi', kodeTampil: 'IB', icon: 'Bell', urutan: 1, actions: read('Lihat Inbox & Notifikasi') },

  { kodeModul: 'PENGATURAN', kodeMenu: 'user-management', namaMenu: 'Manajemen Pengguna (CRUD)', kodeTampil: 'UM', icon: 'UserCog', urutan: 1, actions: [...read('Lihat Manajemen Pengguna'), { aksi: 'manage', nama: 'Kelola Pengguna' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'module-management', namaMenu: 'Manajemen Modul & Menu', kodeTampil: 'MM', icon: 'Layers', urutan: 2, actions: [...read('Lihat Manajemen Modul'), { aksi: 'manage', nama: 'Kelola Modul & Menu' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'permission-management', namaMenu: 'Manajemen Permission', kodeTampil: 'PM', icon: 'KeyRound', urutan: 3, actions: [...read('Lihat Manajemen Permission'), { aksi: 'manage', nama: 'Kelola Permission' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'acl-management', namaMenu: 'ACL & Role Menu Management', kodeTampil: 'AM', icon: 'ShieldCheck', urutan: 4, actions: [...read('Lihat ACL & Role'), { aksi: 'manage', nama: 'Kelola ACL & Role' }] },
];

// ==========================================
// 2. PUBLIC CAMPAIGNS DATA
// ==========================================
const campaignsData = [
  {
    id: 1,
    slug: 'sumur-sumba',
    nama: 'Sumur Kehidupan Sumba Timur',
    program: 'Wakaf Sumur',
    lokasi: 'Sumba Timur, NTT',
    target: 450000000,
    terkumpul: 388400000,
    donaturCount: 1847,
    tenggat: '31 Agustus 2026',
    ringkas: 'Membangun 12 titik sumur bor untuk 9 kampung yang setiap kemarau harus berjalan dua jam mencari air bersih.',
    cerita: 'Di Sumba Timur, musim kemarau berlangsung hingga delapan bulan. Perempuan dan anak-anak menempuh perjalanan dua jam setiap hari hanya untuk mendapatkan air keruh dari cekungan sungai. Satu titik sumur bor mampu melayani 250-300 jiwa sepanjang tahun, lengkap dengan bak tampung dan pipa distribusi ke rumah warga.',
    imageUrl: '/images/campaigns/sumur-sumba.jpg',
    rincian: [
      { item: 'Pengeboran & casing sumur (12 titik)', nilai: 264000000 },
      { item: 'Pompa, panel surya & instalasi listrik', nilai: 96000000 },
      { item: 'Bak tampung dan jaringan pipa', nilai: 60000000 },
      { item: 'Pelatihan pengelola sumur desa', nilai: 30000000 },
    ],
    kabar: [
      { tgl: '24 Juli 2026', judul: 'Titik ke-9 selesai dibor', isi: 'Sumur di Kampung Praiwitu mulai mengalir dan langsung dipakai 280 jiwa warga.' },
      { tgl: '10 Juli 2026', judul: 'Survei geolistrik tiga titik terakhir', isi: 'Tim menemukan sumber air di kedalaman 42 meter, layak dibor bulan depan.' },
    ],
    donaturList: [
      { nama: 'PT Cahaya Nusantara', nominal: 50000000, waktu: '2 jam lalu', doa: 'Semoga menjadi jariyah berkah untuk semua karyawan' },
      { nama: 'Hj. Sundari Wibowo', nominal: 25000000, waktu: '5 jam lalu', doa: 'Pahala untuk almarhum orang tua' },
      { nama: 'Donatur Anonim', nominal: 1000000, waktu: '1 hari lalu', doa: 'Bismillah lancar pembangunannya' },
      { nama: 'Komunitas Subuh Berkah', nominal: 5000000, waktu: '2 hari lalu', doa: 'Semoga airnya mengalir deras berkah' },
    ],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 2,
    slug: 'qurban-nusantara',
    nama: 'Qurban Berkah Nusantara 1447 H',
    program: 'Qurban',
    lokasi: '18 provinsi',
    target: 1250000000,
    terkumpul: 1118000000,
    donaturCount: 4210,
    tenggat: '5 Agustus 2026',
    ringkas: 'Menyalurkan daging qurban segar ke pelosok yang jarang tersentuh distribusi daging, langsung dari peternak lokal.',
    cerita: 'Hewan qurban dibeli dari peternak dhuafa di daerah penyaluran, sehingga satu qurban menggerakkan dua kebaikan: memberi daging bagi mustahik dan memutar ekonomi peternak kecil. Distribusi menjangkau kampung nelayan, desa pegunungan, dan komunitas adat.',
    imageUrl: '/images/campaigns/qurban-nusantara.jpg',
    rincian: [
      { item: 'Kambing dari peternak dhuafa (620 ekor)', nilai: 682000000 },
      { item: 'Sapi kolektif (58 ekor)', nilai: 406000000 },
      { item: 'Pemotongan, pengemasan & distribusi', nilai: 132000000 },
      { item: 'Pendampingan peternak mitra', nilai: 30000000 },
    ],
    kabar: [
      { tgl: '22 Juli 2026', judul: '2.106 ekor sudah terkumpul', isi: 'Tahap pertama distribusi disiapkan untuk 14 provinsi.' },
    ],
    donaturList: [
      { nama: 'Hendra Gunawan', nominal: 3500000, waktu: '3 jam lalu' },
      { nama: 'Keluarga dr. Nadia', nominal: 14000000, waktu: '1 hari lalu', doa: 'Qurban untuk 1 keluarga' },
    ],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 3,
    slug: 'citarum-hijau',
    nama: 'Sejuta Pohon untuk Citarum',
    program: 'Konservasi DAS Citarum',
    lokasi: 'Bandung Barat, Jawa Barat',
    target: 900000000,
    terkumpul: 806000000,
    donaturCount: 96,
    tenggat: '31 Desember 2026',
    ringkas: 'Menanam dan merawat pohon di bantaran Citarum bersama kelompok tani, sekaligus memulihkan debit air musim kemarau.',
    cerita: 'Bantaran hulu Citarum kehilangan tutupan lahan sejak dua dekade lalu. Program ini menanam pohon produktif dan tegakan keras, dirawat oleh kelompok tani setempat yang mendapat insentif perawatan tiga tahun — bukan sekadar tanam lalu ditinggalkan.',
    imageUrl: '/images/campaigns/citarum-hijau.jpg',
    rincian: [
      { item: 'Bibit pohon produktif & tegakan keras', nilai: 342000000 },
      { item: 'Insentif perawatan kelompok tani (3 tahun)', nilai: 378000000 },
      { item: 'Pembibitan desa & pelatihan', nilai: 108000000 },
      { item: 'Monitoring tutupan lahan', nilai: 72000000 },
    ],
    kabar: [
      { tgl: '21 Juli 2026', judul: '12.480 pohon tertanam', isi: 'Tingkat hidup tanaman mencapai 91% pada evaluasi triwulan kedua.' },
    ],
    donaturList: [
      { nama: 'Komunitas Pecinta Alam Citarum', nominal: 10000000, waktu: '4 hari lalu' },
    ],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 4,
    slug: 'beasiswa-yatim',
    nama: 'Beasiswa Yatim Masuk Sekolah',
    program: 'Beasiswa Anak Yatim',
    lokasi: 'Jabodetabek & Jawa Barat',
    target: 600000000,
    terkumpul: 612000000,
    donaturCount: 3129,
    tenggat: '20 Juli 2026',
    ringkas: 'Biaya sekolah, seragam, dan pendampingan belajar untuk anak yatim yang terancam putus sekolah.',
    cerita: 'Beasiswa mencakup SPP satu tahun, seragam, perlengkapan belajar, dan pendampingan mentor dua kali sebulan. Fokus pada anak kelas 6, 9, dan 12 — titik paling rawan putus sekolah.',
    imageUrl: '/images/campaigns/beasiswa-yatim.jpg',
    rincian: [
      { item: 'SPP & biaya sekolah 1.842 anak', nilai: 414000000 },
      { item: 'Seragam dan perlengkapan belajar', nilai: 110000000 },
      { item: 'Pendampingan mentor belajar', nilai: 76000000 },
    ],
    kabar: [
      { tgl: '20 Juli 2026', judul: 'Target terlampaui', isi: 'Kelebihan dana dialihkan ke gelombang berikutnya atas persetujuan donatur.' },
    ],
    donaturList: [
      { nama: 'Hamba Allah', nominal: 2500000, waktu: '6 jam lalu' },
    ],
    status: 'Tercapai',
    isFeatured: true,
  },
  {
    id: 5,
    slug: 'infak-oksigen',
    nama: 'Infak Oksigen untuk Dhuafa',
    program: 'Program Infak Oksigen',
    lokasi: 'Jakarta Timur & Bekasi',
    target: 260000000,
    terkumpul: 97500000,
    donaturCount: 612,
    tenggat: '30 September 2026',
    ringkas: 'Konsentrator oksigen dan tabung isi ulang gratis bagi pasien dhuafa dengan gangguan pernapasan kronis.',
    cerita: 'Banyak pasien PPOK dan pasca-TB dhuafa harus menyewa tabung oksigen harian yang biayanya melebihi penghasilan keluarga. Program ini menyediakan konsentrator pinjaman, isi ulang gratis, dan kunjungan perawat.',
    imageUrl: '/images/campaigns/infak-oksigen.jpg',
    rincian: [
      { item: 'Konsentrator oksigen (40 unit)', nilai: 148000000 },
      { item: 'Isi ulang tabung 12 bulan', nilai: 72000000 },
      { item: 'Kunjungan perawat & edukasi keluarga', nilai: 40000000 },
    ],
    kabar: [
      { tgl: '19 Juli 2026', judul: '415 pasien terlayani', isi: 'Sembilan unit konsentrator pertama sudah beredar di rumah pasien.' },
    ],
    donaturList: [],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 6,
    slug: 'modal-mikro',
    nama: 'Modal Bangkit Usaha Mikro',
    program: 'Modal Usaha Mikro',
    lokasi: 'Bandung & Bekasi',
    target: 400000000,
    terkumpul: 268000000,
    donaturCount: 874,
    tenggat: '15 Oktober 2026',
    ringkas: 'Modal usaha tanpa bunga plus pendampingan pembukuan untuk ibu-ibu kepala keluarga.',
    cerita: 'Penerima mendapat modal bergulir, pelatihan pembukuan sederhana, dan pendampingan enam bulan. Sebanyak 418 usaha telah dibina, 76% di antaranya bertahan melewati tahun pertama.',
    imageUrl: '/images/campaigns/modal-umkm.jpg',
    rincian: [
      { item: 'Modal usaha 160 penerima', nilai: 280000000 },
      { item: 'Pelatihan & pendampingan usaha', nilai: 84000000 },
      { item: 'Monitoring dan evaluasi dampak', nilai: 36000000 },
    ],
    kabar: [
      { tgl: '18 Juli 2026', judul: 'Angkatan kelima dimulai', isi: '42 ibu kepala keluarga memulai pendampingan bulan ini.' },
    ],
    donaturList: [],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 7,
    slug: 'balita-stunting',
    nama: 'Bantuan Gizi Balita & Ibu Hamil',
    program: 'Bantuan Kesehatan',
    lokasi: 'Garut & Tasikmalaya',
    target: 350000000,
    terkumpul: 215000000,
    donaturCount: 1420,
    tenggat: '25 November 2026',
    ringkas: 'Paket makanan tambahan bergizi tinggi dan pemeriksaan rutin untuk cegah stunting pada 500 balita keluarga pra-sejahtera.',
    cerita: 'Program intervensi gizi 1000 Hari Pertama Kehidupan (HPK) berupa paket telur, susu, protein hewani, dan multivitamin dengan pantauan tenaga kesehatan terpadu.',
    imageUrl: '/images/campaigns/balita-stunting.jpg',
    rincian: [
      { item: 'Paket sembako bergizi & vitamin (500 anak)', nilai: 220000000 },
      { item: 'Pemeriksaan medis & posyandu keliling', nilai: 80000000 },
      { item: 'Edukasi pola asuh & sanitasi rumah', nilai: 50000000 },
    ],
    kabar: [
      { tgl: '15 Juli 2026', judul: 'Distribusi gizi tahap 3 tersalurkan', isi: '310 balita di 4 desa terpencil Garut Selatan telah menerima paket nutrisi lengkap.' },
    ],
    donaturList: [],
    status: 'Berjalan',
    isFeatured: true,
  },
  {
    id: 8,
    slug: 'pangan-petani',
    nama: 'Lumbung Pangan Beras Petani Dhuafa',
    program: 'Bantuan Pangan',
    lokasi: 'Indramayu & Karawang',
    target: 500000000,
    terkumpul: 420000000,
    donaturCount: 2190,
    tenggat: '10 Desember 2026',
    ringkas: 'Membeli gabah langsung dengan harga adil dari petani kecil lalu mendistribusikan beras berkualitas untuk ribuan keluarga dhuafa.',
    cerita: 'Mengintegrasikan pemberdayaan petani mustahik dengan penyaluran pangan pokok mustahik dhuafa perkotaan dan pelosok.',
    imageUrl: '/images/campaigns/pangan-petani.jpg',
    rincian: [
      { item: 'Penyerapan gabah petani lokal (50 ton)', nilai: 350000000 },
      { item: 'Pengolahan, pengemasan dan logistik', nilai: 100000000 },
      { item: 'Bantuan bibit & pupuk organik', nilai: 50000000 },
    ],
    kabar: [
      { tgl: '12 Juli 2026', judul: '35 ton beras siap salur', isi: 'Pengemasan paket 5kg beras premium telah rampung di gudang logistik Karawang.' },
    ],
    donaturList: [],
    status: 'Berjalan',
    isFeatured: true,
  },
];

// ==========================================
// 3. KABAR PENYALURAN DATA
// ==========================================
const distributionsData = [
  {
    id: 1,
    slug: 'sumur-praiwitu',
    judul: 'Sumur ke-9 Mengalir di Kampung Praiwitu',
    program: 'Wakaf Sumur',
    kampanye: 'Sumur Kehidupan Sumba Timur',
    lokasi: 'Praiwitu, Sumba Timur, NTT',
    tgl: '24 Juli 2026',
    nominal: 96000000,
    penerima: 280,
    asnaf: 'Miskin',
    mitra: 'Lembaga Air Amanah',
    status: 'Terbit',
    ringkas: 'Titik bor kesembilan selesai dan langsung melayani 280 jiwa yang sebelumnya menempuh dua jam perjalanan untuk air bersih.',
    isi: 'Pengeboran di Kampung Praiwitu menembus akuifer pada kedalaman 42 meter setelah survei geolistrik pada awal Juli. Sumur dilengkapi pompa bertenaga surya, bak tampung 5.000 liter, dan jaringan pipa ke tiga titik keran umum.\n\nPengelolaan diserahkan kepada kelompok warga yang telah dilatih merawat pompa dan mencatat pemakaian. Iuran perawatan disepakati sangat kecil dan dikelola secara terbuka oleh warga sendiri, agar sumur tetap berfungsi setelah masa pendampingan berakhir.',
    rincian: [
      { item: 'Pengeboran dan casing sumur', nilai: 42000000 },
      { item: 'Pompa surya dan panel', nilai: 31000000 },
      { item: 'Bak tampung dan perpipaan', nilai: 16000000 },
      { item: 'Pelatihan pengelola warga', nilai: 7000000 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    slug: 'qurban-tahap-satu',
    judul: 'Distribusi Qurban Tahap Pertama Menjangkau 14 Provinsi',
    program: 'Qurban',
    kampanye: 'Qurban Berkah Nusantara 1447 H',
    lokasi: '14 Provinsi di Indonesia',
    tgl: '22 Juli 2026',
    nominal: 185000000,
    penerima: 4120,
    asnaf: 'Fakir',
    mitra: 'Peternak Dhuafa Binaan',
    status: 'Terbit',
    ringkas: 'Sebanyak 2.106 ekor hewan qurban dibeli dari peternak dhuafa lalu disalurkan ke kampung nelayan, desa pegunungan, dan komunitas adat.',
    isi: 'Seluruh hewan dibeli dari peternak kecil di sekitar lokasi penyaluran, sehingga dana qurban berputar dua kali: menghidupkan ekonomi peternak dan memberi daging kepada keluarga yang jarang menikmatinya.\n\nPemotongan dilakukan bertahap dengan pengawasan petugas syariah. Daging dikemas per keluarga dan diantar langsung ke rumah penerima yang telah didata sebelumnya berdasarkan NIK.',
    rincian: [
      { item: 'Pembelian hewan dari peternak', nilai: 142000000 },
      { item: 'Pemotongan dan pengemasan', nilai: 26000000 },
      { item: 'Distribusi ke titik penerima', nilai: 17000000 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 3,
    slug: 'citarum-triwulan-dua',
    judul: '12.480 Pohon Tertanam, Tingkat Hidup 91 Persen',
    program: 'Konservasi DAS Citarum',
    kampanye: 'Sejuta Pohon untuk Citarum',
    lokasi: 'Bandung Barat, Jawa Barat',
    tgl: '21 Juli 2026',
    nominal: 120000000,
    penerima: 1240,
    asnaf: 'Fisabilillah',
    mitra: 'Yayasan Hijau Lestari',
    status: 'Terbit',
    ringkas: 'Evaluasi triwulan kedua mencatat tingkat hidup tanaman 91 persen, dengan debit air musim kemarau paling stabil sejak 2019.',
    isi: 'Penanaman difokuskan di bantaran hulu yang kehilangan tutupan lahan. Kelompok tani setempat menerima insentif perawatan selama tiga tahun, bukan hanya pada saat penanaman, sehingga tanaman benar-benar dijaga sampai tumbuh besar.\n\nPemantauan dilakukan dengan pencatatan berkala di 46 petak contoh. Warga juga mulai memanen hasil pohon produktif yang ditanam pada gelombang pertama.',
    rincian: [
      { item: 'Bibit pohon produktif dan tegakan keras', nilai: 54000000 },
      { item: 'Insentif perawatan kelompok tani', nilai: 48000000 },
      { item: 'Pembibitan desa dan pelatihan', nilai: 18000000 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 4,
    slug: 'beasiswa-gelombang-dua',
    judul: '1.842 Anak Yatim Kembali ke Bangku Sekolah',
    program: 'Beasiswa Anak Yatim',
    kampanye: 'Beasiswa Yatim Masuk Sekolah',
    lokasi: 'Jabodetabek dan Jawa Barat',
    tgl: '18 Juli 2026',
    nominal: 45000000,
    penerima: 1842,
    asnaf: 'Fisabilillah',
    mitra: 'Sekolah Juara Nusantara',
    status: 'Terbit',
    ringkas: 'Beasiswa mencakup biaya sekolah satu tahun, seragam, perlengkapan belajar, dan pendampingan mentor dua kali sebulan.',
    isi: 'Penerima difokuskan pada anak kelas 6, 9, dan 12 — tiga titik yang paling rawan putus sekolah karena biaya kelulusan dan pendaftaran jenjang berikutnya.\n\nSelain biaya, setiap anak mendapat mentor pendamping yang memantau kehadiran dan nilai. Laporan perkembangan dikirim kepada donatur setiap semester.',
    rincian: [
      { item: 'Biaya sekolah dan pendaftaran', nilai: 28000000 },
      { item: 'Seragam dan perlengkapan belajar', nilai: 11000000 },
      { item: 'Pendampingan mentor', nilai: 6000000 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 5,
    slug: 'oksigen-cakung',
    judul: 'Sembilan Konsentrator Oksigen Beredar di Rumah Pasien',
    program: 'Program Infak Oksigen',
    kampanye: 'Infak Oksigen untuk Dhuafa',
    lokasi: 'Jakarta Timur dan Bekasi',
    tgl: '19 Juli 2026',
    nominal: 32500000,
    penerima: 415,
    asnaf: 'Miskin',
    mitra: 'Rumah Zakat Sehat',
    status: 'Terbit',
    ringkas: 'Unit konsentrator pertama dipinjamkan gratis kepada pasien PPOK dan pasca-TB dhuafa, disertai kunjungan perawat.',
    isi: 'Sebelumnya keluarga pasien harus menyewa tabung oksigen harian yang biayanya kerap melebihi penghasilan mereka. Dengan konsentrator pinjaman, biaya harian itu hilang sepenuhnya.\n\nPerawat berkunjung dua pekan sekali untuk memeriksa alat sekaligus mengedukasi keluarga tentang penggunaan yang aman.',
    rincian: [
      { item: 'Konsentrator oksigen 9 unit', nilai: 22500000 },
      { item: 'Isi ulang tabung cadangan', nilai: 6000000 },
      { item: 'Kunjungan perawat dan edukasi', nilai: 4000000 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
  },
];

// ==========================================
// 4. FAQ DATA (20 ITEM RESMI)
// ==========================================
const faqItemsData = [
  { category: 'Dasar ZIS', question: 'Apa bedanya zakat, infak, dan shodaqoh?', answer: 'Zakat adalah kewajiban yang kadarnya sudah ditentukan syariat (umumnya 2,5%), hanya boleh disalurkan kepada delapan asnaf, dan baru wajib bila harta mencapai nisab.|Infak adalah pengeluaran harta untuk kebaikan tanpa batas nominal dan tanpa ketentuan penerima yang mengikat — boleh untuk pembangunan sekolah, masjid, atau operasional program.|Shodaqoh maknanya paling luas: mencakup harta maupun non-harta seperti tenaga dan ilmu. Di AmanahZakat, donasi infak dan shodaqoh dicatat pada rekening dana terpisah dari dana zakat.', sourceReference: 'QS. At-Taubah: 60 · UU 23/2011', urutan: 1 },
  { category: 'Dasar ZIS', question: 'Siapa saja yang berhak menerima zakat?', answer: 'Delapan golongan (asnaf): fakir, miskin, amil, mualaf, riqab (memerdekakan budak), gharimin (terlilit utang), fi sabilillah, dan ibnu sabil (musafir yang kehabisan bekal).|Seluruh penyaluran AmanahZakat dicatat per asnaf dan bisa Anda lihat pada halaman Laporan Dampak.', sourceReference: 'QS. At-Taubah: 60', urutan: 2 },
  { category: 'Dasar ZIS', question: 'Apa itu nisab dan haul?', answer: 'Nisab adalah batas minimal harta yang membuat zakat menjadi wajib — untuk harta simpanan setara 85 gram emas murni.|Haul adalah masa kepemilikan satu tahun hijriah. Bila harta belum genap setahun atau belum mencapai nisab, belum ada kewajiban zakat, namun tetap dianjurkan berinfak.', sourceReference: 'Fatwa MUI · Baznas', urutan: 3 },
  { category: 'Zakat Maal', question: 'Bagaimana cara menghitung zakat harta simpanan?', answer: 'Jumlahkan seluruh aset likuid: uang tunai, tabungan, deposito, emas dan perak, serta investasi, lalu kurangi utang yang jatuh tempo.|Bandingkan hasilnya dengan nisab, yaitu 85 gram × harga emas per gram hari ini. Bila mencapai atau melebihi nisab dan sudah genap satu tahun, zakatnya 2,5% dari harta bersih tersebut.|Menu Hitung Zakat di situs ini melakukan perhitungan itu untuk Anda secara otomatis.', sourceReference: 'Fatwa MUI 8/2011', urutan: 4 },
  { category: 'Zakat Maal', question: 'Apakah rumah yang saya tempati kena zakat?', answer: 'Tidak. Rumah tinggal, kendaraan yang dipakai sehari-hari, dan perabot rumah tangga termasuk kebutuhan pokok sehingga tidak dizakati.|Namun bila properti disewakan atau diperjualbelikan sebagai usaha, hasil sewa dan nilai perdagangannya masuk hitungan zakat.', sourceReference: 'Ijtihad ulama kontemporer', urutan: 5 },
  { category: 'Zakat Maal', question: 'Bagaimana zakat emas dan perhiasan?', answer: 'Emas batangan dan tabungan emas dizakati 2,5% bila mencapai 85 gram dan genap satu haul.|Perhiasan yang dipakai wajar sehari-hari menurut jumhur ulama tidak dizakati; yang disimpan sebagai investasi tetap dizakati.', sourceReference: 'Fatwa MUI', urutan: 6 },
  { category: 'Zakat Profesi', question: 'Berapa zakat dari gaji bulanan saya?', answer: 'Kadarnya 2,5%. Ada dua pendekatan: bruto — langsung 2,5% dari seluruh penghasilan bulanan; atau neto — 2,5% dari penghasilan setelah dikurangi kebutuhan pokok.|Nisab bulanan setara 522 kg beras dibagi dua belas, atau sekitar penghasilan Rp 6,7 juta per bulan pada harga beras saat ini.|Contoh: gaji Rp 10.000.000 dengan pendekatan bruto menghasilkan zakat Rp 250.000 per bulan.', sourceReference: 'Fatwa MUI 3/2003', urutan: 7 },
  { category: 'Zakat Profesi', question: 'Zakat profesi dibayar bulanan atau tahunan?', answer: 'Keduanya sah. Bulanan lebih ringan dan lebih tertib, tahunan lebih mudah dicocokkan dengan SPT.|Bila Anda memilih bulanan lewat UPZ kantor, potongan otomatis dilakukan dari payroll dan bukti setornya terbit setiap bulan.', sourceReference: 'Fatwa MUI 3/2003', urutan: 8 },
  { category: 'Zakat Profesi', question: 'Apakah THR dan bonus kena zakat?', answer: 'Ya, THR, bonus, dan komisi termasuk penghasilan sehingga dihitung dengan kadar yang sama, yaitu 2,5% pada saat diterima.', sourceReference: 'Fatwa MUI 3/2003', urutan: 9 },
  { category: 'Pertanian & Tambang', question: 'Berapa kadar zakat hasil panen?', answer: 'Nisabnya 653 kg gabah kering dan tidak menunggu haul — zakat dikeluarkan setiap kali panen.|Kadarnya 10% bila lahan diairi hujan atau mata air tanpa biaya, dan 5% bila memakai irigasi berbiaya seperti pompa atau sewa air.', sourceReference: 'HR. Bukhari · Fatwa MUI', urutan: 10 },
  { category: 'Pertanian & Tambang', question: 'Bagaimana zakat hasil tambang?', answer: 'Nisabnya setara 85 gram emas, tanpa haul — dikeluarkan begitu hasil tambang diperoleh.|Kadarnya 2,5% dari nilai bersih setelah dikurangi biaya eksplorasi dan ekstraksi.', sourceReference: 'Fatwa MUI', urutan: 11 },
  { category: 'Infak & Shodaqoh', question: 'Apakah infak bisa saya arahkan ke program tertentu?', answer: 'Bisa. Setiap kampanye di situs ini memiliki rekening dana tersendiri, sehingga donasi Anda hanya terpakai untuk program yang Anda pilih.|Bila program telah tuntas dan dana tersisa, penggunaannya dialihkan ke program sejenis dan diumumkan pada halaman Kabar Penyaluran.', sourceReference: 'Kebijakan AmanahZakat', urutan: 12 },
  { category: 'Infak & Shodaqoh', question: 'Apa itu wakaf pohon dan infak oksigen?', answer: 'Wakaf Pohon adalah wakaf produktif: pohon ditanam dan dirawat, hasilnya dikelola untuk kemaslahatan umum secara berkelanjutan.|Infak Oksigen membiayai penghijauan kawasan kritis, termasuk Konservasi DAS Citarum, dengan laporan jumlah pohon dan titik tanam yang dapat ditelusuri.', sourceReference: 'Program AmanahZakat', urutan: 13 },
  { category: 'Pajak & Bukti', question: 'Apakah zakat mengurangi pajak penghasilan saya?', answer: 'Zakat yang dibayarkan melalui lembaga amil resmi yang disahkan pemerintah dapat menjadi pengurang penghasilan bruto dalam SPT Tahunan Anda.|Syaratnya, Anda melampirkan bukti setor sah — di AmanahZakat berupa SBMZ (Surat Bukti Membayar Zakat) yang memuat QR verifikasi.|Perlu dicatat: zakat menjadi pengurang penghasilan bruto, bukan pengurang pajak terutang secara langsung.', sourceReference: 'UU 36/2008 Pasal 9 · PP 60/2010', urutan: 14 },
  { category: 'Pajak & Bukti', question: 'Bagaimana cara mendapatkan SBMZ?', answer: 'SBMZ terbit otomatis setiap kali pembayaran zakat Anda berhasil, dan dapat diunduh sebagai PDF dari halaman konfirmasi maupun dari email tanda terima.|Untuk keperluan SPT, tersedia pula Rekap Tahunan Muzakki yang merangkum seluruh setoran Anda dalam satu tahun pajak.|Infak dan shodaqoh tetap mendapat bukti pembayaran, namun bukan SBMZ karena tidak diakui sebagai pengurang penghasilan bruto.', sourceReference: 'Kebijakan AmanahZakat', urutan: 15 },
  { category: 'Pajak & Bukti', question: 'Bagaimana kantor pajak memverifikasi bukti saya?', answer: 'Setiap SBMZ memuat kode unik dan QR yang mengarah ke halaman Verifikasi Bukti di situs ini.|Petugas cukup memindai QR atau memasukkan kode tersebut untuk melihat status keabsahan, nominal, tanggal, dan jenis dana.', sourceReference: 'Kebijakan AmanahZakat', urutan: 16 },
  { category: 'Teknis Donasi', question: 'Metode pembayaran apa saja yang tersedia?', answer: 'Tersedia QRIS, virtual account bank, transfer manual, serta e-wallet. Seluruh transaksi diproses melalui payment gateway berlisensi Bank Indonesia.|Dana masuk langsung ke rekening lembaga, bukan rekening pribadi.', sourceReference: 'Kebijakan AmanahZakat', urutan: 17 },
  { category: 'Teknis Donasi', question: 'Berapa hak amil yang diambil dari donasi saya?', answer: 'Hak amil untuk operasional lembaga diambil dari porsi amil sesuai ketentuan, dan seluruh penggunaannya dilaporkan dalam laporan keuangan yang diaudit.|Rincian alokasi tiap kampanye bisa Anda lihat pada halaman detail program.', sourceReference: 'UU 23/2011 · Fatwa MUI 8/2011', urutan: 18 },
  { category: 'Teknis Donasi', question: 'Bisakah saya berdonasi anonim?', answer: 'Bisa. Centang opsi hamba Allah saat mengisi formulir donasi; nama Anda tidak akan tampil di daftar donatur publik.|Namun untuk penerbitan SBMZ, identitas dan NPWP tetap diperlukan karena dokumen tersebut bersifat resmi.', sourceReference: 'Kebijakan AmanahZakat', urutan: 19 },
  { category: 'Teknis Donasi', question: 'Bagaimana perusahaan membuka UPZ karyawan?', answer: 'Perusahaan dapat membentuk Unit Pengumpul Zakat internal dengan perjanjian kerja sama, lalu memotong zakat karyawan lewat payroll.|PIC perusahaan mendapat portal tersendiri untuk mengunggah batch potongan dan memantau serapan dana karyawannya, serta laporan bagi hasil pengelolaan.', sourceReference: 'UU 23/2011', urutan: 20 },
];

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // 1. Seed Modules & Menus
  const moduleMap = new Map<string, string>();
  for (const modul of modulesData) {
    const saved = await prisma.modul.upsert({
      where: { kodeModul: modul.kodeModul },
      update: { namaModul: modul.namaModul, urutan: modul.urutan, isActive: true },
      create: modul,
    });
    moduleMap.set(modul.kodeModul, saved.id);
  }

  const menuMap = new Map<string, string>();
  for (const menu of menusData) {
    const modulId = moduleMap.get(menu.kodeModul);
    if (!modulId) continue;

    const saved = await prisma.menu.upsert({
      where: { kodeMenu: menu.kodeMenu },
      update: {
        modulId,
        namaMenu: menu.namaMenu,
        kodeTampil: menu.kodeTampil,
        icon: menu.icon ?? null,
        urutan: menu.urutan,
        isActive: true,
      },
      create: {
        modulId,
        kodeMenu: menu.kodeMenu,
        namaMenu: menu.namaMenu,
        kodeTampil: menu.kodeTampil,
        icon: menu.icon ?? null,
        urutan: menu.urutan,
      },
    });
    menuMap.set(menu.kodeMenu, saved.id);
  }

  // 2. Seed Permissions & Roles
  const permissionMap = new Map<string, string>();
  for (const menu of menusData) {
    const menuId = menuMap.get(menu.kodeMenu);
    if (!menuId) continue;

    for (const action of menu.actions) {
      const kodePermission = `${menu.kodeMenu}.${action.aksi}`;
      const saved = await prisma.permission.upsert({
        where: { kodePermission },
        update: { namaPermission: action.nama, aksi: action.aksi, menuId },
        create: { kodePermission, namaPermission: action.nama, aksi: action.aksi, menuId },
      });
      permissionMap.set(kodePermission, saved.id);
    }
  }

  const superAdminRole = await prisma.role.upsert({
    where: { kodeRole: 'SUPER_ADMIN' },
    update: { namaRole: 'Super Admin System', deskripsi: 'Akses penuh seluruh modul', isSystem: true },
    create: { kodeRole: 'SUPER_ADMIN', namaRole: 'Super Admin System', deskripsi: 'Akses penuh seluruh modul', isSystem: true },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: superAdminRole.id } });
  const allPermRows = Array.from(permissionMap.values()).map((pId) => ({ roleId: superAdminRole.id, permissionId: pId }));
  await prisma.rolePermission.createMany({ data: allPermRows, skipDuplicates: true });

  const passwordHash = await bcrypt.hash('password123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash, isActive: true, isOtpVerified: true },
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

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdminUser.id, roleId: superAdminRole.id },
  });

  // 3. Seed ERP Base Entities: Programs & Muzakki
  const muzakkiSeed = [
    {
      nomor: 'MZK-2026-00001',
      nama: 'PT Telkom Indonesia (CSR)',
      tipe: 'Korporat',
      nikAtauNpwp: '01.001.001.1-012.000',
      hp: '0218800000',
      email: 'csr@telkom.co.id',
      alamat: 'Jl. Japati No. 1, Bandung',
      totalSetoran: 150000000,
      transaksiCount: 3,
      tanggalBergabung: '3 Januari 2024',
    },
    {
      nomor: 'MZK-2026-00002',
      nama: 'H. Ahmad Fauzi, S.E.',
      tipe: 'Perorangan',
      nikAtauNpwp: '32.123.456.7-012.000',
      hp: '08111222333',
      email: 'ahmad.fauzi@example.com',
      alamat: 'Jl. Sudirman No. 88, Jakarta Selatan',
      totalSetoran: 37500000,
      transaksiCount: 5,
      tanggalBergabung: '12 Februari 2025',
    },
    {
      nomor: 'MZK-2026-00003',
      nama: 'UPZ PT Paragon Technology',
      tipe: 'UPZ',
      nikAtauNpwp: '02.345.678.9-012.000',
      hp: '02177889900',
      email: 'upz@paragoncorp.com',
      alamat: 'Tangerang, Banten',
      totalSetoran: 95000000,
      transaksiCount: 4,
      tanggalBergabung: '20 Maret 2024',
    },
    {
      nomor: 'MZK-2026-00004',
      nama: 'Hj. Siti Rahmawati',
      tipe: 'Perorangan',
      nikAtauNpwp: '36.987.654.3-012.000',
      hp: '082233445566',
      email: 'siti.rahmawati@example.com',
      alamat: 'Surabaya, Jawa Timur',
      totalSetoran: 28000000,
      transaksiCount: 6,
      tanggalBergabung: '5 April 2025',
    },
    {
      nomor: 'MZK-2026-00005',
      nama: 'Bpk. Hendra Wijaya',
      tipe: 'Perorangan',
      nikAtauNpwp: '31.555.444.3-012.000',
      hp: '081398765432',
      email: 'hendra.wijaya@example.com',
      alamat: 'Depok, Jawa Barat',
      totalSetoran: 12250000,
      transaksiCount: 2,
      tanggalBergabung: '18 Juni 2025',
    },
    {
      nomor: 'MZK-2026-0819',
      nama: 'H. Ahmad Dahlan, S.E.',
      tipe: 'Perorangan',
      nikAtauNpwp: '01.234.567.8-012.000',
      hp: '081234567890',
      email: 'ahmad.dahlan@example.com',
      alamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat',
      totalSetoran: 27500000,
      transaksiCount: 7,
      tanggalBergabung: '10 Januari 2025',
    },
    {
      nomor: 'MZK-2026-00006',
      nama: 'CV Berkah Sejahtera',
      tipe: 'Korporat',
      nikAtauNpwp: '02.111.222.3-012.000',
      hp: '02155667788',
      email: 'finance@berkahsejahtera.co.id',
      alamat: 'Bekasi, Jawa Barat',
      totalSetoran: 45000000,
      transaksiCount: 2,
      tanggalBergabung: '1 Juli 2025',
    },
  ] as const;

  const muzakkiMap = new Map<string, string>();
  for (const m of muzakkiSeed) {
    const saved = await prisma.muzakki.upsert({
      where: { nomor: m.nomor },
      update: {
        nama: m.nama,
        tipe: m.tipe,
        nikAtauNpwp: m.nikAtauNpwp,
        hp: m.hp,
        email: m.email,
        alamat: m.alamat,
        totalSetoran: m.totalSetoran,
        transaksiCount: m.transaksiCount,
      },
      create: { ...m },
    });
    muzakkiMap.set(m.nomor, saved.id);
  }

  const erpMuzakki = { id: muzakkiMap.get('MZK-2026-0819')! };

  await prisma.programZis.upsert({
    where: { id: 'prog-001' },
    update: { nama: 'Program Air Bersih & Wakaf Sumur', pilar: 'Kemanusiaan', paguAnggaran: 500000000, targetPenerima: 2500, penanggungJawab: 'Ahmad Fauzi' },
    create: { id: 'prog-001', nama: 'Program Air Bersih & Wakaf Sumur', pilar: 'Kemanusiaan', paguAnggaran: 500000000, targetPenerima: 2500, penanggungJawab: 'Ahmad Fauzi' },
  });

  const penerimaanSeed = [
    { noKwitansi: 'KWT/2026/01/001', noSbmz: 'SBMZ/2026/01/ASK001001', tanggal: '2026-01-08', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan I', nominal: 30000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal korporat Januari' },
    { noKwitansi: 'KWT/2026/01/002', noSbmz: 'SBMZ/2026/01/ASK001002', tanggal: '2026-01-15', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Januari 2026', nominal: 12000000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi rutin' },
    { noKwitansi: 'KWT/2026/01/003', noSbmz: 'SBMZ/2026/01/ASK001003', tanggal: '2026-01-22', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Infak', programNama: 'Program Beasiswa Anak Yatim', nominal: 18000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak terikat beasiswa' },
    { noKwitansi: 'KWT/2026/02/001', noSbmz: 'SBMZ/2026/02/ASK001001', tanggal: '2026-02-05', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Zakat Maal', programNama: 'Zakat harta usaha', nominal: 25000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal CV Berkah' },
    { noKwitansi: 'KWT/2026/02/002', noSbmz: 'SBMZ/2026/02/ASK001002', tanggal: '2026-02-12', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Februari 2026', nominal: 15000000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi bulanan' },
    { noKwitansi: 'KWT/2026/02/003', noSbmz: 'SBMZ/2026/02/ASK001003', tanggal: '2026-02-20', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Infak', programNama: 'Operasional Tanggap Darurat', nominal: 15000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak CSR Februari' },
    { noKwitansi: 'KWT/2026/03/001', noSbmz: 'SBMZ/2026/03/ASK001001', tanggal: '2026-03-03', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan I', nominal: 45000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal korporat Maret' },
    { noKwitansi: 'KWT/2026/03/002', noSbmz: 'SBMZ/2026/03/ASK001002', tanggal: '2026-03-10', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Maret 2026', nominal: 20000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Potongan zakat UPZ' },
    { noKwitansi: 'KWT/2026/03/003', noSbmz: 'SBMZ/2026/03/ASK001003', tanggal: '2026-03-18', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Infak', programNama: 'Wakaf Produktif UMKM', nominal: 25000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak program UMKM' },
    { noKwitansi: 'KWT/2026/04/001', noSbmz: 'SBMZ/2026/04/ASK001001', tanggal: '2026-04-02', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan II', nominal: 70000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal korporat April' },
    { noKwitansi: 'KWT/2026/04/002', noSbmz: 'SBMZ/2026/04/ASK001002', tanggal: '2026-04-14', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan April 2026', nominal: 25000000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi April' },
    { noKwitansi: 'KWT/2026/04/003', noSbmz: 'SBMZ/2026/04/ASK001003', tanggal: '2026-04-25', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Infak', programNama: 'Program Beasiswa Anak Yatim', nominal: 35000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak beasiswa April' },
    { noKwitansi: 'KWT/2026/05/001', noSbmz: 'SBMZ/2026/05/ASK001001', tanggal: '2026-05-06', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Zakat Maal', programNama: 'Zakat harta usaha', nominal: 35000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal Mei' },
    { noKwitansi: 'KWT/2026/05/002', noSbmz: 'SBMZ/2026/05/ASK001002', tanggal: '2026-05-15', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Mei 2026', nominal: 17000000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi Mei' },
    { noKwitansi: 'KWT/2026/05/003', noSbmz: 'SBMZ/2026/05/ASK001003', tanggal: '2026-05-22', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Infak', programNama: 'Operasional Tanggap Darurat', nominal: 22000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak CSR Mei' },
    { noKwitansi: 'KWT/2026/06/001', noSbmz: 'SBMZ/2026/06/ASK001001', tanggal: '2026-06-04', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan II', nominal: 30000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal UPZ Juni' },
    { noKwitansi: 'KWT/2026/06/002', noSbmz: 'SBMZ/2026/06/ASK001002', tanggal: '2026-06-12', muzakkiNomor: 'MZK-2026-0819', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Juni 2026', nominal: 18000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi Juni' },
    { noKwitansi: 'KWT/2026/06/003', noSbmz: 'SBMZ/2026/06/ASK001003', tanggal: '2026-06-20', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Infak', programNama: 'Pembangunan Sumur Bersih', nominal: 20000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak sumur bersih' },
    { noKwitansi: 'KWT/2026/07/001', noSbmz: 'SBMZ/2026/07/ASK001001', tanggal: '2026-07-05', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan III', nominal: 50000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat maal korporat Juli' },
    { noKwitansi: 'KWT/2026/07/002', noSbmz: 'SBMZ/2026/07/ASK001002', tanggal: '2026-07-12', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Juli 2026', nominal: 18000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Potongan zakat UPZ Juli' },
    { noKwitansi: 'KWT/2026/07/003', noSbmz: 'SBMZ/2026/07/ASK001003', tanggal: '2026-07-18', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Infak', programNama: 'Program Beasiswa Anak Yatim', nominal: 35000000, kanal: 'QRIS', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak beasiswa Juli' },
    { noKwitansi: 'KWT/2026/08/001', noSbmz: 'SBMZ/2026/08/ASK001001', tanggal: '2026-08-01', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan III', nominal: 150000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat perusahaan Triwulan III' },
    { noKwitansi: 'KWT/2026/08/002', noSbmz: 'SBMZ/2026/08/ASK001002', tanggal: '2026-08-02', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Agustus 2026', nominal: 12500000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Setoran zakat penghasilan bulan Agustus' },
    { noKwitansi: 'KWT/2026/08/003', noSbmz: 'SBMZ/2026/08/ASK001003', tanggal: '2026-08-03', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Infak', programNama: 'Program Beasiswa Anak Yatim', nominal: 35000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak terikat program beasiswa' },
    { noKwitansi: 'KWT/2026/08/004', noSbmz: 'SBMZ/2026/08/ASK001004', tanggal: '2026-08-05', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Shodaqoh', programNama: 'Pembangunan Sumur Bersih', nominal: 10000000, kanal: 'Cash / Konter', rekeningTujuan: 'Kasir Konter Utama', status: 'Terverifikasi', catatan: 'Shodaqoh pembangunan sumur bersih' },
    { noKwitansi: 'KWT/2026/08/005', noSbmz: null, tanggal: '2026-08-07', muzakkiNomor: 'MZK-2026-00005', jenisZis: 'Zakat Fitrah', programNama: 'Zakat Fitrah 50 Jiwa', nominal: 2250000, kanal: 'QRIS', rekeningTujuan: 'BSI 7003456789 (Zakat Fitrah)', status: 'Menunggu Verifikasi', catatan: 'Zakat fitrah 50 jiwa karyawan' },
    { noKwitansi: 'KWT/2026/08/006', noSbmz: 'SBMZ/2026/08/ASK001006', tanggal: '2026-08-08', muzakkiNomor: 'MZK-2026-0819', jenisZis: 'Zakat Maal', programNama: 'Zakat Harta Simpanan', nominal: 12500000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001-ZAKAT-MAAL', status: 'Terverifikasi', catatan: 'Pembayaran zakat maal via web publik' },
    { noKwitansi: 'KWT/2026/08/007', noSbmz: 'SBMZ/2026/08/ASK001007', tanggal: '2026-08-10', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Wakaf Uang', programNama: 'Wakaf Produktif UMKM', nominal: 50000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7004567890 (Wakaf Uang)', status: 'Terverifikasi', catatan: 'Wakaf produktif untuk UMKM dhuafa' },
    { noKwitansi: 'KWT/2026/08/008', noSbmz: null, tanggal: '2026-08-12', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Infak', programNama: 'Bantuan Korban Bencana', nominal: 5000000, kanal: 'Marketplace', rekeningTujuan: 'Rekening Infak Operasional', status: 'Menunggu Verifikasi', catatan: 'Donasi infak via marketplace resmi' },
    { noKwitansi: 'KWT/2026/08/009', noSbmz: 'SBMZ/2026/08/ASK001009', tanggal: '2026-08-14', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Zakat Profesi', programNama: 'Zakat Profesi Juli 2026', nominal: 8750000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi rutin bulanan' },
    { noKwitansi: 'KWT/2026/08/010', noSbmz: 'SBMZ/2026/08/ASK001010', tanggal: '2026-08-16', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Infak', programNama: 'Operasional Tanggap Darurat', nominal: 25000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak CSR tanggap darurat' },
    { noKwitansi: 'KWT/2026/08/011', noSbmz: null, tanggal: '2026-08-18', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Shodaqoh', programNama: 'Paket Pangan Ramadhan', nominal: 15000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Menunggu Verifikasi', catatan: 'Potongan shodaqoh karyawan UPZ' },
    { noKwitansi: 'KWT/2026/07/014', noSbmz: 'SBMZ/2026/07/ASK004182', tanggal: '2026-07-26', muzakkiNomor: 'MZK-2026-0819', jenisZis: 'Zakat Maal', programNama: 'Zakat Harta Simpanan', nominal: 12500000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001-ZAKAT-MAAL', status: 'Terverifikasi', catatan: 'Pembayaran zakat maal periode Juli' },
  ] as const;

  for (const row of penerimaanSeed) {
    const muzakkiId = muzakkiMap.get(row.muzakkiNomor);
    if (!muzakkiId) continue;

    await prisma.transaksiPenerimaan.upsert({
      where: { noKwitansi: row.noKwitansi },
      update: {
        noSbmz: row.noSbmz,
        tanggal: row.tanggal,
        muzakkiId,
        jenisZis: row.jenisZis,
        programNama: row.programNama,
        nominal: row.nominal,
        kanal: row.kanal,
        rekeningTujuan: row.rekeningTujuan,
        status: row.status,
        catatan: row.catatan,
      },
      create: {
        noKwitansi: row.noKwitansi,
        noSbmz: row.noSbmz,
        tanggal: row.tanggal,
        muzakkiId,
        jenisZis: row.jenisZis,
        programNama: row.programNama,
        nominal: row.nominal,
        kanal: row.kanal,
        rekeningTujuan: row.rekeningTujuan,
        status: row.status,
        catatan: row.catatan,
      },
    });
  }

  // 4. Seed Public Campaigns
  for (const c of campaignsData) {
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
      create: c,
    });
  }
  console.log(`✅ ${campaignsData.length} Campaigns seeded`);

  // 5. Seed Distributions
  for (const d of distributionsData) {
    await prisma.kabarPenyaluran.upsert({
      where: { slug: d.slug },
      update: {
        judul: d.judul,
        program: d.program,
        kampanye: d.kampanye,
        lokasi: d.lokasi,
        tgl: d.tgl,
        nominal: d.nominal,
        penerima: d.penerima,
        asnaf: d.asnaf,
        mitra: d.mitra,
        status: d.status,
        ringkas: d.ringkas,
        isi: d.isi,
        rincian: d.rincian,
        imageUrl: d.imageUrl,
      },
      create: d,
    });
  }
  console.log(`✅ ${distributionsData.length} Kabar Penyaluran seeded`);

  // 6. Seed Impact Data
  await prisma.impactData.upsert({
    where: { id: 'default-impact' },
    update: {
      metrics: [
        { angka: '125.360', satuan: 'jiwa', label: 'Penerima Manfaat Terlayani', keterangan: 'Tersalurkan ke 8 asnaf di 18 provinsi Indonesia', icon: 'Users' },
        { angka: 'Rp 52,7', satuan: 'Miliar', label: 'Dana ZIS Tersalurkan', keterangan: 'Penyaluran terverifikasi sesuai prinsip syariah', icon: 'BadgeCheck' },
        { angka: '12.480', satuan: 'pohon', label: 'Pohon Ditanam & Dirawat', keterangan: 'Wakaf Pohon & Konservasi DAS Citarum', icon: 'Trees' },
        { angka: '36', satuan: 'titik', label: 'Sumur Air Bersih Dibangun', keterangan: 'Wilayah krisis air NTT, NTB, dan Sulawesi', icon: 'Droplets' },
        { angka: '1.842', satuan: 'anak', label: 'Anak Yatim Kembali Sekolah', keterangan: 'Beasiswa, seragam, dan pendampingan mentor', icon: 'GraduationCap' },
        { angka: '418', satuan: 'UMKM', label: 'Usaha Mikro Ibu Dhuafa Dibina', keterangan: 'Modal tanpa bunga & pelatihan pembukuan', icon: 'Store' },
      ],
      fundAllocations: [
        { label: 'Program Penyaluran & Penerima Manfaat', percentage: 86.5, percentageLabel: '86,5%', color: '#14509C', description: 'Alokasi langsung untuk 8 asnaf mustahik dan program kemanusiaan.' },
        { label: 'Hak Amil Pengelola Lembaga', percentage: 7.5, percentageLabel: '7,5%', color: '#C8933A', description: 'Sesuai UU No. 23/2011 & Fatwa MUI (maks. 12,5%).' },
        { label: 'Operasional UPZ & Kemitraan Lapangan', percentage: 4.0, percentageLabel: '4,0%', color: '#2B6F9E', description: 'Dukungan logistik relawan dan unit pengumpul zakat kantor.' },
        { label: 'Infrastruktur Digital & Transparansi', percentage: 2.0, percentageLabel: '2,0%', color: '#6D645B', description: 'Sistem akuntansi PSAK 109, web verifikasi, dan audit publik.' },
      ],
      beneficiaryStories: [
        { nama: 'Yohana Tamu', wilayah: 'Sumba Timur, NTT', program: 'Wakaf Sumur', kutipan: 'Dulu kami berjalan dua jam mencari air di sungai keruh. Sekarang sumur mengalir deras di tengah kampung.', peran: 'Ketua Pengelola Sumur Kampung Praiwitu' },
        { nama: 'Marlina', wilayah: 'Bandung Barat, Jawa Barat', program: 'Modal Usaha Mikro', kutipan: 'Modal awal lima juta dan bimbingan amil membuat warung kecil saya berkembang.', peran: 'Pelaku Usaha Mikro Binaan' },
      ],
      annualReports: [
        { tahun: '2025', judul: 'Laporan Keuangan & Dampak Tahunan 2025', deskripsi: 'Opini Wajar Tanpa Pengecualian (WTP) berdasarkan standar PSAK 109.', ukuranFile: '8.4 MB (PDF)', tanggalTerbit: '15 Maret 2026', auditor: 'KAP Wisnu & Rekan' },
        { tahun: '2024', judul: 'Laporan Keuangan & Dampak Tahunan 2024', deskripsi: 'Opini Wajar Tanpa Pengecualian (WTP) disertai laporan audit kepatuhan syariah.', ukuranFile: '7.1 MB (PDF)', tanggalTerbit: '20 Februari 2025', auditor: 'KAP Wisnu & Rekan' },
      ],
    },
    create: {
      id: 'default-impact',
      metrics: [
        { angka: '125.360', satuan: 'jiwa', label: 'Penerima Manfaat Terlayani', keterangan: 'Tersalurkan ke 8 asnaf di 18 provinsi Indonesia', icon: 'Users' },
        { angka: 'Rp 52,7', satuan: 'Miliar', label: 'Dana ZIS Tersalurkan', keterangan: 'Penyaluran terverifikasi sesuai prinsip syariah', icon: 'BadgeCheck' },
        { angka: '12.480', satuan: 'pohon', label: 'Pohon Ditanam & Dirawat', keterangan: 'Wakaf Pohon & Konservasi DAS Citarum', icon: 'Trees' },
        { angka: '36', satuan: 'titik', label: 'Sumur Air Bersih Dibangun', keterangan: 'Wilayah krisis air NTT, NTB, dan Sulawesi', icon: 'Droplets' },
      ],
      fundAllocations: [
        { label: 'Program Penyaluran & Penerima Manfaat', percentage: 86.5, percentageLabel: '86,5%', color: '#14509C', description: 'Alokasi langsung untuk 8 asnaf mustahik dan program kemanusiaan.' },
        { label: 'Hak Amil Pengelola Lembaga', percentage: 7.5, percentageLabel: '7,5%', color: '#C8933A', description: 'Sesuai UU No. 23/2011 & Fatwa MUI (maks. 12,5%).' },
      ],
      beneficiaryStories: [],
      annualReports: [],
    },
  });
  console.log('✅ Impact Data seeded');

  // 7. Seed FAQs
  await prisma.faqItem.deleteMany({});
  await prisma.faqItem.createMany({ data: faqItemsData });
  console.log(`✅ ${faqItemsData.length} FAQ Items seeded`);

  // 8. Seed Muzakki Auth & SBMZ Documents
  const muzakkiAuth = await prisma.muzakkiAuth.upsert({
    where: { email: 'ahmad.dahlan@example.com' },
    update: {
      nama: 'H. Ahmad Dahlan, S.E.',
      memberId: 'MZK-2026-0819',
      phone: '081234567890',
      alamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat',
      pekerjaan: 'Direktur Keuangan / Pengusaha',
      npwp: '01.234.567.8-012.000',
      nik: '3171021405800003',
      namaNpwp: 'AHMAD DAHLAN',
      alamatKpp: 'KPP Pratama Jakarta Menteng Satu',
      isNpwpVerified: true,
    },
    create: {
      memberId: 'MZK-2026-0819',
      email: 'ahmad.dahlan@example.com',
      passwordHash,
      nama: 'H. Ahmad Dahlan, S.E.',
      phone: '081234567890',
      alamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat',
      pekerjaan: 'Direktur Keuangan / Pengusaha',
      npwp: '01.234.567.8-012.000',
      nik: '3171021405800003',
      namaNpwp: 'AHMAD DAHLAN',
      alamatKpp: 'KPP Pratama Jakarta Menteng Satu',
      isNpwpVerified: true,
    },
  });

  const sbmzList = [
    { sbmzNumber: 'SBMZ/2026/07/ASK004182', transactionCode: 'ZIS-20260726-014', tahunPajak: 2026, category: 'Zakat Maal', programTitle: 'Zakat Harta Simpanan (Tabungan & Logam Mulia)', nominal: 12500000, terbilang: 'Dua Belas Juta Lima Ratus Ribu Rupiah', tanggalTerbit: '26 Juli 2026', muzakkiAuthId: muzakkiAuth.id, muzakkiNama: 'H. Ahmad Dahlan, S.E.', muzakkiNpwp: '01.234.567.8-012.000', muzakkiNik: '3171021405800003', muzakkiAlamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat' },
    { sbmzNumber: 'SBMZ/2026/06/ASK003921', transactionCode: 'ZIS-20260625-089', tahunPajak: 2026, category: 'Zakat Profesi', programTitle: 'Zakat Penghasilan Rutin Juni 2026', nominal: 2500000, terbilang: 'Dua Juta Lima Ratus Ribu Rupiah', tanggalTerbit: '25 Juni 2026', muzakkiAuthId: muzakkiAuth.id, muzakkiNama: 'H. Ahmad Dahlan, S.E.', muzakkiNpwp: '01.234.567.8-012.000', muzakkiNik: '3171021405800003', muzakkiAlamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat' },
    { sbmzNumber: 'SBMZ/2026/05/ASK003512', transactionCode: 'ZIS-20260525-055', tahunPajak: 2026, category: 'Zakat Profesi', programTitle: 'Zakat Penghasilan Rutin Mei 2026', nominal: 2500000, terbilang: 'Dua Juta Lima Ratus Ribu Rupiah', tanggalTerbit: '25 Mei 2026', muzakkiAuthId: muzakkiAuth.id, muzakkiNama: 'H. Ahmad Dahlan, S.E.', muzakkiNpwp: '01.234.567.8-012.000', muzakkiNik: '3171021405800003', muzakkiAlamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat' },
  ];

  for (const s of sbmzList) {
    await prisma.sbmzDoc.upsert({
      where: { sbmzNumber: s.sbmzNumber },
      update: s,
      create: s,
    });
  }

  // Seed Recurring Plan
  await prisma.recurringZis.upsert({
    where: { id: 'rec-001' },
    update: { title: 'Zakat Penghasilan Bulanan', category: 'Zakat Profesi', nominal: 2500000, frequency: 'Bulanan', deductDay: 25, paymentMethod: 'BSI Autodebet', status: 'Aktif', nextDeductionDate: '25 Agustus 2026', totalDonated: 12500000 },
    create: { id: 'rec-001', muzakkiAuthId: muzakkiAuth.id, title: 'Zakat Penghasilan Bulanan', category: 'Zakat Profesi', nominal: 2500000, frequency: 'Bulanan', deductDay: 25, paymentMethod: 'BSI Autodebet', status: 'Aktif', nextDeductionDate: '25 Agustus 2026', totalDonated: 12500000 },
  });

  // Seed Sample Assistance Submission
  await prisma.pengajuanBantuan.upsert({
    where: { submissionNumber: 'PB-2026-0715' },
    update: {
      nik: '3204112304890001',
      namaLengkap: 'Siti Rohimah',
      asnafCategory: 'Fakir',
      telepon: '085712345678',
      alamatLengkap: 'Kp. Sukamaju RT 02/04, Desa Ciburuy',
      provinsi: 'Jawa Barat',
      kotaKabupaten: 'Kab. Bandung Barat',
      pekerjaan: 'Buruh Cuci',
      penghasilanBulanan: 650000,
      jumlahTanggungan: 3,
      kondisiTempatTinggal: 'Menumpang di rumah kerabat',
      programBantuanDimohon: 'Bantuan Pangan & Pengobatan Balita',
      estimasiBiayaDibutuhkan: 2500000,
      status: 'Sedang Disurvei',
      tahapanProses: [
        { tahap: 'Formulir Diterima', tanggal: '15 Juli 2026', status: 'Selesai' },
        { tahap: 'Verifikasi Berkas', tanggal: '16 Juli 2026', status: 'Selesai' },
        { tahap: 'Survei Lapangan Amil', tanggal: '18 Juli 2026', status: 'Sedang Berjalan' },
      ],
    },
    create: {
      submissionNumber: 'PB-2026-0715',
      nik: '3204112304890001',
      namaLengkap: 'Siti Rohimah',
      asnafCategory: 'Fakir',
      telepon: '085712345678',
      alamatLengkap: 'Kp. Sukamaju RT 02/04, Desa Ciburuy',
      provinsi: 'Jawa Barat',
      kotaKabupaten: 'Kab. Bandung Barat',
      pekerjaan: 'Buruh Cuci',
      penghasilanBulanan: 650000,
      jumlahTanggungan: 3,
      kondisiTempatTinggal: 'Menumpang di rumah kerabat',
      programBantuanDimohon: 'Bantuan Pangan & Pengobatan Balita',
      estimasiBiayaDibutuhkan: 2500000,
      status: 'Sedang Disurvei',
      tahapanProses: [
        { tahap: 'Formulir Diterima', tanggal: '15 Juli 2026', status: 'Selesai' },
        { tahap: 'Verifikasi Berkas', tanggal: '16 Juli 2026', status: 'Selesai' },
        { tahap: 'Survei Lapangan Amil', tanggal: '18 Juli 2026', status: 'Sedang Berjalan' },
      ],
    },
  });

  // 9. Seed Hero Sliders
  const heroSlidersData = [
    {
      id: 1,
      title: 'Wujudkan Ekosistem Berkelanjutan Lewat Green Zakat',
      subtitle: 'Salurkan zakat dan wakaf untuk pemulihan daerah aliran sungai, lumbung pangan dhuafa, dan air bersih pelosok nusantara.',
      tag: 'ZAKAT BERDAYA LINGKUNGAN',
      ctaText: 'Tunaikan Zakat',
      ctaLink: '/donasi',
      secondaryCtaText: 'Lihat Program Hijau',
      secondaryCtaLink: '/kampanye?category=Konservasi+DAS+Citarum',
      imageUrl: '/images/hero_slide_green_zakat.jpg',
      badge: 'Program Unggulan',
      badgeColor: '#0B9D6D',
      isActive: true,
      order: 1,
    },
    {
      id: 2,
      title: 'Kebaikan Tanpa Batas, Menjangkau Pelosok Negeri',
      subtitle: 'Tiap rupiah zakat Anda disalurkan secara amanah, profesional, dan dapat diverifikasi langsung melalui sistem bukti setor sah SBMZ.',
      tag: 'AMANAH & TRANSPARAN',
      ctaText: 'Donasi Sekarang',
      ctaLink: '/kampanye',
      secondaryCtaText: 'Laporan Dampak',
      secondaryCtaLink: '/dampak',
      imageUrl: '/images/hero_slide_kebaikan.jpg',
      badge: 'Audit WTP 2025',
      badgeColor: '#14509C',
      isActive: true,
      order: 2,
    },
    {
      id: 3,
      title: 'Darurat Kemanusiaan: Bantuan Pangan & Medis Mustahik',
      subtitle: 'Bantu saudara kita yang membutuhkan pangan pokok, pemenuhan gizi balita cegah stunting, dan beasiswa yatim dhuafa.',
      tag: 'RESPON KEMANUSIAAN CEPAT',
      ctaText: 'Bantu Sekarang',
      ctaLink: '/donasi?campaign=balita-stunting',
      secondaryCtaText: 'Kabar Penyaluran',
      secondaryCtaLink: '/kabar-penyaluran',
      imageUrl: '/images/hero_slide_palestina.jpg',
      badge: 'Tanggap Bencana',
      badgeColor: '#C8933A',
      isActive: true,
      order: 3,
    },
  ];

  for (const h of heroSlidersData) {
    await prisma.heroSlider.upsert({
      where: { id: h.id },
      update: h,
      create: h,
    });
  }
  console.log(`✅ ${heroSlidersData.length} Hero Sliders seeded`);

  // 10. Seed Testimonials
  const testimonialsData = [
    {
      id: 'testi-001',
      name: 'H. Ahmad Dahlan, S.E.',
      role: 'Muzakki Prioritas',
      location: 'Jakarta Pusat',
      program: 'Zakat Maal & Wakaf',
      quote: 'Sangat memudahkan menunaikan zakat harta dengan kalkulator akurat, serta dokumen SBMZ yang langsung terbit resmi untuk pengurang pajak tahunan.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      isPublished: true,
      order: 1,
    },
    {
      id: 'testi-002',
      name: 'Ibu Siti Rohimah',
      role: 'Mustahik Binaan',
      location: 'Bandung Barat',
      program: 'Modal Usaha Mikro Dhuafa',
      quote: 'Alhamdulillah, berkat bantuan modal bergulir tanpa riba dan pendampingan pembukuan dari AmanahZakat, warung kami bisa berkembang dan membiayai sekolah anak.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      isPublished: true,
      order: 2,
    },
    {
      id: 'testi-003',
      name: 'Yohana Tamu',
      role: 'Tokoh Masyarakat',
      location: 'Sumba Timur, NTT',
      program: 'Wakaf Sumur Air Bersih',
      quote: 'Dulu warga harus berjalan kaki 2 jam di tengah kemarau. Kini sumur bor mengalir deras di tengah kampung kami. Terima kasih para muzakki AmanahZakat.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      isPublished: true,
      order: 3,
    },
    {
      id: 'testi-004',
      name: 'Dr. Hendra Gunawan',
      role: 'Donatur Rutin (Auto-Recurring)',
      location: 'Surabaya',
      program: 'Qurban & Beasiswa Yatim',
      quote: 'Fitur autodebet bulanan sangat praktis. Laporan penyaluran rutin via WhatsApp dan email membuat kita tenang karena tahu dana tersalurkan tepat sasaran.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      isPublished: true,
      order: 4,
    },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log(`✅ ${testimonialsData.length} Testimonials seeded`);

  // 11. Seed Web Setting
  await prisma.webSetting.upsert({
    where: { id: 'default-setting' },
    update: {
      siteName: 'AmanahZakat Peduli',
      siteTagline: 'Lembaga Amil Zakat Nasional — Amanah, Transparan & Berdaya Dampak',
      contactPhone: '0811-2100-900',
      contactEmail: 'layanan@amanahzakat.or.id',
      contactAddress: 'Gedung Menara Amanah Lt. 4, Jl. TB Simatupang No. 18, Jakarta Selatan 12520',
      socialLinks: {
        instagram: 'https://instagram.com/amanahzakat',
        facebook: 'https://facebook.com/amanahzakat',
        youtube: 'https://youtube.com/@amanahzakat',
        whatsapp: 'https://wa.me/628112100900',
      },
      bankAccounts: [
        { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7001-2345-67', atasNama: 'LAZNAS AmanahZakat Peduli - Zakat', jenis: 'Zakat' },
        { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7002-3456-78', atasNama: 'LAZNAS AmanahZakat Peduli - Infak', jenis: 'Infak/Sedekah' },
        { bank: 'Bank Central Asia (BCA)', noRekening: '5420-9988-77', atasNama: 'LAZNAS AmanahZakat Peduli', jenis: 'Operasional' },
        { bank: 'Bank Mandiri', noRekening: '127-00-1122334-4', atasNama: 'LAZNAS AmanahZakat Peduli - Wakaf', jenis: 'Wakaf' },
      ],
    },
    create: {
      id: 'default-setting',
      siteName: 'AmanahZakat Peduli',
      siteTagline: 'Lembaga Amil Zakat Nasional — Amanah, Transparan & Berdaya Dampak',
      contactPhone: '0811-2100-900',
      contactEmail: 'layanan@amanahzakat.or.id',
      contactAddress: 'Gedung Menara Amanah Lt. 4, Jl. TB Simatupang No. 18, Jakarta Selatan 12520',
      socialLinks: {
        instagram: 'https://instagram.com/amanahzakat',
        facebook: 'https://facebook.com/amanahzakat',
        youtube: 'https://youtube.com/@amanahzakat',
        whatsapp: 'https://wa.me/628112100900',
      },
      bankAccounts: [
        { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7001-2345-67', atasNama: 'LAZNAS AmanahZakat Peduli - Zakat', jenis: 'Zakat' },
        { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7002-3456-78', atasNama: 'LAZNAS AmanahZakat Peduli - Infak', jenis: 'Infak/Sedekah' },
        { bank: 'Bank Central Asia (BCA)', noRekening: '5420-9988-77', atasNama: 'LAZNAS AmanahZakat Peduli', jenis: 'Operasional' },
        { bank: 'Bank Mandiri', noRekening: '127-00-1122334-4', atasNama: 'LAZNAS AmanahZakat Peduli - Wakaf', jenis: 'Wakaf' },
      ],
    },
  });
  console.log('✅ Web Settings seeded');

  // 12. Seed Zakat Calculator Config
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

  console.log('🎉 Comprehensive database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
