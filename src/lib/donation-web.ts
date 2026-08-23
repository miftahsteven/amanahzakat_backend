import { DonasiWeb } from '@prisma/client';

type CreateDonationBody = {
  campaignId?: number | string;
  campaignSlug?: string;
  campaignTitle?: string;
  fundType?: string;
  amount?: number | string;
  paymentMethod?: string;
  channel?: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  isAnonymous?: boolean;
  message?: string;
  donor?: {
    fullName?: string;
    contact?: string;
    anonymous?: boolean;
  };
};

export function normalizeCreateDonationBody(body: CreateDonationBody) {
  const donorContact = body.donor?.contact?.trim() || body.donorPhone?.trim() || '';
  const isEmail = donorContact.includes('@');

  const channel = (body.channel || body.paymentMethod || 'VIRTUAL_ACCOUNT').toUpperCase();
  let paymentMethod = channel;
  if (channel === 'BANK_TRANSFER') paymentMethod = 'BANK_TRANSFER';
  if (channel === 'EWALLET') paymentMethod = 'EWALLET';

  return {
    campaignId: body.campaignId ? Number(body.campaignId) : undefined,
    campaignSlug: body.campaignSlug || 'donasi-umum',
    campaignTitle: body.campaignTitle || 'Donasi Umum & Zakat',
    fundType: mapFundTypeToErp(body.fundType),
    amount: Number(body.amount) || 50000,
    paymentMethod,
    donorName: body.isAnonymous || body.donor?.anonymous
      ? 'Hamba Allah'
      : (body.donorName || body.donor?.fullName || 'Hamba Allah').trim(),
    donorEmail: body.donorEmail || (isEmail ? donorContact : undefined),
    donorPhone: body.donorPhone || (!isEmail ? donorContact : undefined),
    isAnonymous: Boolean(body.isAnonymous ?? body.donor?.anonymous),
    message: body.message,
  };
}

export function mapFundTypeToErp(fundType?: string): string {
  switch ((fundType || '').toUpperCase()) {
    case 'ZAKAT':
      return 'Zakat Maal';
    case 'INFAQ':
      return 'Infak';
    case 'SHODAQOH':
      return 'Shodaqoh';
    case 'WAQF_CASH':
      return 'Wakaf Uang';
    default:
      return fundType || 'Zakat Maal';
  }
}

export function mapKanalToErp(paymentProvider: string, paymentMethod: string): string {
  const combined = `${paymentProvider} ${paymentMethod}`.toUpperCase();
  if (combined.includes('QRIS')) return 'QRIS';
  if (combined.includes('CASH')) return 'Cash / Konter';
  if (combined.includes('PAYROLL')) return 'Payroll UPZ';
  if (combined.includes('TRANSFER') || combined.includes('VIRTUAL') || combined.includes('BSI')) {
    return 'Transfer Bank BSI';
  }
  return `${paymentProvider} ${paymentMethod}`.trim();
}

export function mapChannelFromDonasi(donation: DonasiWeb): string {
  if (donation.paymentMethod === 'QRIS') return 'QRIS';
  if (donation.paymentMethod === 'BANK_TRANSFER') return 'BANK_TRANSFER';
  if (donation.paymentMethod === 'EWALLET') return 'EWALLET';
  return 'VIRTUAL_ACCOUNT';
}

export function toPaymentInstructionResponse(donation: DonasiWeb) {
  const channel = mapChannelFromDonasi(donation);
  const providerLabel =
    donation.paymentProvider === 'QRIS' ? 'QRIS (Semua Pembayaran)' : 'Bank Syariah Indonesia (BSI)';

  let channelLabel = 'Virtual Account Syariah';
  if (channel === 'QRIS') channelLabel = 'QRIS Instan';
  if (channel === 'BANK_TRANSFER') channelLabel = 'Transfer Bank Manual';
  if (channel === 'EWALLET') channelLabel = 'E-Wallet';

  return {
    transactionId: donation.transactionId,
    campaignId: donation.campaignId ?? undefined,
    campaignTitle: donation.campaignTitle,
    fundType: mapFundTypeToWeb(donation.fundType),
    amount: donation.amount,
    uniqueCode: donation.uniqueCode,
    totalAmount: donation.totalAmount,
    donorName: donation.donorName,
    donorContact: donation.donorPhone || donation.donorEmail || '',
    isAnonymous: donation.isAnonymous,
    channel,
    providerLabel,
    channelLabel,
    virtualAccountNumber: channel !== 'QRIS' ? donation.paymentCode : undefined,
    qrString: donation.qrPayload || undefined,
    status: donation.status,
    createdAt: donation.createdAt.toISOString(),
    expiresAt: donation.expiredAt.toISOString(),
    paidAt: donation.paidAt?.toISOString(),
  };
}

function mapFundTypeToWeb(fundType: string): string {
  switch (fundType) {
    case 'Zakat Maal':
      return 'ZAKAT';
    case 'Infak':
      return 'INFAQ';
    case 'Shodaqoh':
      return 'SHODAQOH';
    case 'Wakaf Uang':
      return 'WAQF_CASH';
    default:
      return 'ZAKAT';
  }
}
