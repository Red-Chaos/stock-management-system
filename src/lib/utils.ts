
export function generateItemCode(sectionSlug: string): string {
  const prefix = sectionSlug.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getStockStatus(quantity: number, minStockLevel: number): 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= minStockLevel) return 'LOW_STOCK';
  return 'ACTIVE';
}

export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return (amount / fromRate) * toRate;
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, { locale: string; code: string }> = {
    PKR: { locale: 'en-PK', code: 'PKR' },
    USD: { locale: 'en-US', code: 'USD' },
    EUR: { locale: 'de-DE', code: 'EUR' },
    GBP: { locale: 'en-GB', code: 'GBP' },
    CNY: { locale: 'zh-CN', code: 'CNY' },
    JPY: { locale: 'ja-JP', code: 'JPY' },
    KRW: { locale: 'ko-KR', code: 'KRW' },
    INR: { locale: 'en-IN', code: 'INR' },
  };

  const config = currencyMap[currency] || { locale: 'en-US', code: currency };
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const SUPPORTED_CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW', 'INR'] as const;

export const LOGISTICS_COMPANIES = [
  'DHL', 'FedEx', 'UPS', 'TCS', 'Leopards Courier',
  'Blue Dart', 'DTDC', 'TNT', 'Aramex', 'SF Express',
  'China Post', 'Japan Post', 'Korea Post', 'Royal Mail',
  'USPS', 'Other',
] as const;

export const COUNTRIES = [
  'Pakistan', 'United States', 'United Kingdom', 'Germany', 'France',
  'China', 'Japan', 'South Korea', 'India', 'Australia',
  'Canada', 'Brazil', 'Russia', 'Italy', 'Spain',
  'Netherlands', 'Switzerland', 'Sweden', 'Singapore', 'Malaysia',
  'UAE', 'Saudi Arabia', 'Turkey', 'Indonesia', 'Thailand',
  'Vietnam', 'Philippines', 'Bangladesh', 'Sri Lanka', 'Other',
] as const;

export const PLUG_TYPES = [
  'Type A (US/Japan)',
  'Type B (US 3-pin)',
  'Type C (EU 2-pin)',
  'Type D (India)',
  'Type G (UK)',
  'Type I (Australia/China)',
  'Universal',
  'N/A',
] as const;
