const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

/** Normalize tenggat / kabar.tgl to ISO `YYYY-MM-DD`. Accepts ISO or Indonesian display. */
export function toIsoDate(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : raw;
  }

  const parts = raw.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = MONTHS_ID.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase());
    const year = parseInt(parts[2], 10);
    if (day && monthIndex >= 0 && year) {
      const mm = String(monthIndex + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/** Format ISO or Indo date string to Indonesian display. */
export function toIndoDate(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return '';
  const iso = toIsoDate(input);
  if (!iso) return input.trim();
  const [year, month, day] = iso.split('-').map((n) => parseInt(n, 10));
  if (!year || !month || !day) return input.trim();
  return `${day} ${MONTHS_ID[month - 1]} ${year}`;
}

export function slugifyNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
