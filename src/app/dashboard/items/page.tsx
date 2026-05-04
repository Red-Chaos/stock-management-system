import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, Plus, Search, Filter } from 'lucide-react';
import DevButtons from './DevButtons';
import { getExchangeRates, convertCurrency } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import ItemsTableClient from './ItemsTableClient';

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

        <ItemsTableClient items={items} rates={rates} />

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px 0 0 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentPage > 1 && (
                <Link href={`/dashboard/items?page=${currentPage - 1}&search=${search}&sectionId=${sectionId}&status=${statusParam}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/dashboard/items?page=${currentPage + 1}&search=${search}&sectionId=${sectionId}&status=${statusParam}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
