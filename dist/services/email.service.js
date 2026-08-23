"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRegistrationOtpEmail = sendRegistrationOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
// SMTP Transporter using Gmail App Password provided by user
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'false' ? false : true,
    auth: {
        user: process.env.SMTP_USER || 'mscodx@gmail.com',
        pass: process.env.SMTP_PASS || 'kzuw qgnf tzfz pnvt',
    },
});
async function sendRegistrationOtpEmail({ email, nama, otpCode, role, }) {
    const isMustahik = role === 'MUSTAHIK';
    const roleTitle = isMustahik
        ? 'Mustahik Binaan (Penerima Manfaat)'
        : 'Muzakki (Donatur ZIS)';
    const badgeColor = isMustahik ? '#0F9D6E' : '#14509C';
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP Verifikasi AmanahZakat Peduli</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #16211D;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F6F4; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E3E8E4; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          
          <!-- Header Banner with Brand Colors -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B1F3D 0%, #0E3B74 50%, #0B1F3D 100%); padding: 32px 28px; text-align: center;">
              <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                AMANAH<span style="color: #0F9D6E;">ZAKAT</span>
              </div>
              <div style="font-size: 11px; letter-spacing: 3px; color: #A8C8F0; margin-top: 4px; font-weight: 700;">
                PEDULI • LAZNAS RESMI
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <!-- Role Badge -->
              <div style="text-align: center; margin-bottom: 18px;">
                <span style="display: inline-block; padding: 6px 16px; border-radius: 50px; background-color: ${badgeColor}15; color: ${badgeColor}; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${badgeColor}30;">
                  Pendaftaran ${roleTitle}
                </span>
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #16211D; text-align: center;">
                Verifikasi Email Akun Anda
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4A5550; text-align: center;">
                Assalamu’alaikum Warahmatullahi Wabarakatuh, <strong>${nama || 'Sahabat'}</strong>.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 13.5px; line-height: 1.6; color: #5E6D66; text-align: center;">
                Terima kasih telah melakukan pendaftaran akun <strong>${isMustahik ? 'Mustahik' : 'Muzakki'}</strong> pada portal resmi AmanahZakat Peduli. Gunakan kode verifikasi (OTP) berikut untuk melanjutkan proses pendaftaran:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0 26px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #F8FAF8; border: 2px dashed ${badgeColor}; border-radius: 16px; padding: 18px 36px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 700; color: #7D938A; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                        KODE OTP VERIFIKASI (6 DIGIT)
                      </div>
                      <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: ${badgeColor}; font-family: 'Courier New', Courier, monospace;">
                        ${otpCode}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiration & Security Notice -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 12px; line-height: 1.5; color: #92400E;">
                      ⏰ <strong>Masa Berlaku:</strong> Kode OTP ini hanya berlaku selama <strong>5 menit</strong>.<br>
                      🔒 <strong>Keamanan:</strong> Demi keamanan akun Anda, <em>jangan berikan kode ini kepada siapapun</em>, termasuk petugas amil AmanahZakat.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8A9A92; text-align: center;">
                Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini. Akun Anda tidak akan aktif tanpa verifikasi kode di atas.
              </p>
            </td>
          </tr>

          <!-- Footer Legal -->
          <tr>
            <td style="background-color: #F8FAF8; border-top: 1px solid #E3E8E4; padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11.5px; font-weight: 700; color: #4A5550;">
                Lembaga Amil Zakat Nasional AmanahZakat Peduli
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #7D938A;">
                Izin Kemenag RI No. 892/2019 • Gedung Menara Amanah Lt. 4, Jakarta Selatan
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #9BAEA5;">
                Layanan Call Center: 0811-2100-900 • Email: layanan@amanahzakat.or.id
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    try {
        const info = await transporter.sendMail({
            from: `"AmanahZakat Peduli" <${process.env.SMTP_USER || 'mscodx@gmail.com'}>`,
            to: email,
            subject: `[AmanahZakat] Kode OTP Verifikasi Pendaftaran Akun ${isMustahik ? 'Mustahik' : 'Muzakki'}: ${otpCode}`,
            html: htmlContent,
        });
        console.log(`[EmailService] OTP email sent successfully to ${email} (MessageId: ${info.messageId})`);
        return true;
    }
    catch (error) {
        console.error(`[EmailService] Failed to send OTP email to ${email}:`, error);
        return false;
    }
}
