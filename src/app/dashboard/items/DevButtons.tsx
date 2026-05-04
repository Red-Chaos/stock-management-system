'use client';

import { useState } from 'react';
import { seedDummyStock, clearDummyStock } from './actions';
import { Database, Trash2, Loader2 } from 'lucide-react';

export default function DevButtons() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDummyStock();
    } catch (e) {
      console.error(e);
      alert('Failed to seed data');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearDummyStock();
    } catch (e) {
      console.error(e);
      alert('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button 
        onClick={handleSeed} 
        disabled={isSeeding || isClearing}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'rgba(0, 200, 83, 0.1)', color: 'var(--success)',
          fontWeight: 600, cursor: isSeeding || isClearing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', fontSize: '0.9rem'
        }}
      >
        {isSeeding ? <Loader2 size={16} className="lucide lucide-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> : <Database size={16} />}
        Seed Dummy Data
      </button>

      <button 
        onClick={handleClear} 
        disabled={isSeeding || isClearing}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'rgba(255, 23, 68, 0.1)', color: 'var(--danger)',
          fontWeight: 600, cursor: isSeeding || isClearing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', fontSize: '0.9rem'
        }}
      >
        {isClearing ? <Loader2 size={16} className="lucide lucide-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
        Clear Dummy Data
      </button>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
