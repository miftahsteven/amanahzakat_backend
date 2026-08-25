import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'amanah_zakat_secret_key_2026_super_secure_99',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'amanah_zakat_refresh_secret_key_2026',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  dummyOtp: process.env.DUMMY_OTP || '00000',
  /** HMAC secret for public BSZ verify links (QR). Falls back to JWT secret in dev. */
  bszVerifySecret:
    process.env.BSZ_VERIFY_SECRET ||
    process.env.JWT_SECRET ||
    'amanah_zakat_bsz_verify_secret_2026',
  /** Webpublic origin for QR links, e.g. https://amanahzakat.id or http://localhost:3000 */
  publicSiteUrl: (process.env.PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
};
