import { NextResponse } from 'next/server';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';
import { getExchangeRates, convertCurrency } from '@/lib/currency';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const base = searchParams.get('base') || 'USD';
    const amount = parseFloat(searchParams.get('amount') || '1');

    if (!SUPPORTED_CURRENCIES.includes(base as any)) {
      return NextResponse.json({ error: 'Unsupported base currency' }, { status: 400 });
    }

    // Use the shared exchange rate utility (handles caching, fallback, etc.)
    const rates = await getExchangeRates(base);

    const conversions: Record<string, number> = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      conversions[currency] = convertCurrency(amount, base, currency, rates);
    }

    return NextResponse.json({
      base,
      amount,
      conversions
    });

  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json({ error: 'Failed to calculate currency' }, { status: 500 });
  }
}
