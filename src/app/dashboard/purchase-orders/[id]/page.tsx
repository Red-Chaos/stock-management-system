import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Mail, Building2, User, Calendar, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: resolvedParams.id },
    include: {
      supplier: true,
      createdBy: true,
      items: true
    }
  }) as any;

  if (!po) notFound();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/purchase-orders" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Purchase Order {po.orderNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={18} /> Print PO
          </button>
          <button className="btn btn-secondary">
            <Mail size={18} /> Email to Supplier
          </button>
        </div>
      </div>

      <div id="po-document" className="glass-panel" style={{ padding: '48px', minHeight: '800px', background: 'white', color: 'black' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>PURCHASE ORDER</h2>
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}># {po.orderNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>Sentron Asia</div>
            <div style={{ fontSize: '12px', color: '#666' }}>123 Lab Street, Technology Park<br/>Singapore, 543210</div>
            <div style={{ fontSize: '12px', color: '#666' }}>sentronasia@yahoo.com</div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '12px' }}>Vendor</h3>
            <div style={{ fontWeight: 700 }}>{po.supplier.name}</div>
            <div style={{ fontSize: '13px' }}>{po.supplier.contactPerson}</div>
            <div style={{ fontSize: '13px' }}>{po.supplier.address}</div>
            <div style={{ fontSize: '13px' }}>{po.supplier.city}, {po.supplier.country}</div>
            <div style={{ fontSize: '13px' }}>{po.supplier.email}</div>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '12px' }}>Order Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Order Date:</span>
              <span>{new Date(po.createdAt).toLocaleDateString()}</span>
              <span style={{ color: '#666' }}>Expected:</span>
              <span>{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : 'N/A'}</span>
              <span style={{ color: '#666' }}>Status:</span>
              <span style={{ fontWeight: 700 }}>{po.status}</span>
              <span style={{ color: '#666' }}>Shipping:</span>
              <span>{po.shippingMethod || 'Standard'}</span>
              <span style={{ color: '#666' }}>Ordered By:</span>
              <span>{po.createdBy.name}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Item Name</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Unit Price</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{item.itemName}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>{po.currency} {item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{po.currency} {(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#666' }}>Subtotal:</span>
              <span>{po.currency} {po.totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#666' }}>Tax (0%):</span>
              <span>{po.currency} 0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 800 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>{po.currency} {po.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '80px', paddingTop: '24px', borderTop: '1px solid #eee', fontSize: '12px', color: '#888' }}>
          <p style={{ margin: 0 }}>Notes: {po.notes || 'No additional notes.'}</p>
          <p style={{ marginTop: '12px' }}>This is a computer generated purchase order. No signature is required.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #po-document, #po-document * { visibility: visible; }
          #po-document { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
