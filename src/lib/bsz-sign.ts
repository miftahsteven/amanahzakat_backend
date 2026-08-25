import crypto from 'crypto';
import { config } from '../config/environment';

const PREFIX = 'bsz:v1:';

function getSecret(): string {
  return config.bszVerifySecret;
}

/** Canonical ref used in HMAC — trim only; keep original casing of noKwitansi. */
export function normalizeBszRef(ref: string): string {
  return String(ref || '').trim();
}

export function signBszRef(ref: string): string {
  const canonical = normalizeBszRef(ref);
  return crypto.createHmac('sha256', getSecret()).update(`${PREFIX}${canonical}`).digest('hex');
}

export function verifyBszSignature(ref: string, sig: string | undefined | null): boolean {
  if (!sig || typeof sig !== 'string') return false;
  const expected = signBszRef(ref);
  const provided = sig.trim().toLowerCase();
  if (expected.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
  } catch {
    return false;
  }
}

/** Public page URL embedded in QR — no login, protected by HMAC sig. */
export function buildBszPublicVerifyUrl(noKwitansi: string): string {
  const ref = normalizeBszRef(noKwitansi);
  const sig = signBszRef(ref);
  const base = config.publicSiteUrl.replace(/\/+$/, '');
  const qs = new URLSearchParams({ ref, sig });
  return `${base}/verifikasi-bukti?${qs.toString()}`;
}
