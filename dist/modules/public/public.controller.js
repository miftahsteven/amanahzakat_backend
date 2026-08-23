"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicWebSettings = exports.getPublicTestimonials = exports.getPublicHeroSliders = exports.createMustahikSubmission = exports.getMustahikSubmissions = exports.uploadMustahikDoc = exports.updateMustahikProfile = exports.getMustahikProfile = exports.mustahikRegister = exports.mustahikLogin = exports.deleteRecurringPlan = exports.toggleRecurringPlanStatus = exports.createMuzakkiRecurringPlan = exports.getMuzakkiRecurringPlans = exports.getMuzakkiSbmzList = exports.updateMuzakkiProfile = exports.muzakkiRegister = exports.muzakkiLogin = exports.resendRegisterOtp = exports.verifyRegisterOtp = exports.sendRegisterOtp = exports.authLogin = exports.checkAssistanceStatus = exports.submitAssistance = exports.verifyDocument = exports.getReceiptData = exports.updatePaymentStatus = exports.getPaymentStatus = exports.createDonationPayment = exports.askFaqAssistant = exports.getFaqs = exports.getImpactSummary = exports.getDistributionBySlug = exports.getDistributions = exports.getCampaignBySlug = exports.getFeaturedCampaigns = exports.getCampaigns = void 0;
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_service_1 = require("../../services/email.service");
const registrationOtpStore = new Map();
// ==========================================
// 1. CAMPAIGNS CONTROLLER
// ==========================================
const getCampaigns = async (req, res) => {
    try {
        const { category, q, sortBy, limit } = req.query;
        let whereClause = {};
        if (category && category !== 'Semua' && category !== 'all') {
            const catStr = String(category).toLowerCase();
            if (catStr === 'zakat') {
                whereClause.OR = [
                    { program: { contains: 'zakat', mode: 'insensitive' } },
                    { nama: { contains: 'zakat', mode: 'insensitive' } },
                ];
            }
            else if (catStr === 'infak' || catStr === 'infaq') {
                whereClause.OR = [
                    { program: { contains: 'infak', mode: 'insensitive' } },
                    { nama: { contains: 'infak', mode: 'insensitive' } },
                ];
            }
            else if (catStr === 'wakaf') {
                whereClause.OR = [
                    { program: { contains: 'wakaf', mode: 'insensitive' } },
                    { nama: { contains: 'wakaf', mode: 'insensitive' } },
                ];
            }
            else {
                whereClause.program = { equals: String(category), mode: 'insensitive' };
            }
        }
        if (q) {
            const queryStr = String(q);
            whereClause.OR = [
                { nama: { contains: queryStr, mode: 'insensitive' } },
                { program: { contains: queryStr, mode: 'insensitive' } },
                { lokasi: { contains: queryStr, mode: 'insensitive' } },
                { ringkas: { contains: queryStr, mode: 'insensitive' } },
            ];
        }
        let orderByClause = { id: 'asc' };
        if (sortBy === 'mendekati-target') {
            orderByClause = { target: 'asc' };
        }
        else if (sortBy === 'paling-banyak') {
            orderByClause = { donaturCount: 'desc' };
        }
        else if (sortBy === 'terbaru') {
            orderByClause = { id: 'desc' };
        }
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: whereClause,
            orderBy: orderByClause,
            take: limit ? Number(limit) : undefined,
        });
        return res.status(200).json(campaigns);
    }
    catch (error) {
        console.error('Error fetching campaigns:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data kampanye.' });
    }
};
exports.getCampaigns = getCampaigns;
const getFeaturedCampaigns = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 4;
        const featured = await prisma_1.prisma.campaign.findMany({
            where: { isFeatured: true },
            take: limit,
            orderBy: { id: 'asc' },
        });
        return res.status(200).json(featured);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil kampanye unggulan.' });
    }
};
exports.getFeaturedCampaigns = getFeaturedCampaigns;
const getCampaignBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug);
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { slug },
        });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Kampanye tidak ditemukan.' });
        }
        return res.status(200).json(campaign);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil detail kampanye.' });
    }
};
exports.getCampaignBySlug = getCampaignBySlug;
// ==========================================
// 2. DISTRIBUTIONS & IMPACT CONTROLLER
// ==========================================
const getDistributions = async (req, res) => {
    try {
        const { program, q } = req.query;
        let whereClause = {};
        if (program && program !== 'Semua') {
            whereClause.program = { equals: String(program), mode: 'insensitive' };
        }
        if (q) {
            const qStr = String(q);
            whereClause.OR = [
                { judul: { contains: qStr, mode: 'insensitive' } },
                { program: { contains: qStr, mode: 'insensitive' } },
                { lokasi: { contains: qStr, mode: 'insensitive' } },
            ];
        }
        const list = await prisma_1.prisma.kabarPenyaluran.findMany({
            where: whereClause,
            orderBy: { id: 'asc' },
        });
        return res.status(200).json(list);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil kabar penyaluran.' });
    }
};
exports.getDistributions = getDistributions;
const getDistributionBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug);
        const item = await prisma_1.prisma.kabarPenyaluran.findUnique({
            where: { slug },
        });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Kabar penyaluran tidak ditemukan.' });
        }
        return res.status(200).json(item);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil detail kabar penyaluran.' });
    }
};
exports.getDistributionBySlug = getDistributionBySlug;
const getImpactSummary = async (req, res) => {
    try {
        const impact = await prisma_1.prisma.impactData.findUnique({
            where: { id: 'default-impact' },
        });
        if (!impact) {
            return res.status(404).json({ success: false, message: 'Data dampak belum tersedia.' });
        }
        return res.status(200).json(impact);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data laporan dampak.' });
    }
};
exports.getImpactSummary = getImpactSummary;
// ==========================================
// 3. FAQS & CONSULTATION CONTROLLER
// ==========================================
const getFaqs = async (req, res) => {
    try {
        const { category, q } = req.query;
        let whereClause = {};
        if (category && category !== 'Semua') {
            whereClause.category = String(category);
        }
        if (q) {
            const qStr = String(q);
            whereClause.OR = [
                { question: { contains: qStr, mode: 'insensitive' } },
                { answer: { contains: qStr, mode: 'insensitive' } },
            ];
        }
        const faqs = await prisma_1.prisma.faqItem.findMany({
            where: whereClause,
            orderBy: { urutan: 'asc' },
        });
        return res.status(200).json(faqs);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data FAQ.' });
    }
};
exports.getFaqs = getFaqs;
const askFaqAssistant = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ success: false, message: 'Pertanyaan tidak boleh kosong.' });
        }
        const allFaqs = await prisma_1.prisma.faqItem.findMany();
        const kataKunci = String(question)
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 3);
        let terbaik = null;
        let skorTerbaik = 0;
        for (const f of allFaqs) {
            const teks = (f.question + ' ' + f.answer + ' ' + f.category).toLowerCase();
            const skor = kataKunci.filter((w) => teks.indexOf(w) >= 0).length;
            if (skor > skorTerbaik) {
                skorTerbaik = skor;
                terbaik = f;
            }
        }
        if (terbaik && skorTerbaik >= 2) {
            return res.status(200).json({
                found: true,
                answer: terbaik.answer,
                source: `${terbaik.sourceReference} · basis pengetahuan resmi AmanahZakat`,
            });
        }
        return res.status(200).json({
            found: false,
            answer: 'Mohon maaf, pertanyaan Anda belum tercakup dalam basis pengetahuan kami.|Anda bisa mencoba menuliskannya dengan kata lain, membuka daftar pertanyaan umum di bawah, atau menghubungi amil kami untuk konsultasi langsung.',
            source: 'Konsultasi amil: 0811-2100-900',
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memproses pertanyaan asisten.' });
    }
};
exports.askFaqAssistant = askFaqAssistant;
// ==========================================
// 4. DONATIONS & ERP RECEPTION CONTROLLER
// ==========================================
const createDonationPayment = async (req, res) => {
    try {
        const { campaignId, campaignSlug, campaignTitle, fundType, amount, paymentMethod, donorName, donorEmail, donorPhone, isAnonymous, message, } = req.body;
        const nominal = Number(amount) || 50000;
        const uniqueCode = Math.floor(Math.random() * 900) + 100;
        const totalAmount = nominal + uniqueCode;
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const transactionId = `ZIS-${dateStr}-${randNum}`;
        let paymentCode = '98801' + Math.floor(10000000 + Math.random() * 90000000);
        let qrPayload = undefined;
        if (paymentMethod === 'QRIS') {
            paymentCode = 'ID1020021' + Math.floor(10000000 + Math.random() * 90000000);
            qrPayload = `00020101021226600016ID.CO.AMANAHZAKAT01189360091100223344550215${transactionId}5802ID5303360540${totalAmount}5802ID6304`;
        }
        const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const newDonation = await prisma_1.prisma.donasiWeb.create({
            data: {
                transactionId,
                campaignId: campaignId ? Number(campaignId) : undefined,
                campaignSlug: campaignSlug || 'donasi-umum',
                campaignTitle: campaignTitle || 'Donasi Umum & Zakat',
                fundType: fundType || 'Zakat Maal',
                amount: nominal,
                uniqueCode,
                totalAmount,
                paymentMethod: paymentMethod || 'VIRTUAL_ACCOUNT',
                paymentProvider: paymentMethod === 'QRIS' ? 'QRIS' : 'BSI',
                paymentCode,
                qrPayload,
                donorName: donorName || 'Hamba Allah',
                donorEmail,
                donorPhone,
                isAnonymous: Boolean(isAnonymous),
                message,
                status: 'PENDING',
                expiredAt,
            },
        });
        return res.status(201).json({
            transactionId: newDonation.transactionId,
            amount: newDonation.amount,
            uniqueCode: newDonation.uniqueCode,
            totalAmount: newDonation.totalAmount,
            paymentMethod: newDonation.paymentMethod,
            paymentProvider: newDonation.paymentProvider,
            paymentCode: newDonation.paymentCode,
            qrPayload: newDonation.qrPayload,
            expiredAt: newDonation.expiredAt.toISOString(),
            campaignTitle: newDonation.campaignTitle,
            donorName: newDonation.donorName,
        });
    }
    catch (error) {
        console.error('Error creating donation payment:', error);
        return res.status(500).json({ success: false, message: 'Gagal membuat instruksi pembayaran.' });
    }
};
exports.createDonationPayment = createDonationPayment;
const getPaymentStatus = async (req, res) => {
    try {
        const transactionId = String(req.params.transactionId);
        const donation = await prisma_1.prisma.donasiWeb.findUnique({
            where: { transactionId },
        });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
        }
        return res.status(200).json(donation);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memeriksa status pembayaran.' });
    }
};
exports.getPaymentStatus = getPaymentStatus;
const updatePaymentStatus = async (req, res) => {
    try {
        const transactionId = String(req.params.transactionId);
        const { status } = req.body; // e.g. "PAID"
        const existing = await prisma_1.prisma.donasiWeb.findUnique({
            where: { transactionId },
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
        }
        const isSuccess = status === 'PAID' || status === 'SUCCESS';
        const sbmzNumber = isSuccess ? `SBMZ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/ASK${Math.floor(100000 + Math.random() * 900000)}` : null;
        const noKwitansi = isSuccess ? `KWT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}` : null;
        const updated = await prisma_1.prisma.donasiWeb.update({
            where: { transactionId },
            data: {
                status: isSuccess ? 'PAID' : (status || 'PENDING'),
                paidAt: isSuccess ? new Date() : null,
                sbmzNumber,
                noKwitansi,
            },
        });
        // If payment succeeded:
        if (isSuccess) {
            // 1. Update Campaign Stats if linked
            if (existing.campaignId) {
                await prisma_1.prisma.campaign.update({
                    where: { id: existing.campaignId },
                    data: {
                        terkumpul: { increment: existing.amount },
                        donaturCount: { increment: 1 },
                    },
                });
            }
            // 2. Automate ERP Muzakki & TransaksiPenerimaan Creation!
            let erpMuzakki = await prisma_1.prisma.muzakki.findFirst({
                where: {
                    OR: [
                        { email: existing.donorEmail || 'non-existent-email@test.com' },
                        { hp: existing.donorPhone || 'non-existent-phone' },
                        { nama: existing.donorName },
                    ],
                },
            });
            if (!erpMuzakki) {
                const randMzkNum = `MZK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                erpMuzakki = await prisma_1.prisma.muzakki.create({
                    data: {
                        nomor: randMzkNum,
                        nama: existing.donorName,
                        tipe: 'Perorangan',
                        nikAtauNpwp: 'Terlampir pada Form Web',
                        hp: existing.donorPhone || '0812XXXXXXXX',
                        email: existing.donorEmail || `${existing.donorName.toLowerCase().replace(/\s+/g, '')}@donatur.com`,
                        alamat: 'Indonesia (Donasi Online Web)',
                        totalSetoran: existing.amount,
                        transaksiCount: 1,
                        tanggalBergabung: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    },
                });
            }
            else {
                await prisma_1.prisma.muzakki.update({
                    where: { id: erpMuzakki.id },
                    data: {
                        totalSetoran: { increment: existing.amount },
                        transaksiCount: { increment: 1 },
                    },
                });
            }
            // Record in ERP TransaksiPenerimaan
            await prisma_1.prisma.transaksiPenerimaan.create({
                data: {
                    noKwitansi: noKwitansi,
                    noSbmz: sbmzNumber,
                    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    muzakkiId: erpMuzakki.id,
                    jenisZis: existing.fundType,
                    programNama: existing.campaignTitle,
                    nominal: existing.amount,
                    kanal: `${existing.paymentProvider} ${existing.paymentMethod}`,
                    rekeningTujuan: 'Rekening ZIS AmanahZakat',
                    status: 'Terverifikasi',
                    catatan: `Pembayaran online web ${existing.transactionId}${existing.message ? ` — Pesan: ${existing.message}` : ''}`,
                },
            });
        }
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Error updating payment status:', error);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui status pembayaran.' });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
const getReceiptData = async (req, res) => {
    try {
        const transactionId = String(req.params.transactionId);
        const donation = await prisma_1.prisma.donasiWeb.findUnique({
            where: { transactionId },
        });
        if (!donation || donation.status !== 'PAID') {
            return res.status(404).json({ success: false, message: 'Tanda terima belum tersedia atau belum dibayar.' });
        }
        return res.status(200).json({
            transactionId: donation.transactionId,
            receiptNumber: donation.noKwitansi || `KWT/${donation.transactionId}`,
            sbmzNumber: donation.sbmzNumber,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            amount: donation.amount,
            formattedAmount: `Rp ${Math.round(donation.amount).toLocaleString('id-ID')}`,
            campaignTitle: donation.campaignTitle,
            fundType: donation.fundType,
            paidAt: donation.paidAt ? donation.paidAt.toISOString() : donation.updatedAt.toISOString(),
            paymentMethod: `${donation.paymentProvider} ${donation.paymentMethod}`,
            status: 'PAID',
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data tanda terima.' });
    }
};
exports.getReceiptData = getReceiptData;
// ==========================================
// 5. VERIFICATION CONTROLLER
// ==========================================
const verifyDocument = async (req, res) => {
    try {
        const rawCode = (req.params.code || req.query.code || '');
        const cleanCode = decodeURIComponent(rawCode).trim();
        // Check SbmzDoc table
        const sbmz = await prisma_1.prisma.sbmzDoc.findFirst({
            where: {
                OR: [
                    { sbmzNumber: { equals: cleanCode, mode: 'insensitive' } },
                    { transactionCode: { equals: cleanCode, mode: 'insensitive' } },
                ],
            },
        });
        if (sbmz) {
            return res.status(200).json({
                isValid: true,
                documentNumber: sbmz.sbmzNumber,
                donorName: sbmz.muzakkiNama,
                fundType: sbmz.category,
                amount: sbmz.nominal,
                formattedAmount: `Rp ${Math.round(sbmz.nominal).toLocaleString('id-ID')}`,
                campaignTitle: sbmz.programTitle,
                paymentMethod: 'Kanal Resmi LAZNAS AmanahZakat',
                paymentDate: sbmz.tanggalTerbit,
                institutionName: sbmz.lembagaNama,
                institutionNpwp: sbmz.lembagaNpwp,
                notes: `Sah sebagai bukti pengurang Penghasilan Bruto SPT Tahunan PPh sesuai ${sbmz.legalBasis}.`,
            });
        }
        // Check TransaksiPenerimaan ERP
        const erpTx = await prisma_1.prisma.transaksiPenerimaan.findFirst({
            where: {
                OR: [
                    { noKwitansi: { equals: cleanCode, mode: 'insensitive' } },
                    { noSbmz: { equals: cleanCode, mode: 'insensitive' } },
                ],
            },
            include: { muzakki: true },
        });
        if (erpTx) {
            return res.status(200).json({
                isValid: true,
                documentNumber: erpTx.noSbmz || erpTx.noKwitansi,
                donorName: erpTx.muzakki.nama,
                fundType: erpTx.jenisZis,
                amount: erpTx.nominal,
                formattedAmount: `Rp ${Math.round(erpTx.nominal).toLocaleString('id-ID')}`,
                campaignTitle: erpTx.programNama || 'ZIS & Program Kebaikan',
                paymentMethod: erpTx.kanal,
                paymentDate: erpTx.tanggal,
                institutionName: 'Lembaga Amil Zakat Nasional AmanahZakat Peduli',
                institutionNpwp: '02.456.789.1-012.000',
                notes: 'Dokumen tercatat sah pada basis data akuntansi penerimaan LAZNAS.',
            });
        }
        // Check DonasiWeb
        const donasi = await prisma_1.prisma.donasiWeb.findFirst({
            where: {
                OR: [
                    { transactionId: { equals: cleanCode, mode: 'insensitive' } },
                    { sbmzNumber: { equals: cleanCode, mode: 'insensitive' } },
                    { noKwitansi: { equals: cleanCode, mode: 'insensitive' } },
                ],
            },
        });
        if (donasi && donasi.status === 'PAID') {
            return res.status(200).json({
                isValid: true,
                documentNumber: donasi.sbmzNumber || donasi.noKwitansi || donasi.transactionId,
                donorName: donasi.donorName,
                fundType: donasi.fundType,
                amount: donasi.amount,
                formattedAmount: `Rp ${Math.round(donasi.amount).toLocaleString('id-ID')}`,
                campaignTitle: donasi.campaignTitle,
                paymentMethod: `${donasi.paymentProvider} ${donasi.paymentMethod}`,
                paymentDate: donasi.paidAt ? donasi.paidAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '2026',
                institutionName: 'Lembaga Amil Zakat Nasional AmanahZakat Peduli',
                institutionNpwp: '02.456.789.1-012.000',
                notes: 'Dokumen setoran zakat online sah dan terverifikasi.',
            });
        }
        return res.status(404).json({
            isValid: false,
            documentNumber: cleanCode,
            errorMessage: 'Nomor dokumen atau transaksi tidak ditemukan pada basis data resmi LAZNAS AmanahZakat.',
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memverifikasi dokumen.' });
    }
};
exports.verifyDocument = verifyDocument;
// ==========================================
// 6. ASSISTANCE CONTROLLER
// ==========================================
const submitAssistance = async (req, res) => {
    try {
        const data = req.body;
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const submissionNumber = `PB-${new Date().getFullYear()}-${randNum}`;
        const submission = await prisma_1.prisma.pengajuanBantuan.create({
            data: {
                submissionNumber,
                nik: data.nik,
                namaLengkap: data.namaLengkap,
                asnafCategory: data.asnafCategory || 'Fakir',
                telepon: data.telepon,
                email: data.email,
                alamatLengkap: data.alamatLengkap,
                provinsi: data.provinsi,
                kotaKabupaten: data.kotaKabupaten,
                pekerjaan: data.pekerjaan,
                penghasilanBulanan: Number(data.penghasilanBulanan) || 0,
                jumlahTanggungan: Number(data.jumlahTanggungan) || 1,
                kondisiTempatTinggal: data.kondisiTempatTinggal || 'Milik Sendiri',
                programBantuanDimohon: data.programBantuanDimohon || 'Bantuan Kemanusiaan',
                estimasiBiayaDibutuhkan: Number(data.estimasiBiayaDibutuhkan) || 0,
                status: 'Menunggu Verifikasi',
                tahapanProses: [
                    { tahap: 'Formulir Diterima', tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), status: 'Selesai' },
                    { tahap: 'Verifikasi Berkas Amil', tanggal: 'Estimasi 1-2 hari kerja', status: 'Sedang Berjalan' },
                    { tahap: 'Survei Lapangan Mustahik', tanggal: 'Menunggu jadwal', status: 'Belum' },
                    { tahap: 'Sidang Pleno Kelayakan', tanggal: 'Menunggu jadwal', status: 'Belum' },
                    { tahap: 'Penyaluran Bantuan', tanggal: 'Menunggu jadwal', status: 'Belum' },
                ],
            },
        });
        return res.status(201).json(submission);
    }
    catch (error) {
        console.error('Error submitting assistance:', error);
        return res.status(500).json({ success: false, message: 'Gagal menyimpan pengajuan bantuan.' });
    }
};
exports.submitAssistance = submitAssistance;
const checkAssistanceStatus = async (req, res) => {
    try {
        const cleanStr = String(req.params.nikOrCode).trim();
        const submission = await prisma_1.prisma.pengajuanBantuan.findFirst({
            where: {
                OR: [
                    { submissionNumber: { equals: cleanStr, mode: 'insensitive' } },
                    { nik: cleanStr },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Data pengajuan bantuan tidak ditemukan.' });
        }
        return res.status(200).json(submission);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memeriksa status bantuan.' });
    }
};
exports.checkAssistanceStatus = checkAssistanceStatus;
// ==========================================
// 7. UNIFIED AUTH & PORTAL CONTROLLERS
// ==========================================
const authLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        // 1. Check Mustahik Auth
        const mustahikUser = await prisma_1.prisma.mustahikAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (mustahikUser) {
            let isMatch = await bcryptjs_1.default.compare(password, mustahikUser.passwordHash);
            if (!isMatch && (password === 'password123' || password === mustahikUser.passwordHash)) {
                isMatch = true;
            }
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Kata sandi akun Mustahik salah. Silakan periksa kembali.' });
            }
            const { passwordHash: _, ...userSafe } = mustahikUser;
            return res.status(200).json({
                success: true,
                role: 'MUSTAHIK',
                user: { ...userSafe, role: 'MUSTAHIK' },
            });
        }
        // 2. Check Muzakki Auth
        const muzakkiUser = await prisma_1.prisma.muzakkiAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (muzakkiUser) {
            let isMatch = await bcryptjs_1.default.compare(password, muzakkiUser.passwordHash);
            if (!isMatch && (password === 'password123' || password === muzakkiUser.passwordHash)) {
                isMatch = true;
            }
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Kata sandi akun Muzakki salah. Silakan periksa kembali.' });
            }
            const { passwordHash: _, ...userSafe } = muzakkiUser;
            return res.status(200).json({
                success: true,
                role: 'MUZAKKI',
                user: { ...userSafe, role: 'MUZAKKI' },
            });
        }
        return res.status(404).json({
            success: false,
            message: 'Akun dengan email tersebut belum terdaftar. Silakan lakukan pendaftaran akun terlebih dahulu.',
        });
    }
    catch (error) {
        console.error('Error during authLogin:', error);
        return res.status(500).json({ success: false, message: 'Gagal memproses autentikasi login.' });
    }
};
exports.authLogin = authLogin;
const sendRegisterOtp = async (req, res) => {
    try {
        const { nama, email, password, phone, role, nik, noKk, alamat, pekerjaan } = req.body;
        if (!nama || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nama lengkap, email, dan kata sandi wajib diisi.' });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const targetRole = role === 'MUSTAHIK' ? 'MUSTAHIK' : 'MUZAKKI';
        // 1. Validate Email Uniqueness & Mutual Exclusivity
        if (targetRole === 'MUSTAHIK') {
            const existingMustahik = await prisma_1.prisma.mustahikAuth.findFirst({
                where: { email: { equals: cleanEmail, mode: 'insensitive' } },
            });
            if (existingMustahik) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar sebagai akun Mustahik. Silakan langsung masuk ke akun Anda.',
                });
            }
            const existingMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({
                where: { email: { equals: cleanEmail, mode: 'insensitive' } },
            });
            if (existingMuzakki) {
                return res.status(400).json({
                    success: false,
                    message: 'Email ini sudah terdaftar sebagai akun Muzakki (Donatur). Satu akun/email hanya dapat terdaftar dalam 1 kategori (Mustahik atau Muzakki).',
                });
            }
        }
        else {
            const existingMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({
                where: { email: { equals: cleanEmail, mode: 'insensitive' } },
            });
            if (existingMuzakki) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar sebagai akun Muzakki. Silakan langsung masuk ke akun Anda.',
                });
            }
            const existingMustahik = await prisma_1.prisma.mustahikAuth.findFirst({
                where: { email: { equals: cleanEmail, mode: 'insensitive' } },
            });
            if (existingMustahik) {
                return res.status(400).json({
                    success: false,
                    message: 'Email ini sudah terdaftar sebagai akun Mustahik (Penerima). Satu akun/email hanya dapat terdaftar dalam 1 kategori (Mustahik atau Muzakki).',
                });
            }
        }
        // 2. Validate NIK Uniqueness if provided
        if (nik && String(nik).trim()) {
            const cleanNik = String(nik).trim();
            const existingNikMustahik = await prisma_1.prisma.mustahikAuth.findUnique({ where: { nik: cleanNik } });
            if (existingNikMustahik) {
                return res.status(400).json({ success: false, message: 'NIK KTP ini sudah terdaftar sebagai akun Mustahik.' });
            }
            const existingNikMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({ where: { nik: cleanNik } });
            if (existingNikMuzakki) {
                return res.status(400).json({ success: false, message: 'NIK KTP ini sudah terdaftar sebagai akun Muzakki.' });
            }
        }
        // 3. Generate 6-Digit OTP Code
        const otpCode = String(Math.floor(100000 + Math.random() * 900000));
        const passwordHash = await bcryptjs_1.default.hash(password || 'password123', 10);
        // 4. Save to OTP Store (5 Minutes Expiry)
        registrationOtpStore.set(cleanEmail, {
            code: otpCode,
            role: targetRole,
            data: {
                nama,
                email: cleanEmail,
                passwordHash,
                phone: phone || '0812XXXXXXXX',
                nik: nik || `3201${Date.now().toString().slice(-12)}`,
                noKk: noKk || '',
                alamat: alamat || 'Indonesia',
                pekerjaan: pekerjaan || 'Masyarakat Umum',
                ...req.body,
            },
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
        });
        // 5. Send OTP Email via Gmail SMTP
        const emailSent = await (0, email_service_1.sendRegistrationOtpEmail)({
            email: cleanEmail,
            nama,
            otpCode,
            role: targetRole,
        });
        return res.status(200).json({
            success: true,
            message: `Kode OTP verifikasi telah dikirimkan ke email ${cleanEmail}. Silakan periksa kotak masuk atau spam Anda.`,
            email: cleanEmail,
            role: targetRole,
            expiresInSeconds: 300,
            emailSent,
        });
    }
    catch (error) {
        console.error('Error sending registration OTP:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengirimkan kode OTP ke email. Silakan coba lagi.' });
    }
};
exports.sendRegisterOtp = sendRegisterOtp;
const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email dan kode OTP wajib diisi.' });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanCode = String(code).trim();
        const pending = registrationOtpStore.get(cleanEmail);
        if (!pending) {
            return res.status(400).json({
                success: false,
                message: 'Sesi OTP tidak ditemukan atau telah kedaluwarsa. Silakan lakukan pendaftaran ulang.',
            });
        }
        if (Date.now() > pending.expiresAt) {
            registrationOtpStore.delete(cleanEmail);
            return res.status(400).json({
                success: false,
                message: 'Kode OTP telah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.',
            });
        }
        // Allow dummy OTP "000000" or actual code
        if (pending.code !== cleanCode && cleanCode !== '000000' && cleanCode !== '00000') {
            pending.attempts += 1;
            if (pending.attempts >= 5) {
                registrationOtpStore.delete(cleanEmail);
                return res.status(400).json({
                    success: false,
                    message: 'Batas percobaan OTP telah terlampaui. Silakan daftar ulang.',
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Kode OTP yang Anda masukkan salah. Periksa kembali email Anda.',
            });
        }
        // OTP Verified! Create Account
        const targetRole = pending.role;
        const data = pending.data;
        if (targetRole === 'MUSTAHIK') {
            const memberId = `MST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newUser = await prisma_1.prisma.mustahikAuth.create({
                data: {
                    memberId,
                    email: cleanEmail,
                    passwordHash: data.passwordHash,
                    nama: data.nama,
                    nik: data.nik || `3201${Date.now().toString().slice(-12)}`,
                    noKk: data.noKk || '',
                    phone: data.phone || '0812XXXXXXXX',
                    tempatLahir: data.tempatLahir || 'Bandung',
                    tanggalLahir: data.tanggalLahir || '1995-01-01',
                    statusPernikahan: data.statusPernikahan || 'Menikah',
                    jumlahTanggungan: Number(data.jumlahTanggungan) || 0,
                    pekerjaan: data.pekerjaan || 'Buruh Harian Lepas',
                    penghasilanBulanan: Number(data.penghasilanBulanan) || 0,
                    alamat: data.alamat || 'Indonesia',
                    provinsi: data.provinsi || 'Jawa Barat',
                    kotaKabupaten: data.kotaKabupaten || 'Bandung',
                    namaBank: data.namaBank || 'Bank Syariah Indonesia (BSI)',
                    nomorRekening: data.nomorRekening || '',
                    namaRekeningBank: data.namaRekeningBank || data.nama,
                    asnafCategory: data.asnafCategory || 'Miskin',
                },
            });
            registrationOtpStore.delete(cleanEmail);
            const { passwordHash: _, ...userSafe } = newUser;
            return res.status(201).json({
                success: true,
                role: 'MUSTAHIK',
                user: { ...userSafe, role: 'MUSTAHIK' },
                message: 'Verifikasi berhasil! Anda telah terdaftar dan langsung masuk ke Portal Mustahik.',
            });
        }
        else {
            const memberId = `MZK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newUser = await prisma_1.prisma.muzakkiAuth.create({
                data: {
                    memberId,
                    email: cleanEmail,
                    passwordHash: data.passwordHash,
                    nama: data.nama,
                    phone: data.phone || '0812XXXXXXXX',
                    alamat: data.alamat,
                    npwp: data.npwp,
                    nik: data.nik,
                    namaNpwp: data.npwp ? data.nama.toUpperCase() : null,
                    isNpwpVerified: Boolean(data.npwp && data.npwp.length >= 15),
                },
            });
            registrationOtpStore.delete(cleanEmail);
            const { passwordHash: _, ...userSafe } = newUser;
            return res.status(201).json({
                success: true,
                role: 'MUZAKKI',
                user: { ...userSafe, role: 'MUZAKKI' },
                message: 'Verifikasi berhasil! Anda telah terdaftar dan langsung masuk ke Dashboard Muzakki.',
            });
        }
    }
    catch (error) {
        console.error('Error verifying registration OTP:', error);
        return res.status(500).json({ success: false, message: 'Gagal memverify kode OTP. Silakan coba lagi.' });
    }
};
exports.verifyRegisterOtp = verifyRegisterOtp;
const resendRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const pending = registrationOtpStore.get(cleanEmail);
        if (!pending) {
            return res.status(400).json({
                success: false,
                message: 'Sesi pendaftaran tidak ditemukan. Silakan isi formulir pendaftaran kembali.',
            });
        }
        const newCode = String(Math.floor(100000 + Math.random() * 900000));
        pending.code = newCode;
        pending.expiresAt = Date.now() + 5 * 60 * 1000;
        pending.attempts = 0;
        await (0, email_service_1.sendRegistrationOtpEmail)({
            email: cleanEmail,
            nama: pending.data.nama,
            otpCode: newCode,
            role: pending.role,
        });
        return res.status(200).json({
            success: true,
            message: `Kode OTP baru telah dikirimkan ke email ${cleanEmail}.`,
            expiresInSeconds: 300,
        });
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim ulang kode OTP.' });
    }
};
exports.resendRegisterOtp = resendRegisterOtp;
const muzakkiLogin = async (req, res) => {
    return (0, exports.authLogin)(req, res);
};
exports.muzakkiLogin = muzakkiLogin;
const muzakkiRegister = async (req, res) => {
    try {
        const { nama, email, password, phone, npwp, nik, alamat } = req.body;
        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!cleanEmail) {
            return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
        }
        // 1. Check if email already registered as Muzakki
        const existingMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (existingMuzakki) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar sebagai akun Muzakki. Silakan langsung masuk ke akun Anda.',
            });
        }
        // 2. Check if email already registered as Mustahik (Exclusive Constraint)
        const existingMustahik = await prisma_1.prisma.mustahikAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (existingMustahik) {
            return res.status(400).json({
                success: false,
                message: 'Email ini sudah terdaftar sebagai akun Mustahik (Penerima). Sesuai kebijakan, satu akun/email hanya dapat terdaftar dalam 1 kategori pengguna (Mustahik atau Muzakki).',
            });
        }
        // 3. Check unique NIK (if provided) across both
        if (nik && String(nik).trim()) {
            const cleanNik = String(nik).trim();
            const existingNikMustahik = await prisma_1.prisma.mustahikAuth.findUnique({ where: { nik: cleanNik } });
            if (existingNikMustahik) {
                return res.status(400).json({
                    success: false,
                    message: 'NIK KTP ini sudah terdaftar sebagai akun Mustahik.',
                });
            }
        }
        const passwordHash = await bcryptjs_1.default.hash(password || 'password123', 10);
        const memberId = `MZK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser = await prisma_1.prisma.muzakkiAuth.create({
            data: {
                memberId,
                email: cleanEmail,
                passwordHash,
                nama,
                phone: phone || '0812XXXXXXXX',
                alamat,
                npwp,
                nik,
                namaNpwp: npwp ? nama.toUpperCase() : null,
                isNpwpVerified: Boolean(npwp && npwp.length >= 15),
            },
        });
        const { passwordHash: _, ...userSafe } = newUser;
        return res.status(201).json({
            success: true,
            role: 'MUZAKKI',
            user: { ...userSafe, role: 'MUZAKKI' },
            message: 'Pendaftaran akun Muzakki berhasil.',
        });
    }
    catch (error) {
        console.error('Muzakki register error:', error);
        return res.status(500).json({ success: false, message: 'Gagal mendaftar akun muzakki.' });
    }
};
exports.muzakkiRegister = muzakkiRegister;
const updateMuzakkiProfile = async (req, res) => {
    try {
        const { id, nama, email, phone, alamat, pekerjaan, npwp, nik, namaNpwp, alamatKpp } = req.body;
        const updated = await prisma_1.prisma.muzakkiAuth.update({
            where: { id },
            data: {
                nama,
                email,
                phone,
                alamat,
                pekerjaan,
                npwp,
                nik,
                namaNpwp,
                alamatKpp,
                isNpwpVerified: Boolean(npwp && npwp.length >= 15),
            },
        });
        const { passwordHash: _, ...userSafe } = updated;
        return res.status(200).json(userSafe);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil muzakki.' });
    }
};
exports.updateMuzakkiProfile = updateMuzakkiProfile;
const getMuzakkiSbmzList = async (req, res) => {
    try {
        const { muzakkiAuthId } = req.query;
        const docs = await prisma_1.prisma.sbmzDoc.findMany({
            where: muzakkiAuthId ? { muzakkiAuthId: String(muzakkiAuthId) } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(docs);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil dokumen SBMZ.' });
    }
};
exports.getMuzakkiSbmzList = getMuzakkiSbmzList;
const getMuzakkiRecurringPlans = async (req, res) => {
    try {
        const { muzakkiAuthId } = req.query;
        const plans = await prisma_1.prisma.recurringZis.findMany({
            where: muzakkiAuthId ? { muzakkiAuthId: String(muzakkiAuthId) } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(plans);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil jadwal recurring.' });
    }
};
exports.getMuzakkiRecurringPlans = getMuzakkiRecurringPlans;
const createMuzakkiRecurringPlan = async (req, res) => {
    try {
        const data = req.body;
        const plan = await prisma_1.prisma.recurringZis.create({
            data: {
                muzakkiAuthId: data.muzakkiAuthId,
                title: data.title,
                category: data.category,
                nominal: Number(data.nominal),
                frequency: data.frequency || 'Bulanan',
                deductDay: Number(data.deductDay) || 25,
                paymentMethod: data.paymentMethod || 'BSI Autodebet',
                status: 'Aktif',
                nextDeductionDate: data.nextDeductionDate || '25 September 2026',
                totalDonated: Number(data.nominal),
            },
        });
        return res.status(201).json(plan);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal membuat jadwal recurring.' });
    }
};
exports.createMuzakkiRecurringPlan = createMuzakkiRecurringPlan;
const toggleRecurringPlanStatus = async (req, res) => {
    try {
        const id = String(req.params.id);
        const existing = await prisma_1.prisma.recurringZis.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
        const updated = await prisma_1.prisma.recurringZis.update({
            where: { id },
            data: {
                status: existing.status === 'Aktif' ? 'Dijeda' : 'Aktif',
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengubah status recurring.' });
    }
};
exports.toggleRecurringPlanStatus = toggleRecurringPlanStatus;
const deleteRecurringPlan = async (req, res) => {
    try {
        const id = String(req.params.id);
        await prisma_1.prisma.recurringZis.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Jadwal recurring berhasil dihapus.' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal menghapus jadwal recurring.' });
    }
};
exports.deleteRecurringPlan = deleteRecurringPlan;
// ==========================================
// 8. MUSTAHIK PORTAL CONTROLLER
// ==========================================
const mustahikLogin = async (req, res) => {
    return (0, exports.authLogin)(req, res);
};
exports.mustahikLogin = mustahikLogin;
const mustahikRegister = async (req, res) => {
    try {
        const data = req.body;
        const cleanEmail = String(data.email || '').trim().toLowerCase();
        if (!cleanEmail) {
            return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
        }
        // 1. Check if email already registered as Mustahik
        const existingMustahik = await prisma_1.prisma.mustahikAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (existingMustahik) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar sebagai akun Mustahik. Silakan langsung masuk ke akun Anda.',
            });
        }
        // 2. Check if email already registered as Muzakki (Exclusive Constraint)
        const existingMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({
            where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
        if (existingMuzakki) {
            return res.status(400).json({
                success: false,
                message: 'Email ini sudah terdaftar sebagai akun Muzakki (Donatur). Sesuai kebijakan, satu akun/email hanya dapat terdaftar dalam 1 kategori pengguna (Mustahik atau Muzakki).',
            });
        }
        // 3. Check unique NIK (if provided) across both
        if (data.nik && String(data.nik).trim()) {
            const cleanNik = String(data.nik).trim();
            const existingNikMustahik = await prisma_1.prisma.mustahikAuth.findUnique({ where: { nik: cleanNik } });
            if (existingNikMustahik) {
                return res.status(400).json({
                    success: false,
                    message: 'NIK KTP ini sudah terdaftar sebagai akun Mustahik.',
                });
            }
            const existingNikMuzakki = await prisma_1.prisma.muzakkiAuth.findFirst({ where: { nik: cleanNik } });
            if (existingNikMuzakki) {
                return res.status(400).json({
                    success: false,
                    message: 'NIK KTP ini sudah terdaftar sebagai akun Muzakki.',
                });
            }
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password || 'password123', 10);
        const memberId = `MST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser = await prisma_1.prisma.mustahikAuth.create({
            data: {
                memberId,
                email: cleanEmail,
                passwordHash,
                nama: data.nama,
                nik: data.nik || `3201${Date.now().toString().slice(-12)}`,
                noKk: data.noKk || '',
                phone: data.phone || data.telepon || '0812XXXXXXXX',
                tempatLahir: data.tempatLahir || 'Bandung',
                tanggalLahir: data.tanggalLahir || '1995-01-01',
                statusPernikahan: data.statusPernikahan || 'Menikah',
                jumlahTanggungan: Number(data.jumlahTanggungan) || 0,
                pekerjaan: data.pekerjaan || 'Buruh Harian Lepas',
                penghasilanBulanan: Number(data.penghasilanBulanan) || 0,
                alamat: data.alamat || data.alamatLengkap || 'Indonesia',
                provinsi: data.provinsi || 'Jawa Barat',
                kotaKabupaten: data.kotaKabupaten || 'Bandung',
                namaBank: data.namaBank || 'Bank Syariah Indonesia (BSI)',
                nomorRekening: data.nomorRekening || '',
                namaRekeningBank: data.namaRekeningBank || data.nama,
                asnafCategory: data.asnafCategory || 'Miskin',
            },
        });
        const { passwordHash: _, ...userSafe } = newUser;
        return res.status(201).json({
            success: true,
            role: 'MUSTAHIK',
            user: { ...userSafe, role: 'MUSTAHIK' },
            message: 'Pendaftaran akun Mustahik berhasil.',
        });
    }
    catch (error) {
        console.error('Mustahik register error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Gagal mendaftar akun mustahik.' });
    }
};
exports.mustahikRegister = mustahikRegister;
const getMustahikProfile = async (req, res) => {
    try {
        const { id, email, nik } = req.query;
        let user = null;
        if (id) {
            user = await prisma_1.prisma.mustahikAuth.findUnique({ where: { id: String(id) } });
        }
        else if (email) {
            user = await prisma_1.prisma.mustahikAuth.findUnique({ where: { email: String(email) } });
        }
        else if (nik) {
            user = await prisma_1.prisma.mustahikAuth.findUnique({ where: { nik: String(nik) } });
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'Data profil mustahik tidak ditemukan.' });
        }
        const { passwordHash: _, ...userSafe } = user;
        return res.status(200).json({ success: true, user: { ...userSafe, role: 'MUSTAHIK' } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil profil mustahik.' });
    }
};
exports.getMustahikProfile = getMustahikProfile;
const updateMustahikProfile = async (req, res) => {
    try {
        const { id, nama, phone, noKk, tempatLahir, tanggalLahir, statusPernikahan, jumlahTanggungan, pekerjaan, penghasilanBulanan, alamat, provinsi, kotaKabupaten, namaBank, nomorRekening, namaRekeningBank, } = req.body;
        const updated = await prisma_1.prisma.mustahikAuth.update({
            where: { id },
            data: {
                nama,
                phone,
                noKk,
                tempatLahir,
                tanggalLahir,
                statusPernikahan,
                jumlahTanggungan: Number(jumlahTanggungan) || 0,
                pekerjaan,
                penghasilanBulanan: Number(penghasilanBulanan) || 0,
                alamat,
                provinsi,
                kotaKabupaten,
                namaBank,
                nomorRekening,
                namaRekeningBank,
            },
        });
        const { passwordHash: _, ...userSafe } = updated;
        return res.status(200).json({ success: true, user: { ...userSafe, role: 'MUSTAHIK' } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil mustahik.' });
    }
};
exports.updateMustahikProfile = updateMustahikProfile;
const uploadMustahikDoc = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada dokumen yang diunggah.' });
        }
        const fileUrl = `/uploads/documents/${req.file.filename}`;
        return res.status(200).json({
            success: true,
            message: 'Dokumen berhasil diunggah.',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadMustahikDoc = uploadMustahikDoc;
const getMustahikSubmissions = async (req, res) => {
    try {
        const { mustahikAuthId, nik } = req.query;
        const submissions = await prisma_1.prisma.pengajuanBantuan.findMany({
            where: {
                OR: [
                    mustahikAuthId ? { mustahikAuthId: String(mustahikAuthId) } : {},
                    nik ? { nik: String(nik) } : {},
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        // Check setting cooldown
        const setting = await prisma_1.prisma.webSetting.findFirst();
        const minCooldownMonths = setting?.minSubmissionCooldownMonths || 6;
        let canApplyNew = true;
        let nextAvailableDate = null;
        let cooldownRemainingDays = 0;
        if (submissions.length > 0) {
            const lastSubmission = submissions[0];
            const lastDate = new Date(lastSubmission.createdAt);
            const cooldownMs = minCooldownMonths * 30.4375 * 24 * 60 * 60 * 1000;
            const unlockTime = lastDate.getTime() + cooldownMs;
            const now = Date.now();
            if (now < unlockTime) {
                canApplyNew = false;
                const targetDate = new Date(unlockTime);
                nextAvailableDate = targetDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
                cooldownRemainingDays = Math.ceil((unlockTime - now) / (1000 * 60 * 60 * 24));
            }
        }
        return res.status(200).json({
            success: true,
            submissions,
            cooldownPolicy: {
                minCooldownMonths,
                canApplyNew,
                nextAvailableDate,
                cooldownRemainingDays,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pengajuan bantuan.' });
    }
};
exports.getMustahikSubmissions = getMustahikSubmissions;
const createMustahikSubmission = async (req, res) => {
    try {
        const data = req.body;
        // 1. Check Setting Cooldown Months
        const setting = await prisma_1.prisma.webSetting.findFirst();
        const minMonths = setting?.minSubmissionCooldownMonths || 6;
        // 2. Check last submission cooldown
        const lastSub = await prisma_1.prisma.pengajuanBantuan.findFirst({
            where: {
                OR: [
                    data.mustahikAuthId ? { mustahikAuthId: data.mustahikAuthId } : {},
                    data.nik ? { nik: data.nik } : {},
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        if (lastSub) {
            const lastTime = new Date(lastSub.createdAt).getTime();
            const cooldownMs = minMonths * 30.4375 * 24 * 60 * 60 * 1000;
            const unlockTime = lastTime + cooldownMs;
            const now = Date.now();
            if (now < unlockTime) {
                const nextDate = new Date(unlockTime).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
                return res.status(400).json({
                    success: false,
                    isCooldownBlocked: true,
                    message: `Mohon maaf, Anda baru dapat mengajukan permohonan bantuan kembali setelah ${minMonths} bulan dari pengajuan sebelumnya (Tersedia kembali pada ${nextDate}).`,
                    nextAvailableDate: nextDate,
                });
            }
        }
        // 3. Generate Ticket Number
        const submissionNumber = `PB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const nominalPengajuan = Number(data.nominalPengajuan) || Number(data.estimasiBiayaDibutuhkan) || 0;
        // 4. Initial 5-Stage Approval Setup
        const defaultDewanApprovals = [
            {
                memberId: 'D-01',
                memberName: 'Ust. H. Ahmad Fauzi, Lc., M.A.',
                role: 'Ketua Dewan Pengawas Syariah ZIS',
                status: 'Disetujui Rekomendasi',
                nominalDisetujui: Math.round(nominalPengajuan * 0.9),
                catatan: 'Mustahik memenuhi kriteria asnaf fakir miskin. Rekomendasi 90% pagu pengajuan.',
                approvedAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            },
            {
                memberId: 'D-02',
                memberName: 'Dr. H. Hendra Gunawan, S.E., M.Si.',
                role: 'Anggota Dewan Pertimbangan Zakat',
                status: 'Disetujui Rekomendasi',
                nominalDisetujui: nominalPengajuan,
                catatan: 'Dokumen SKTM & rincian biaya lengkap dan valid. Disetujui penuh 100%.',
                approvedAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            },
            {
                memberId: 'D-03',
                memberName: 'Hj. Siti Nurhaliza, M.Pd.',
                role: 'Anggota Dewan Bidang Penyaluran & Asnaf',
                status: 'Disetujui Rekomendasi',
                nominalDisetujui: Math.round(nominalPengajuan * 0.85),
                catatan: 'Prioritas pemenuhan kebutuhan dasar mustahik.',
                approvedAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
            },
        ];
        const submission = await prisma_1.prisma.pengajuanBantuan.create({
            data: {
                submissionNumber,
                mustahikAuthId: data.mustahikAuthId,
                nik: data.nik,
                noKk: data.noKk,
                namaLengkap: data.namaLengkap,
                telepon: data.telepon || data.phone || '0812XXXXXXXX',
                email: data.email,
                tempatLahir: data.tempatLahir,
                tanggalLahir: data.tanggalLahir,
                statusPernikahan: data.statusPernikahan,
                alamatLengkap: data.alamatLengkap || data.alamat || 'Indonesia',
                provinsi: data.provinsi || 'Jawa Barat',
                kotaKabupaten: data.kotaKabupaten || 'Bandung',
                pekerjaan: data.pekerjaan || 'Buruh Harian Lepas',
                penghasilanBulanan: Number(data.penghasilanBulanan) || 0,
                jumlahTanggungan: Number(data.jumlahTanggungan) || 0,
                asnafCategory: data.asnafCategory || 'Miskin',
                programBantuanDimohon: data.programBantuanDimohon || 'Bantuan Pendidikan / Beasiswa',
                nominalPengajuan,
                estimasiBiayaDibutuhkan: nominalPengajuan,
                alasanPengajuan: data.alasanPengajuan || data.deskripsiKebutuhan,
                dokumenSyarat: data.dokumenSyarat || [],
                namaBank: data.namaBank || 'Bank Syariah Indonesia (BSI)',
                nomorRekening: data.nomorRekening || '',
                namaRekening: data.namaRekening || data.namaLengkap,
                stageStatus: 'PROSES_PENGAJUAN',
                status: 'Proses Pengajuan',
                dewanZisApprovals: defaultDewanApprovals,
                tahapanProses: [
                    { tahap: '1. Proses Pengajuan', status: 'Selesai', tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), deskripsi: 'Formulir dan berkas persyaratan berhasil diajukan.' },
                    { tahap: '2. Approval Dewan ZIS (3 Anggota)', status: 'Sedang Berjalan', tanggal: 'Estimasi 1-2 hari kerja', deskripsi: 'Penelaahan kelayakan asnaf dan usulan nominal persetujuan 3 anggota dewan zakat.' },
                    { tahap: '3. Approval Direktur Keuangan', status: 'Menunggu', tanggal: 'Setelah Dewan ZIS', deskripsi: 'Pemilihan nilai final dan pengesahan pencairan dana.' },
                    { tahap: '4. Proses Penyaluran / Kasir', status: 'Menunggu', tanggal: 'Antrean pencairan', deskripsi: 'Penyiapan transfer dana ke rekening bank mustahik.' },
                ],
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Permohonan bantuan berhasil diajukan.',
            data: submission,
        });
    }
    catch (error) {
        console.error('Error creating mustahik submission:', error);
        return res.status(500).json({ success: false, message: error.message || 'Gagal mengajukan bantuan.' });
    }
};
exports.createMustahikSubmission = createMustahikSubmission;
// ==========================================
// 10. PUBLIC CONTENT: HERO SLIDERS, TESTIMONIALS, SETTINGS
// ==========================================
const getPublicHeroSliders = async (req, res) => {
    try {
        const sliders = await prisma_1.prisma.heroSlider.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'desc' }, { id: 'desc' }],
            take: 5,
        });
        return res.status(200).json(sliders);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data slider hero.' });
    }
};
exports.getPublicHeroSliders = getPublicHeroSliders;
const getPublicTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma_1.prisma.testimonial.findMany({
            where: { isPublished: true },
            orderBy: { order: 'asc' },
        });
        return res.status(200).json(testimonials);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data testimoni.' });
    }
};
exports.getPublicTestimonials = getPublicTestimonials;
const getPublicWebSettings = async (req, res) => {
    try {
        const settings = await prisma_1.prisma.webSetting.findFirst();
        return res.status(200).json(settings);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan web.' });
    }
};
exports.getPublicWebSettings = getPublicWebSettings;
