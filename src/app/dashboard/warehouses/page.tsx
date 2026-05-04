import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LayoutDashboard, MapPin, User, Phone, Layers } from 'lucide-react';
import NewWarehouseModal from './NewWarehouseModal';
import EditWarehouseModal from './EditWarehouseModal';

export default async function WarehousesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { items: true } }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Warehouses & Locations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your storage facilities and locations</p>
        </div>
        {isAdmin && <NewWarehouseModal />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(124, 77, 255, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{warehouse.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Code: {warehouse.code}</div>
                </div>
              </div>
              {isAdmin && <EditWarehouseModal warehouse={warehouse} />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {warehouse.manager && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><User size={14} /> Manager: {warehouse.manager}</div>}
              {warehouse.phone && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Phone size={14} /> {warehouse.phone}</div>}
              {warehouse.country && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={14} /> {warehouse.city ? `${warehouse.city}, ` : ''}{warehouse.country}</div>}
              {warehouse.capacity && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Layers size={14} /> Capacity: {warehouse.capacity}</div>}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{warehouse._count.items}</strong> Items stored here
              </div>
              <span style={{
                marginLeft: 'auto', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: warehouse.isActive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                color: warehouse.isActive ? 'var(--success)' : 'var(--danger)'
              }}>
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {warehouses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            <LayoutDashboard size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No warehouses found</h3>
            <p style={{ marginTop: '8px' }}>Add your first warehouse to start organizing inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
