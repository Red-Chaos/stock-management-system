import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Users, Building, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import NewClientModal from './NewClientModal';
import EditClientModal from './EditClientModal';
import NewQuotationModal from './NewQuotationModal';

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { projects: true, quotations: true } }
    }
  });

  const stockItems = await prisma.stockItem.findMany({ select: { id: true, name: true, price: true } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Clients</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage organizations and project clients</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <NewQuotationModal clients={clients} stockItems={stockItems} />
          <NewClientModal />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {clients.map(client => (
          <div key={client.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255, 61, 0, 0.1)', color: '#FF3D00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{client.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.organization || client.contactPerson || 'No organization'}</div>
                </div>
              </div>
              <EditClientModal client={client} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {client.email && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Mail size={14} /> {client.email}</div>}
              {client.phone && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Phone size={14} /> {client.phone}</div>}
              {client.country && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={14} /> {client.city ? `${client.city}, ` : ''}{client.country}</div>}
              {client.organizationType && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Building size={14} /> {client.organizationType}</div>}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{client._count.projects}</strong> Projects
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{client._count.quotations}</strong> Quotes
              </div>
              <span style={{
                marginLeft: 'auto', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: client.isActive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                color: client.isActive ? 'var(--success)' : 'var(--danger)'
              }}>
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No clients found</h3>
            <p style={{ marginTop: '8px' }}>Add your first client to start creating quotations and projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
