'use client';

import { useTheme } from '@/app/ThemeProvider';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getCompanyName, setCompanyName } from '@/app/actions/settings';
import { Sun, Moon, Building2, Save, Loader2, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme, clockFormat, toggleClockFormat } = useTheme();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [companyName, setCompanyNameState] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      getCompanyName().then(name => setCompanyNameState(name));
    }
  }, [isAdmin]);

  const handleSaveCompany = async () => {
    setLoading(true);
    setSaveSuccess(false);
    const res = await setCompanyName(companyName);
    setLoading(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Failed to update company name');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal preferences and system settings.</p>
      </div>

      <div className="glass-panel animate-slide-up" style={{ padding: '24px', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {theme === 'dark' ? <Moon size={20} className="animate-bounce-soft" /> : <Sun size={20} className="animate-spin-slow" />}
          Personal Preferences
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Theme Preference</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle between Light and Dark mode for your account.</div>
            </div>
            
            <button 
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '24px',
                border: '1px solid var(--border)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {theme === 'dark' ? <><Moon size={16} /> Dark</> : <><Sun size={16} /> Light</>}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Time Format</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Choose between 12-hour and 24-hour clock.</div>
            </div>
            
            <button 
              onClick={toggleClockFormat}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '24px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Clock size={16} /> {clockFormat === '12h' ? '12 Hour (AM/PM)' : '24 Hour'}
            </button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="glass-panel animate-slide-up" style={{ padding: '24px', animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--primary)' }} />
            System Configuration
          </h2>
          
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Global Company Name</label>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>This name appears in the top header for all users across the platform.</p>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={companyName}
                onChange={e => setCompanyNameState(e.target.value)}
                style={{ flex: 1, maxWidth: '400px' }}
                placeholder="e.g. Acme Corporation"
              />
              <button 
                onClick={handleSaveCompany}
                disabled={loading || !companyName.trim()}
                className="btn btn-primary"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
            {saveSuccess && (
              <div style={{ marginTop: '12px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
                ✓ Company name updated successfully
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
