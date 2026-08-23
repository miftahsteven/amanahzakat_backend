import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { ProgramService } from './program.service';

const PILAR_VALID = ['Pendidikan', 'Kesehatan', 'Ekonomi', 'Dakwah', 'Kemanusiaan'];

export class ProgramController {
  static async list(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProgramService.list();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nama, pilar, paguAnggaran, targetPenerima, penanggungJawab, status } = req.body;

      if (!nama || !pilar || paguAnggaran == null || targetPenerima == null || !penanggungJawab) {
        res.status(400).json({
          success: false,
          message: 'Nama, pilar, pagu anggaran, target penerima, dan penanggung jawab wajib diisi.',
        });
        return;
      }

      if (!PILAR_VALID.includes(String(pilar))) {
        res.status(400).json({
          success: false,
          message: `Pilar tidak valid. Pilih: ${PILAR_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await ProgramService.create({
        nama: String(nama).trim(),
        pilar: String(pilar),
        paguAnggaran: Number(paguAnggaran),
        targetPenerima: Number(targetPenerima),
        penanggungJawab: String(penanggungJawab).trim(),
        status: status ? String(status) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Program ZIS baru berhasil dibuat.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { nama, pilar, paguAnggaran, targetPenerima, penanggungJawab, status } = req.body;

      if (pilar && !PILAR_VALID.includes(String(pilar))) {
        res.status(400).json({
          success: false,
          message: `Pilar tidak valid. Pilih: ${PILAR_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await ProgramService.update(id, {
        ...(nama !== undefined && { nama: String(nama).trim() }),
        ...(pilar !== undefined && { pilar: String(pilar) }),
        ...(paguAnggaran !== undefined && { paguAnggaran: Number(paguAnggaran) }),
        ...(targetPenerima !== undefined && { targetPenerima: Number(targetPenerima) }),
        ...(penanggungJawab !== undefined && { penanggungJawab: String(penanggungJawab).trim() }),
        ...(status !== undefined && { status: String(status) }),
      });

      res.status(200).json({
        success: true,
        message: 'Program ZIS berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
