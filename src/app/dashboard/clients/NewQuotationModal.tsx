'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, X, Loader2, Trash2, Plus } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';

export default function NewQuotationModal({ clients, stockItems }: { clients: any[], stockItems: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [clientId, setClientId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const addItem = () => {
    setItems([...items, { stockItemId: '', itemName: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'stockItemId' && value) {
      const selectedStock = stockItems.find(i => i.id === value);
      if (selectedStock) {
        newItems[index].itemName = selectedStock.name;
        newItems[index].unitPrice = selectedStock.price * 1.2; // 20% markup for quotation
      }
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAmount = subtotal - discount + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return alert('Please select a client');
    if (items.length === 0) return alert('Please add at least one item');
    
    setLoading(true);
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          currency,
          validUntil,
          discount,
          tax,
          subtotal,
          totalAmount,
          notes,
          items
        })
      });
      
      if (res.ok) {
        setIsOpen(false);
        setClientId('');
        setItems([]);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create quotation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-secondary">
        <FileText size={18} /> New Quotation
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, padding: '24px', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '32px', position: 'relative', margin: 'auto' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Create New Quotation</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Client *</label>
                  <select required value={clientId} onChange={e => setClientId(e.target.value)}>
                    <option value="">Select Client...</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.organization || 'Individual'})</option>)}
                  </select>
                </div>
                <div>
                  <label>Valid Until</label>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>
                <div>
                  <label>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}>
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontWeight: 600 }}>Quotation Items</h3>
                  <button type="button" onClick={addItem} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Add Item</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem' }}>Stock Item (Optional)</label>
                        <select value={item.stockItemId} onChange={e => updateItem(index, 'stockItemId', e.target.value)}>
                          <option value="">Custom Item...</option>
                          {stockItems.map((si: any) => <option key={si.id} value={si.id}>{si.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem' }}>Item Name *</label>
                        <input type="text" required value={item.itemName} onChange={e => updateItem(index, 'itemName', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem' }}>Qty</label>
                        <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem' }}>Unit Price</label>
                        <input type="number" step="0.01" min="0" required value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      </div>
                      <button type="button" onClick={() => removeItem(index)} style={{ padding: '10px', background: 'rgba(255, 23, 68, 0.1)', color: 'var(--danger)', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <input type="text" placeholder="Description/Specifications..." value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} style={{ padding: '8px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px' }}>
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label>Discount</label>
                    <input type="number" step="0.01" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label>Tax</label>
                    <input type="number" step="0.01" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div style={{ width: '300px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span>{currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontWeight: 700, fontSize: '1.1rem' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--primary)' }}>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label>Notes / Terms & Conditions</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Valid for 30 days. Payment terms: 50% advance."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
