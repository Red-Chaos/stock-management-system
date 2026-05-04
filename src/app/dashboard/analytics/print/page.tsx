import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import AnalyticsCharts from '../AnalyticsCharts';

export default async function PrintAnalyticsPage() {
  const sections = await prisma.section.findMany({
    include: {
      _count: { select: { items: true } },
      items: { select: { price: true, quantity: true } }
    }
  });

  const transactions = await prisma.stockTransaction.findMany({
    orderBy: { createdAt: 'asc' },
    take: 100
  });

  const sectionData = sections.map(s => {
    let sectionValue = 0;
    s.items.forEach(i => sectionValue += i.price * i.quantity);
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
    <div style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Stock Management Report</h1>
        <p style={{ color: '#666' }}>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Section</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Total Items</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Est. Value</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.map(s => (
              <tr key={s.name}>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{s.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>{s.items}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>{s.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* For printing, Recharts will render SVG which works fine */}
      <AnalyticsCharts sectionData={sectionData} txData={txData} />

      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </div>
  );
}
