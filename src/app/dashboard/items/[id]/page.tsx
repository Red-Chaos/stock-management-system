import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Box, Info, MapPin, DollarSign, RefreshCw, Layers } from 'lucide-react';
import { SUPPORTED_CURRENCIES, formatCurrency } from '@/lib/utils';
import { getExchangeRates, convertCurrency } from '@/lib/currency';
import TransactionForm from './TransactionForm';

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await prisma.stockItem.findUnique({
    where: { id: resolvedParams.id },
    include: {
      section: true,
      category: true,
      subCategory: true,
      supplier: true,
      warehouse: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        include: { performedBy: true }
      },
      parts: {
        include: { partItem: { select: { quantity: true, status: true } } }
      }
    }
  });

  if (!item) notFound();

  // Use the shared exchange rate utility for consistent multi-currency display
  const rates = await getExchangeRates(item.priceCurrency);

  const conversions: Record<string, number> = {};
  if (item.price > 0) {
    for (const cur of SUPPORTED_CURRENCIES) {
      conversions[cur] = convertCurrency(item.price, item.priceCurrency, cur, rates);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/items" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{item.name}</h1>
              <span style={{
                padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600,
                background: item.status === 'ACTIVE' ? 'rgba(0, 200, 83, 0.1)' : item.status === 'LOW_STOCK' ? 'rgba(255, 145, 0, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                color: item.status === 'ACTIVE' ? 'var(--success)' : item.status === 'LOW_STOCK' ? 'var(--warning)' : 'var(--danger)'
              }}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'monospace' }}>{item.itemCode}</span>
              <span>•</span>
              <span style={{ color: item.section.color }}>{item.section.name}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href={`/dashboard/items/${item.id}/edit`} className="btn btn-secondary">
            <Edit size={16} /> Edit Item
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="md:grid-cols-1">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Info */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="var(--primary)" /> Item Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category</span><div style={{ fontWeight: 500 }}>{item.category.name}</div></div>
              {item.subCategory && <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sub-Category</span><div style={{ fontWeight: 500 }}>{item.subCategory.name}</div></div>}
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manufacturer</span><div style={{ fontWeight: 500 }}>{item.manufacturer || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Model</span><div style={{ fontWeight: 500 }}>{item.model || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Serial Number</span><div style={{ fontWeight: 500 }}>{item.serialNumber || 'N/A'}</div></div>
            </div>
          </div>

          {/* Pricing Card with Multi-Currency */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--primary)" /> Pricing ({item.priceCurrency})
            </h2>
            <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
              {item.priceCurrency} {item.price.toFixed(2)}
            </div>
            {Object.keys(conversions).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {Object.entries(conversions).map(([curr, val]) => (
                  <div key={curr} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>{curr}</div>
                    <div style={{ fontWeight: 600 }}>{val.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Origin & Logistics */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary)" /> Origin & Logistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Warehouse</span><div style={{ fontWeight: 500 }}>{(item as any).warehouse?.name || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Supplier</span><div style={{ fontWeight: 500 }}>{(item as any).supplier?.name || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Storage Location</span><div style={{ fontWeight: 500 }}>{item.location || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Country of Origin</span><div style={{ fontWeight: 500 }}>{item.countryOfOrigin || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Logistics Company</span><div style={{ fontWeight: 500 }}>{item.logisticsCompany || 'N/A'}</div></div>
              <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tracking Number</span><div style={{ fontWeight: 500 }}>{item.trackingNumber || 'N/A'}</div></div>
            </div>
          </div>

          {/* Section Specific Details */}
          {item.sectionSpecificFields && Object.keys(item.sectionSpecificFields).length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: item.section.color }}>
                {item.section.name} Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {Object.entries(item.sectionSpecificFields as Record<string, any>).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div style={{ fontWeight: 500 }}>{v?.toString() || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parts Tracking (Physics) */}
          {item.parts.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary)" /> Required Parts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {item.parts.map(part => {
                  const hasStock = part.partItem && part.partItem.quantity > 0;
                  return (
                    <div key={part.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>{part.partName} {part.isRequired ? '*' : ''}</span>
                      {part.partItemId ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: hasStock ? 'var(--success)' : 'var(--danger)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasStock ? 'var(--success)' : 'var(--danger)' }}></div>
                          {hasStock ? `In Stock (${part.partItem?.quantity})` : 'Out of Stock'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not linked</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Stock & Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Current Stock */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Stock</h2>
            <div style={{ fontSize: '48px', fontWeight: 700, color: item.quantity > item.minStockLevel ? 'var(--success)' : (item.quantity === 0 ? 'var(--danger)' : 'var(--warning)') }}>
              {item.quantity}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Min Level: {item.minStockLevel}</div>
          </div>

          {/* Adjust Stock Form (Client Component) */}
          <TransactionForm itemId={item.id} />

          {/* Transaction History */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {item.transactions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No transactions yet.</div>
              ) : (
                item.transactions.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: `2px solid ${tx.type === 'INCOMING' ? 'var(--success)' : 'var(--warning)'}`, paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: tx.type === 'INCOMING' ? 'var(--success)' : 'var(--warning)', fontSize: '0.9rem' }}>
                        {tx.type === 'INCOMING' ? '+' : '-'}{tx.quantity}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {tx.reason && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tx.reason}</div>}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {tx.performedBy.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
