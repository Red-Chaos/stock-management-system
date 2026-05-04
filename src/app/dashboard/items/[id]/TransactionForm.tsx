'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Minus } from 'lucide-react';

export default function TransactionForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity: Number(quantity), reason })
      });
      if (res.ok) {
        setQuantity(1);
        setReason('');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to record transaction');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Adjust Stock</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => setType('INCOMING')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: type === 'INCOMING' ? 'rgba(0,200,83,0.2)' : 'transparent', color: type === 'INCOMING' ? 'var(--success)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={16} /> In
          </button>
          <button 
            type="button" 
            onClick={() => setType('OUTGOING')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: type === 'OUTGOING' ? 'rgba(255,145,0,0.2)' : 'transparent', color: type === 'OUTGOING' ? 'var(--warning)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
          >
            <Minus size={16} /> Out
          </button>
        </div>

        <div>
          <label>Quantity</label>
          <input type="number" min="1" required value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} />
        </div>

        <div>
          <label>Reason / Notes</label>
          <input type="text" required value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. New delivery, Sent to Lab 3" />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Record Transaction'}
        </button>
      </form>
    </div>
  );
}
