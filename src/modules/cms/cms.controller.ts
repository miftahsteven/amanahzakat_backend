import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { slugifyNama, toIsoDate } from '../../lib/campaign-date';

const CAMPAIGN_STATUS = new Set(['Berjalan', 'Tercapai', 'Selesai']);

type RincianRow = { item: string; nilai: number };
type KabarRow = { tgl: string; judul: string; isi: string };
type DonaturRow = { nama: string; nominal: number; waktu: string; doa?: string };

function normalizeRincian(raw: unknown, fallbackTarget: number): RincianRow[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      { item: 'Penyaluran Program Langsung', nilai: Math.round(fallbackTarget * 0.9) },
      { item: 'Operasional Lapangan & Amil', nilai: Math.round(fallbackTarget * 0.1) },
    ];
  }
  return raw
    .map((row: any) => ({
      item: String(row?.item || '').trim(),
      nilai: Number(row?.nilai) || 0,
    }))
    .filter((row) => row.item && row.nilai >= 0);
}

function normalizeKabar(raw: unknown): KabarRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row: any) => {
      const iso = toIsoDate(row?.tgl) || '';
      return {
        tgl: iso,
        judul: String(row?.judul || '').trim(),
        isi: String(row?.isi || '').trim(),
      };
    })
    .filter((row) => row.tgl && row.judul);
}

function normalizeDonaturList(raw: unknown): DonaturRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row: any) => ({
      nama: String(row?.nama || '').trim(),
      nominal: Number(row?.nominal) || 0,
      waktu: String(row?.waktu || '').trim() || 'Baru saja',
      ...(row?.doa ? { doa: String(row.doa).trim() } : {}),
    }))
    .filter((row) => row.nama && row.nominal > 0);
}

async function ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base || `kampanye-${Date.now()}`;
  let n = 0;
  while (true) {
    const existing = await prisma.campaign.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId != null && existing.id === excludeId)) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export class CmsController {
  // ==========================================
  // 1. HERO SLIDERS CRUD
  // ==========================================
  static async getHeroSliders(req: Request, res: Response) {
    try {
      const sliders = await prisma.heroSlider.findMany({
        orderBy: [{ order: 'desc' }, { id: 'desc' }],
      });
      return res.json({ success: true, data: sliders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadSliderImage(req: Request, res: Response) {

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
      }
      const fileUrl = `/uploads/slider/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Gambar slider berhasil diunggah.',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadCampaignImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
      }
      const fileUrl = `/uploads/campaigns/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Gambar kampanye berhasil diunggah.',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }



  static async createHeroSlider(req: Request, res: Response) {
    try {
      const {
        title,
        subtitle,
        tag,
        ctaText,
        ctaLink,
        secondaryCtaText,
        secondaryCtaLink,
        imageUrl,
        badge,
        badgeColor,
        isActive,
        order,
      } = req.body;

      if (!title || !subtitle || !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Title, subtitle, dan imageUrl wajib diisi.',
        });
      }

      const created = await prisma.heroSlider.create({
        data: {
          title,
          subtitle,
          tag: tag || 'PROGRAM UTAMA',
          ctaText: ctaText || 'Tunaikan Sekarang',
          ctaLink: ctaLink || '/donasi',
          secondaryCtaText: secondaryCtaText || 'Lihat Program',
          secondaryCtaLink: secondaryCtaLink || '/kampanye',
          imageUrl,
          badge,
          badgeColor: badgeColor || '#0B9D6D',
          isActive: isActive !== undefined ? isActive : true,
          order: order !== undefined ? Number(order) : 0,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Hero Slider berhasil ditambahkan.',
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateHeroSlider(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const {
        title,
        subtitle,
        tag,
        ctaText,
        ctaLink,
        secondaryCtaText,
        secondaryCtaLink,
        imageUrl,
        badge,
        badgeColor,
        isActive,
        order,
      } = req.body;

      const exists = await prisma.heroSlider.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Hero Slider tidak ditemukan.' });
      }

      const updated = await prisma.heroSlider.update({
        where: { id },
        data: {
          title,
          subtitle,
          tag,
          ctaText,
          ctaLink,
          secondaryCtaText,
          secondaryCtaLink,
          imageUrl,
          badge,
          badgeColor,
          isActive,
          order: order !== undefined ? Number(order) : undefined,
        },
      });

      return res.json({
        success: true,
        message: 'Hero Slider berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteHeroSlider(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      await prisma.heroSlider.delete({ where: { id } });
      return res.json({ success: true, message: 'Hero Slider berhasil dihapus.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 2. CAMPAIGNS CMS CRUD
  // ==========================================
  static async getCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { id: 'desc' },
      });
      return res.json({ success: true, data: campaigns });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createCampaign(req: Request, res: Response) {
    try {
      const {
        nama,
        program,
        lokasi,
        target,
        tenggat,
        ringkas,
        cerita,
        imageUrl,
        rincian,
        kabar,
        donaturList,
        status,
        isFeatured,
        slug: slugInput,
      } = req.body;

      const namaTrim = typeof nama === 'string' ? nama.trim() : '';
      const programTrim = typeof program === 'string' ? program.trim() : '';
      const ringkasTrim = typeof ringkas === 'string' ? ringkas.trim() : '';
      const targetNum = Number(target);
      const statusVal = typeof status === 'string' && status.trim() ? status.trim() : 'Berjalan';
      const tenggatIso = toIsoDate(tenggat);

      if (!namaTrim || namaTrim.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Nama kampanye wajib diisi (minimal 5 karakter).',
        });
      }
      if (!programTrim) {
        return res.status(400).json({
          success: false,
          message: 'Pilar / kategori program wajib diisi.',
        });
      }
      if (!Number.isFinite(targetNum) || targetNum < 1_000_000) {
        return res.status(400).json({
          success: false,
          message: 'Target dana wajib diisi dan minimal Rp 1.000.000.',
        });
      }
      if (!tenggatIso) {
        return res.status(400).json({
          success: false,
          message: 'Tenggat waktu wajib diisi dengan tanggal yang valid.',
        });
      }
      if (!ringkasTrim || ringkasTrim.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Ringkasan singkat wajib diisi (minimal 10 karakter).',
        });
      }
      if (!CAMPAIGN_STATUS.has(statusVal)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Pilih: ${[...CAMPAIGN_STATUS].join(', ')}.`,
        });
      }

      const baseSlug =
        (typeof slugInput === 'string' && slugifyNama(slugInput)) ||
        `${slugifyNama(namaTrim)}-${Math.floor(100 + Math.random() * 900)}`;
      const slug = await ensureUniqueSlug(baseSlug);

      const created = await prisma.campaign.create({
        data: {
          slug,
          nama: namaTrim,
          program: programTrim,
          lokasi: (typeof lokasi === 'string' && lokasi.trim()) || 'Indonesia',
          target: targetNum,
          terkumpul: 0,
          donaturCount: 0,
          tenggat: tenggatIso,
          ringkas: ringkasTrim,
          cerita: (typeof cerita === 'string' && cerita.trim()) || ringkasTrim,
          imageUrl: (typeof imageUrl === 'string' && imageUrl.trim()) || '/images/campaigns/sumur-sumba.jpg',
          rincian: normalizeRincian(rincian, targetNum),
          kabar: normalizeKabar(kabar),
          donaturList: normalizeDonaturList(donaturList),
          status: statusVal,
          isFeatured: Boolean(isFeatured),
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Program kampanye berhasil dibuat.',
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateCampaign(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID kampanye tidak valid.' });
      }

      const existing = await prisma.campaign.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Program kampanye tidak ditemukan.' });
      }

      const {
        nama,
        program,
        lokasi,
        target,
        tenggat,
        ringkas,
        cerita,
        imageUrl,
        rincian,
        kabar,
        donaturList,
        status,
        isFeatured,
        slug: slugInput,
      } = req.body;

      if (nama !== undefined) {
        const namaTrim = String(nama).trim();
        if (!namaTrim || namaTrim.length < 5) {
          return res.status(400).json({
            success: false,
            message: 'Nama kampanye wajib diisi (minimal 5 karakter).',
          });
        }
      }
      if (program !== undefined && !String(program).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pilar / kategori program wajib diisi.',
        });
      }
      let targetNum = existing.target;
      if (target !== undefined) {
        targetNum = Number(target);
        if (!Number.isFinite(targetNum) || targetNum < 1_000_000) {
          return res.status(400).json({
            success: false,
            message: 'Target dana wajib diisi dan minimal Rp 1.000.000.',
          });
        }
      }
      let tenggatIso: string | undefined;
      if (tenggat !== undefined) {
        tenggatIso = toIsoDate(tenggat) || undefined;
        if (!tenggatIso) {
          return res.status(400).json({
            success: false,
            message: 'Tenggat waktu wajib diisi dengan tanggal yang valid.',
          });
        }
      }
      if (ringkas !== undefined) {
        const ringkasTrim = String(ringkas).trim();
        if (!ringkasTrim || ringkasTrim.length < 10) {
          return res.status(400).json({
            success: false,
            message: 'Ringkasan singkat wajib diisi (minimal 10 karakter).',
          });
        }
      }
      if (status !== undefined && !CAMPAIGN_STATUS.has(String(status).trim())) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Pilih: ${[...CAMPAIGN_STATUS].join(', ')}.`,
        });
      }

      let nextSlug: string | undefined;
      if (slugInput !== undefined) {
        const cleaned = slugifyNama(String(slugInput));
        if (!cleaned) {
          return res.status(400).json({ success: false, message: 'Slug kampanye tidak valid.' });
        }
        nextSlug = await ensureUniqueSlug(cleaned, id);
      }

      // terkumpul / donaturCount tidak diubah dari CMS — diupdate lewat donasi web
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          ...(nama !== undefined && { nama: String(nama).trim() }),
          ...(program !== undefined && { program: String(program).trim() }),
          ...(lokasi !== undefined && { lokasi: String(lokasi).trim() || 'Indonesia' }),
          ...(target !== undefined && { target: targetNum }),
          ...(tenggatIso !== undefined && { tenggat: tenggatIso }),
          ...(ringkas !== undefined && { ringkas: String(ringkas).trim() }),
          ...(cerita !== undefined && { cerita: String(cerita).trim() }),
          ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
          ...(rincian !== undefined && { rincian: normalizeRincian(rincian, targetNum) }),
          ...(kabar !== undefined && { kabar: normalizeKabar(kabar) }),
          ...(donaturList !== undefined && { donaturList: normalizeDonaturList(donaturList) }),
          ...(status !== undefined && { status: String(status).trim() }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(nextSlug !== undefined && { slug: nextSlug }),
        },
      });

      return res.json({
        success: true,
        message: 'Program kampanye berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteCampaign(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID kampanye tidak valid.' });
      }

      const existing = await prisma.campaign.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Program kampanye tidak ditemukan.' });
      }

      const donasiCount = await prisma.donasiWeb.count({ where: { campaignId: id } });
      if (donasiCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Kampanye tidak dapat dihapus karena sudah memiliki ${donasiCount} transaksi donasi. Ubah status menjadi "Selesai" jika kampanye sudah ditutup.`,
        });
      }

      await prisma.campaign.delete({ where: { id } });
      return res.json({ success: true, message: 'Program kampanye berhasil dihapus.' });
    } catch (error: any) {
      if (error?.code === 'P2003') {
        return res.status(400).json({
          success: false,
          message:
            'Kampanye tidak dapat dihapus karena masih terhubung ke data donasi. Ubah status menjadi "Selesai" jika kampanye sudah ditutup.',
        });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 3. DISTRIBUTIONS CMS CRUD
  // ==========================================
  static async getDistributions(req: Request, res: Response) {
    try {
      const dists = await prisma.kabarPenyaluran.findMany({
        orderBy: { id: 'desc' },
      });
      return res.json({ success: true, data: dists });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createDistribution(req: Request, res: Response) {
    try {
      const {
        judul,
        program,
        kampanye,
        lokasi,
        tgl,
        nominal,
        penerima,
        asnaf,
        mitra,
        ringkas,
        isi,
        imageUrl,
        rincian,
      } = req.body;

      if (!judul || !program || !nominal) {
        return res.status(400).json({
          success: false,
          message: 'Judul, program, dan nominal penyaluran wajib diisi.',
        });
      }

      const baseSlug = judul
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const created = await prisma.kabarPenyaluran.create({
        data: {
          slug,
          judul,
          program,
          kampanye: kampanye || program,
          lokasi: lokasi || 'Indonesia',
          tgl: tgl || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          nominal: Number(nominal),
          penerima: penerima ? Number(penerima) : 100,
          asnaf: asnaf || 'Fakir',
          mitra: mitra || 'Relawan LAZNAS',
          status: 'Terbit',
          ringkas: ringkas || judul,
          isi: isi || ringkas || judul,
          rincian: rincian || [{ item: 'Penyaluran Bantuan Langsung', nilai: Number(nominal) }],
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?auto=format&fit=crop&w=1000&q=80',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Kabar penyaluran berhasil diterbitkan.',
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateDistribution(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const {
        judul,
        program,
        kampanye,
        lokasi,
        tgl,
        nominal,
        penerima,
        asnaf,
        mitra,
        status,
        ringkas,
        isi,
        imageUrl,
        rincian,
      } = req.body;

      const updated = await prisma.kabarPenyaluran.update({
        where: { id },
        data: {
          judul,
          program,
          kampanye,
          lokasi,
          tgl,
          nominal: nominal !== undefined ? Number(nominal) : undefined,
          penerima: penerima !== undefined ? Number(penerima) : undefined,
          asnaf,
          mitra,
          status,
          ringkas,
          isi,
          imageUrl,
          rincian,
        },
      });

      return res.json({
        success: true,
        message: 'Kabar penyaluran berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteDistribution(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      await prisma.kabarPenyaluran.delete({ where: { id } });
      return res.json({ success: true, message: 'Kabar penyaluran berhasil dihapus.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 4. TESTIMONIALS CMS CRUD
  // ==========================================
  static async getTestimonials(req: Request, res: Response) {
    try {
      const items = await prisma.testimonial.findMany({
        orderBy: { order: 'asc' },
      });
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createTestimonial(req: Request, res: Response) {
    try {
      const { name, role, location, program, quote, avatarUrl, rating, isPublished, order } = req.body;

      if (!name || !quote) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan kutipan testimoni wajib diisi.',
        });
      }

      const created = await prisma.testimonial.create({
        data: {
          name,
          role: role || 'Muzakki Prioritas',
          location: location || 'Jakarta',
          program: program || 'Zakat & Infak',
          quote,
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          rating: rating !== undefined ? Number(rating) : 5,
          isPublished: isPublished !== undefined ? isPublished : true,
          order: order !== undefined ? Number(order) : 0,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Testimoni berhasil ditambahkan.',
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateTestimonial(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { name, role, location, program, quote, avatarUrl, rating, isPublished, order } = req.body;

      const updated = await prisma.testimonial.update({
        where: { id },
        data: {
          name,
          role,
          location,
          program,
          quote,
          avatarUrl,
          rating: rating !== undefined ? Number(rating) : undefined,
          isPublished,
          order: order !== undefined ? Number(order) : undefined,
        },
      });

      return res.json({
        success: true,
        message: 'Testimoni berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteTestimonial(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await prisma.testimonial.delete({ where: { id } });
      return res.json({ success: true, message: 'Testimoni berhasil dihapus.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 5. FAQS CMS CRUD
  // ==========================================
  static async getFaqs(req: Request, res: Response) {
    try {
      const faqs = await prisma.faqItem.findMany({
        orderBy: [{ category: 'asc' }, { urutan: 'asc' }],
      });
      return res.json({ success: true, data: faqs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createFaq(req: Request, res: Response) {
    try {
      const { category, question, answer, sourceReference, urutan } = req.body;

      if (!category || !question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Kategori, pertanyaan, dan jawaban wajib diisi.',
        });
      }

      const created = await prisma.faqItem.create({
        data: {
          category,
          question,
          answer,
          sourceReference: sourceReference || 'Fatwa MUI · Baznas',
          urutan: urutan !== undefined ? Number(urutan) : 0,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'FAQ berhasil ditambahkan.',
        data: created,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateFaq(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { category, question, answer, sourceReference, urutan } = req.body;

      const updated = await prisma.faqItem.update({
        where: { id },
        data: {
          category,
          question,
          answer,
          sourceReference,
          urutan: urutan !== undefined ? Number(urutan) : undefined,
        },
      });

      return res.json({
        success: true,
        message: 'FAQ berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteFaq(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await prisma.faqItem.delete({ where: { id } });
      return res.json({ success: true, message: 'FAQ berhasil dihapus.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 6. IMPACT DATA CMS
  // ==========================================
  static async getImpact(req: Request, res: Response) {
    try {
      const impact = await prisma.impactData.findFirst();
      return res.json({ success: true, data: impact });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateImpact(req: Request, res: Response) {
    try {
      const { metrics, fundAllocations, beneficiaryStories, annualReports } = req.body;

      const updated = await prisma.impactData.upsert({
        where: { id: 'default-impact' },
        update: {
          metrics,
          fundAllocations,
          beneficiaryStories,
          annualReports,
        },
        create: {
          id: 'default-impact',
          metrics: metrics || [],
          fundAllocations: fundAllocations || [],
          beneficiaryStories: beneficiaryStories || [],
          annualReports: annualReports || [],
        },
      });

      return res.json({
        success: true,
        message: 'Laporan dampak berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 7. ASSISTANCE SUBMISSIONS CMS
  // ==========================================
  static async getAssistanceSubmissions(req: Request, res: Response) {
    try {
      const list = await prisma.pengajuanBantuan.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateAssistanceStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { status, surveiNotes } = req.body;

      const current = await prisma.pengajuanBantuan.findUnique({ where: { id } });
      if (!current) {
        return res.status(404).json({ success: false, message: 'Data permohonan tidak ditemukan.' });
      }

      const tahapan: any[] = Array.isArray(current.tahapanProses)
        ? [...(current.tahapanProses as any[])]
        : [];

      // Update or add timeline step
      tahapan.push({
        tahap: `Status Diperbarui: ${status}`,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'Selesai',
        catatan: surveiNotes || '',
      });

      const updated = await prisma.pengajuanBantuan.update({
        where: { id },
        data: {
          status,
          surveiNotes: surveiNotes !== undefined ? surveiNotes : current.surveiNotes,
          tahapanProses: tahapan,
        },
      });

      return res.json({
        success: true,
        message: `Status permohonan bantuan diubah menjadi '${status}'.`,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==========================================
  // 8. WEB SETTINGS CMS
  // ==========================================
  static async getWebSettings(req: Request, res: Response) {
    try {
      const settings = await prisma.webSetting.findFirst();
      return res.json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateWebSettings(req: Request, res: Response) {
    try {
      const {
        siteName,
        siteTagline,
        contactPhone,
        contactEmail,
        contactAddress,
        socialLinks,
        bankAccounts,
      } = req.body;

      const updated = await prisma.webSetting.upsert({
        where: { id: 'default-setting' },
        update: {
          siteName,
          siteTagline,
          contactPhone,
          contactEmail,
          contactAddress,
          socialLinks,
          bankAccounts,
        },
        create: {
          id: 'default-setting',
          siteName: siteName || 'AmanahZakat Peduli',
          siteTagline: siteTagline || 'Lembaga Amil Zakat Nasional',
          contactPhone: contactPhone || '0811-2100-900',
          contactEmail: contactEmail || 'layanan@amanahzakat.or.id',
          contactAddress: contactAddress || 'Jakarta Selatan',
          socialLinks,
          bankAccounts,
        },
      });

      return res.json({
        success: true,
        message: 'Pengaturan web berhasil diperbarui.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
