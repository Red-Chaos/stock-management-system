import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Building, Plus, Phone, Mail, Globe, MapPin, Truck } from 'lucide-react';
import NewSupplierModal from './NewSupplierModal';
import EditSupplierModal from './EditSupplierModal';

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { items: true, purchaseOrders: true } }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Suppliers</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your equipment and chemical vendors</p>
        </div>
        {isAdmin && <NewSupplierModal />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {suppliers.map(supplier => (
          <div key={supplier.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,176,255,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{supplier.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{supplier.contactPerson || 'No contact person'}</div>
                </div>
              </div>
              {isAdmin && <EditSupplierModal supplier={supplier} />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {supplier.email && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Mail size={14} /> {supplier.email}</div>}
              {supplier.phone && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Phone size={14} /> {supplier.phone}</div>}
              {supplier.country && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={14} /> {supplier.city ? `${supplier.city}, ` : ''}{supplier.country}</div>}
              {supplier.website && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Globe size={14} /> <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>{supplier.website}</a></div>}
              {supplier.leadTimeDays && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Truck size={14} /> {supplier.leadTimeDays} days lead time</div>}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{supplier._count.items}</strong> Items
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{supplier._count.purchaseOrders}</strong> Orders
              </div>
              {supplier.rating > 0 && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px', color: 'var(--warning)' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ opacity: i < supplier.rating! ? 1 : 0.3 }}>★</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {suppliers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            <Building size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No suppliers found</h3>
            <p style={{ marginTop: '8px' }}>Add your first vendor to start tracking inventory sources.</p>
          </div>
        )}
      </div>
    </div>
  );
}
