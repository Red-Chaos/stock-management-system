'use client';

import { useState, useEffect } from 'react';
import { Menu, Building2, Bell } from 'lucide-react';
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
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

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

    // Fetch Alerts
    const fetchAlerts = () => {
      fetch('/api/alerts')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAlerts(data);
        })
        .catch(err => console.error(err));
    };

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 60000); // Check every minute

    // Clock — tick every second
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, []);

  const acknowledgeAlert = async (id: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: id, status: 'ACKNOWLEDGED' })
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        alignItems: 'center', 
        justifyContent: 'flex-end',
        gap: '24px',
        userSelect: 'none'
      }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <Bell size={22} style={{ opacity: alerts.length > 0 ? 1 : 0.6 }} />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(255, 23, 68, 0.4)'
              }}>
                {alerts.length > 9 ? '9+' : alerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="glass-panel animate-slide-up" style={{
              position: 'absolute',
              top: '45px',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px',
              zIndex: 100,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              background: 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Stock Alerts</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alerts.length} New</span>
              </div>
              
              {alerts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active alerts. All systems normal.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {alerts.map(alert => (
                    <div key={alert.id} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: `4px solid ${alert.type === 'OUT_OF_STOCK' ? 'var(--danger)' : 'var(--warning)'}`
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{alert.stockItem.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{alert.message}</div>
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {time ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div 
              className="text-gradient-animate"
              style={{ 
                fontSize: '18px', 
                fontWeight: 800, 
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '1px'
              }}
            >
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
