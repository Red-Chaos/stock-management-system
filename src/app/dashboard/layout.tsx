'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  BarChart3, 
  Users, 
  History, 
  LogOut, 
  Menu,
  X,
  FileDown,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCompanyName } from '@/app/actions/settings';
import EditUserModal from './EditUserModal';
import TopHeader from './TopHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyNameState] = useState('StockSys');

  useEffect(() => {
    getCompanyName().then(name => setCompanyNameState(name));
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Sections', href: '/dashboard/sections', icon: Layers },
    { name: 'Stock Items', href: '/dashboard/items', icon: Package },
    { name: 'Suppliers', href: '/dashboard/suppliers', icon: Users },
    { name: 'Warehouses', href: '/dashboard/warehouses', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Export / Import', href: '/dashboard/export-import', icon: FileDown },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (session?.user?.role === 'ADMIN') {
    navigation.push(
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Activity Logs', href: '/dashboard/logs', icon: History }
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: sidebarOpen ? 0 : '-280px',
        width: '280px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        zIndex: 50,
        transition: 'left 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }} className="md:static md:translate-x-0">
        
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
            {companyName}
          </h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="hover-slide-right"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? 'rgba(0, 200, 83, 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: isActive ? 600 : 500
                }}
              >
                <item.icon size={20} className={isActive ? "animate-bounce-soft" : ""} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{session?.user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session?.user?.role}</div>
            </div>
          </div>
          
          {session?.user && (
            <div style={{ marginBottom: '12px' }}>
              <EditUserModal user={session.user as any} buttonStyle="full" />
            </div>
          )}

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }} className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
