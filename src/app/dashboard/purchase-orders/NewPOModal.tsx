'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';

export default function NewPOModal({ suppliers, stockItems }: { suppliers: any[], stockItems: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [supplierId, setSupplierId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [expectedDate, setExpectedDate] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const fetchTemplates = async () => {
    const res = await fetch('/api/purchase-orders/templates');
    const data = await res.json();
    if (Array.isArray(data)) setTemplates(data);
  };

  const loadTemplate = (id: string) => {
    const t = templates.find(temp => temp.id === id);
    if (t) {
      setSupplierId(t.supplierId || '');
      setCurrency(t.currency);
      setItems(t.items.map((i: any) => ({
        stockItemId: i.stockItemId || '',
        itemName: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      })));
    }
  };

  const addItem = () => {
    setItems([...items, { stockItemId: '', itemName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-fill price and name if stock item is selected
    if (field === 'stockItemId' && value) {
      const selectedStock = stockItems.find(i => i.id === value);
      if (selectedStock) {
        newItems[index].itemName = selectedStock.name;
        newItems[index].unitPrice = selectedStock.price;
        // Optional: warn if currency mismatch
      }
    }
    
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAmount = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add at least one item');
    
    setLoading(true);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          currency,
          expectedDate,
          shippingCost,
          subtotal,
          totalAmount,
          notes,
          items
        })
      });
      
      if (res.ok) {
        if (saveAsTemplate && templateName) {
          await fetch('/api/purchase-orders/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: templateName,
              supplierId,
              currency,
              description: notes,
              items
            })
          });
        }
        setIsOpen(false);
        setSupplierId('');
        setItems([]);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create PO');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        <Plus size={18} /> Create PO
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, padding: '24px', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '32px', position: 'relative', margin: 'auto' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Create Purchase Order</h2>

            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quick Start: Load from Template</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <select onChange={e => loadTemplate(e.target.value)} onClick={fetchTemplates}>
                  <option value="">Select Template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button type="button" onClick={fetchTemplates} className="btn btn-secondary" style={{ padding: '8px' }}>
                  Refresh
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Supplier *</label>
                  <select required value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Expected Delivery Date</label>
                  <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
                </div>
                <div>
                  <label>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}>
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>Shipping Cost</label>
                  <input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontWeight: 600 }}>Order Items</h3>
                  <button type="button" onClick={addItem} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Add Item</button>
                </div>
                
                {items.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                    No items added yet. Click "+ Add Item" to begin.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map((item: any, index: number) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem' }}>Link to Stock Item</label>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span>{currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
                    <span>{currency} {shippingCost.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontWeight: 700, fontSize: '1.1rem' }}>
                    <span>Total:</span>
                    <span>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label>Notes / Terms</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', background: 'rgba(0, 200, 83, 0.05)' }}>
                <input 
                  type="checkbox" 
                  id="saveTemplate" 
                  checked={saveAsTemplate} 
                  onChange={e => setSaveAsTemplate(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="saveTemplate" style={{ cursor: 'pointer', margin: 0, fontWeight: 600 }}>Save this configuration as a template</label>
                {saveAsTemplate && (
                  <input 
                    type="text" 
                    placeholder="Template Name..." 
                    value={templateName} 
                    onChange={e => setTemplateName(e.target.value)}
                    required
                    style={{ flex: 1, padding: '8px' }}
                  />
                )}
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
