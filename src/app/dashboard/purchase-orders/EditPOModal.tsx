'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, X, Loader2, Trash2, CheckCircle, Truck, PackageCheck } from 'lucide-react';

export default function EditPOModal({ po }: { po: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    status: po.status || 'DRAFT',
    expectedDate: po.expectedDate ? new Date(po.expectedDate).toISOString().split('T')[0] : '',
    receivedDate: po.receivedDate ? new Date(po.receivedDate).toISOString().split('T')[0] : '',
    shippingMethod: po.shippingMethod || '',
    trackingNumber: po.trackingNumber || '',
    notes: po.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update purchase order');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${po.orderNumber}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete purchase order');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: newStatus })
      });
      if (res.ok) {
        setFormData(prev => ({ ...prev, status: newStatus }));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Edit Purchase Order {po.orderNumber}</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {['DRAFT', 'SUBMITTED', 'CONFIRMED', 'SHIPPED', 'RECEIVED'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(s)}
                  disabled={loading || formData.status === 'RECEIVED'}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--border)',
                    background: formData.status === s ? 'var(--primary)' : 'transparent',
                    color: formData.status === s ? 'white' : 'var(--text-secondary)',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Expected Date</label>
                <input type="date" value={formData.expectedDate} onChange={e => setFormData({...formData, expectedDate: e.target.value})} />
              </div>
              <div>
                <label>Received Date</label>
                <input type="date" value={formData.receivedDate} onChange={e => setFormData({...formData, receivedDate: e.target.value})} />
              </div>
              <div>
                <label>Shipping Method</label>
                <input type="text" value={formData.shippingMethod} onChange={e => setFormData({...formData, shippingMethod: e.target.value})} />
              </div>
              <div>
                <label>Tracking Number</label>
                <input type="text" value={formData.trackingNumber} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={handleDelete} className="btn btn-danger" disabled={loading || formData.status === 'RECEIVED'}>
                  <Trash2 size={16} /> Delete
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {po.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
                    <span>{item.itemName} x {item.quantity}</span>
                    <span>{po.currency} {item.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
