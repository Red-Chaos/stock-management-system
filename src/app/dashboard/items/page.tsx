import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, Plus, Search, Filter } from 'lucide-react';
import DevButtons from './DevButtons';
import { getExchangeRates, convertCurrency } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';

export default async function ItemsPage(props: {
  searchParams: Promise<{ search?: string; sectionId?: string; status?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || '';
  const sectionId = searchParams.sectionId || '';
  const statusParam = searchParams.status || '';
  const currentPage = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 20;

  const whereClause: any = { AND: [] };
  if (search) {
    whereClause.AND.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { itemCode: { contains: search, mode: 'insensitive' } },
      ]
    });
  }
  if (sectionId) whereClause.AND.push({ sectionId });
  if (statusParam) whereClause.AND.push({ status: statusParam });

  if (whereClause.AND.length === 0) delete whereClause.AND;

  const totalItems = await prisma.stockItem.count({ where: whereClause });
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const items = await prisma.stockItem.findMany({
    where: whereClause,
    include: { section: true, category: true },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const sections = await prisma.section.findMany({ orderBy: { name: 'asc' } });
  const rates = await getExchangeRates('USD');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Stock Items</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your inventory across all departments</p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '16px' }}>
              <DevButtons />
            </div>
          )}
        </div>
        <Link href="/dashboard/items/new" className="btn btn-primary">
          <Plus size={20} />
          Add New Item
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Filters - Normally this would be a client component for interactive filtering, but we can do a form GET */}
        <form style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }} method="GET" action="/dashboard/items">
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              name="search"
              defaultValue={search}
              placeholder="Search by name or code..." 
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select name="sectionId" defaultValue={sectionId}>
              <option value="">All Sections</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ width: '200px' }}>
            <select name="status" defaultValue={statusParam}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">
            <Filter size={18} /> Filter
          </button>
        </form>

        {/* Items Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Item Code</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Name</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Section / Category</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Stock</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Price (USD)</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Price (PKR)</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No items found matching your criteria.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-[var(--bg-card-hover)]">
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.9rem' }}>{item.itemCode}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.section.color }}></div>
                        {item.section.name} <span style={{ color: 'var(--text-muted)' }}>/ {item.category.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>{item.quantity}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>
                      {formatCurrency(convertCurrency(item.price, item.priceCurrency, 'USD', rates), 'USD')}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(convertCurrency(item.price, item.priceCurrency, 'PKR', rates), 'PKR')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600,
                        background: item.status === 'ACTIVE' ? 'rgba(0, 200, 83, 0.1)' : item.status === 'LOW_STOCK' ? 'rgba(255, 145, 0, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                        color: item.status === 'ACTIVE' ? 'var(--success)' : item.status === 'LOW_STOCK' ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/dashboard/items/${item.id}`} style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
