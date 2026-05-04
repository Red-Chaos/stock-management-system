import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { BarChart3, Printer, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import AnalyticsCharts from './AnalyticsCharts';

export default async function AnalyticsPage() {
  // Aggregate Data
  const sections = await prisma.section.findMany({
    include: {
      _count: { select: { items: true } },
      items: { select: { price: true, quantity: true, priceCurrency: true, status: true } }
    }
  });

  const transactions = await prisma.stockTransaction.findMany({
    orderBy: { createdAt: 'asc' },
    take: 100 // Limit for demonstration
  });

  // Basic Stats Calculation
  let totalValueUSD = 0; // Simplified assumption for demo that base value is kept. 
  // In a real app we'd convert each item's price to a base currency dynamically.
  let totalLowStock = 0;
  let totalOutOfStock = 0;

  const sectionData = sections.map(s => {
    let sectionValue = 0;
    s.items.forEach(i => {
      sectionValue += i.price * i.quantity; // Not doing exact currency conversion here for brevity
      if (i.status === 'LOW_STOCK') totalLowStock++;
      if (i.status === 'OUT_OF_STOCK') totalOutOfStock++;
    });
    totalValueUSD += sectionValue;
    return { name: s.name, value: sectionValue, items: s._count.items, color: s.color };
  });

  const txData = transactions.reduce((acc: any[], tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString();
    let entry = acc.find(a => a.date === date);
    if (!entry) {
      entry = { date, incoming: 0, outgoing: 0 };
      acc.push(entry);
    }
    if (tx.type === 'INCOMING') entry.incoming += tx.quantity;
    if (tx.type === 'OUTGOING') entry.outgoing += tx.quantity;
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Analytics & Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View stock distribution and trends</p>
        </div>
        <Link href="/dashboard/analytics/print" target="_blank" className="btn btn-secondary">
          <Printer size={20} /> Print Report
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 200, 83, 0.1)', color: 'var(--success)' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Est. Total Value (Mix)</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>~ {totalValueUSD.toFixed(0)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 145, 0, 0.1)', color: 'var(--warning)' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Low Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalLowStock}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.1)', color: 'var(--danger)' }}>
            <PieChart size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Out of Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalOutOfStock}</div>
          </div>
        </div>
      </div>

      {/* Charts component (Client) */}
      <AnalyticsCharts sectionData={sectionData} txData={txData} />

    </div>
  );
}
