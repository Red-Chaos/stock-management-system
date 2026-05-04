'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, CheckSquare, Square, Loader2, Warehouse, Activity } from 'lucide-react';
import { convertCurrency } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';

export default function ItemsTableClient({ items, rates }: { items: any[], rates: any }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
    setLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/items/${id}`, { method: 'DELETE' });
      }
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    setLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="animate-slide-up" style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-card)',
          border: '1px solid var(--primary)',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          zIndex: 100,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedIds.length} items selected</span>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => bulkUpdateStatus('ACTIVE')}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              disabled={loading}
            >
              Set Active
            </button>
            <button 
              onClick={() => bulkUpdateStatus('LOW_STOCK')}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              disabled={loading}
            >
              Set Low Stock
            </button>
            <button 
              onClick={bulkDelete}
              className="btn btn-danger" 
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
            </button>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px', width: '40px' }}>
                <button onClick={toggleAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                  {selectedIds.length === items.length && items.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
              </th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Item Code</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Name</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Section</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Stock</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Price (USD)</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr 
                key={item.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)', 
                  transition: 'background 0.2s',
                  background: selectedIds.includes(item.id) ? 'rgba(0, 200, 83, 0.05)' : 'transparent'
                }} 
                className="hover:bg-[var(--bg-card-hover)]"
              >
                <td style={{ padding: '16px' }}>
                  <button onClick={() => toggleSelect(item.id)} style={{ background: 'none', border: 'none', color: selectedIds.includes(item.id) ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
                    {selectedIds.includes(item.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </td>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.9rem' }}>{item.itemCode}</td>
                <td style={{ padding: '16px', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.section.color }}></div>
                    {item.section.name}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>{item.quantity}</td>
                <td style={{ padding: '16px', fontWeight: 500 }}>
                  {formatCurrency(convertCurrency(item.price, item.priceCurrency, 'USD', rates), 'USD')}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600,
                    background: item.status === 'ACTIVE' ? 'rgba(0, 200, 83, 0.1)' : item.status === 'LOW_STOCK' ? 'rgba(255, 145, 0, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                    color: item.status === 'ACTIVE' ? 'var(--success)' : item.status === 'LOW_STOCK' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href={`/dashboard/items/${item.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                      View
                    </Link>
                    <Link href={`/dashboard/items/${item.id}/edit`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
