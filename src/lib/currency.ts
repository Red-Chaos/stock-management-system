import { prisma } from './prisma';

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  PKR: 278.50,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.50,
  CNY: 7.23,
  JPY: 151,
  KRW: 1350,
};

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
  try {
    const cache = await prisma.exchangeRateCache.findUnique({
      where: { baseCurrency }
    });

    const isStale = !cache || (Date.now() - cache.fetchedAt.getTime() > 24 * 60 * 60 * 1000);

    if (isStale) {
      // Fetch fresh rates
      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`, {
        next: { revalidate: 3600 }
      });
      
      if (response.ok) {
        const data = await response.json();
        const rates = data.rates;
        
        await prisma.exchangeRateCache.upsert({
          where: { baseCurrency },
          update: { rates, fetchedAt: new Date() },
          create: { baseCurrency, rates }
        });
        
        return rates;
      }
    }

    if (cache) {
      return cache.rates as Record<string, number>;
    }
    
    return FALLBACK_RATES;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return FALLBACK_RATES;
  }
}


