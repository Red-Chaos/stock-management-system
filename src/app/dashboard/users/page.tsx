import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, Shield, User as UserIcon, Plus } from 'lucide-react';
import NewUserModal from './NewUserModal';
import EditUserModal from '../EditUserModal';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard');

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true, permissions: true,
      _count: { select: { transactions: true, logs: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage employee and admin accounts</p>
        </div>
        <NewUserModal />
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>User</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Role</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Activity Stats</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Joined</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500, width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user.role === 'ADMIN' ? 'var(--secondary)' : 'var(--text-primary)' }}>
                    {user.role === 'ADMIN' ? <Shield size={16} /> : <UserIcon size={16} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.role}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600,
                    background: user.isActive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                    color: user.isActive ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {user._count.transactions} Tx • {user._count.logs} Logs
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <EditUserModal user={{...user, permissions: user.permissions as any}} buttonStyle="icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
