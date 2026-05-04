import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ShoppingCart, FileText, Calendar, Truck, DollarSign, Building } from 'lucide-react';
import NewPOModal from './NewPOModal';
import EditPOModal from './EditPOModal';

export default async function PurchaseOrdersPage() {
  const session = await getServerSession(authOptions);
  
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: true,
      items: true
    }
  });

  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  const stockItems = await prisma.stockItem.findMany({ select: { id: true, name: true, priceCurrency: true, price: true } });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return { bg: 'rgba(158, 158, 158, 0.1)', text: 'var(--text-secondary)' };
      case 'SUBMITTED': return { bg: 'rgba(33, 150, 243, 0.1)', text: '#2196F3' };
      case 'CONFIRMED': return { bg: 'rgba(0, 188, 212, 0.1)', text: '#00BCD4' };
      case 'SHIPPED': return { bg: 'rgba(156, 39, 176, 0.1)', text: '#9C27B0' };
      case 'PARTIALLY_RECEIVED': return { bg: 'rgba(255, 152, 0, 0.1)', text: '#FF9800' };
      case 'RECEIVED': return { bg: 'rgba(76, 175, 80, 0.1)', text: '#4CAF50' };
      case 'CANCELLED': return { bg: 'rgba(244, 67, 54, 0.1)', text: '#F44336' };
      default: return { bg: 'rgba(158, 158, 158, 0.1)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Purchase Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage supplier orders and inbound inventory</p>
        </div>
        <NewPOModal suppliers={suppliers} stockItems={stockItems} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {pos.map(po => {
          const colors = getStatusColor(po.status);
          return (
            <div key={po.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(103, 58, 183, 0.1)', color: '#673AB7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{po.orderNumber}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(po.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <EditPOModal po={po} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Building size={14} /> Supplier: {po.supplier.name}</div>
                {po.expectedDate && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Calendar size={14} /> Expected: {new Date(po.expectedDate).toLocaleDateString()}</div>}
                {po.trackingNumber && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Truck size={14} /> Tracking: {po.trackingNumber}</div>}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><DollarSign size={14} /> Total: {po.currency} {po.totalAmount.toFixed(2)}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><FileText size={14} /> {po.items.length} unique items</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                  background: colors.bg,
                  color: colors.text
                }}>
                  {po.status.replace(/_/g, ' ')}
                </span>
                {po.receivedDate && (
                  <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
                    Received: {new Date(po.receivedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {pos.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No purchase orders found</h3>
            <p style={{ marginTop: '8px' }}>Create your first PO to restock inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
