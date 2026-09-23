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
  bszVerifySecret: process.env.BSZ_VERIFY_SECRET || 'bsz_verify_secret_key_2026_secure',
  publicSiteUrl:
    process.env.PUBLIC_SITE_URL || process.env.WEB_PUBLIC_URL || 'http://localhost:3000',
  midtrans: {
    merchantId: process.env.MIDTRANS_MERCHANT_ID || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    snapUrl:
      process.env.MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    apiUrl:
      process.env.MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com',
  },
  webPublicUrl:
    process.env.WEB_PUBLIC_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
};



