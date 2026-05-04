'use client';

import { useState, useEffect } from 'react';
import { Menu, Building2 } from 'lucide-react';
import { getCompanyName } from '@/app/actions/settings';
import { useTheme } from '@/app/ThemeProvider';

export default function TopHeader({ 
  setSidebarOpen 
}: { 
  setSidebarOpen: (v: boolean) => void;
}) {
  const [companyName, setCompanyNameState] = useState<string>('StockSys Corporate');
  const [time, setTime] = useState<Date | null>(null);
  const { clockFormat } = useTheme();

  const formatTime = (date: Date, format: '12h' | '24h') => {
    const rawHours = date.getHours(); // always 0–23
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    if (format === '24h') {
      // Strict 24-hour: 00–23, no AM/PM ever
      return `${rawHours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    } else {
      // 12-hour with AM/PM
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      let hours12 = rawHours % 12;
      if (hours12 === 0) hours12 = 12;
      return `${hours12.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    }
  };

  useEffect(() => {
    // Fetch Company Name
    getCompanyName().then(name => setCompanyNameState(name));

    // Clock — tick every second
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{ 
      height: '70px', 
      background: 'var(--glass-bg)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid var(--border)', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 30 
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <button 
          className="md:hidden" 
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginRight: '16px' }}
        >
          <Menu size={24} />
        </button>
      </div>

      <div style={{ 
        flex: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ 
          background: 'rgba(0, 200, 83, 0.1)', 
          padding: '8px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Building2 size={20} className="animate-spin-slow" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="animate-slide-up" style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          letterSpacing: '0.5px',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          {companyName}
        </h1>
      </div>

      <div className="animate-fade-in" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        userSelect: 'none'
      }}>
        {time ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {formatTime(time, clockFormat)}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
        )}
      </div>
    </header>
  );
}
