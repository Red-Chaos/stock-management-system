import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Activity, Search } from 'lucide-react';

export default async function LogsPage(props: { searchParams: Promise<{ action?: string; userId?: string; page?: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard');

  const searchParams = await props.searchParams;
  const actionFilter = searchParams.action || '';
  const userFilter = searchParams.userId || '';
  const currentPage = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 50;

  const whereClause: any = { AND: [] };
  if (actionFilter) whereClause.AND.push({ action: actionFilter });
  if (userFilter) whereClause.AND.push({ userId: userFilter });
  if (whereClause.AND.length === 0) delete whereClause.AND;

  const totalLogs = await prisma.activityLog.count({ where: whereClause });
  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  const logs = await prisma.activityLog.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage
  });

  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  
  // Get unique actions from db for the filter
  const actions = await prisma.activityLog.findMany({ distinct: ['action'], select: { action: true } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Activity Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete audit trail of system events</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <form method="GET" action="/dashboard/logs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '200px' }}>
            <label>Action Type</label>
            <select name="action" defaultValue={actionFilter}>
              <option value="">All Actions</option>
              {actions.map(a => <option key={a.action} value={a.action}>{a.action}</option>)}
            </select>
          </div>
          <div style={{ width: '200px' }}>
            <label>User</label>
            <select name="userId" defaultValue={userFilter}>
              <option value="">All Users</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              <Search size={18} /> Filter
            </button>
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Timestamp</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>User</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Action</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Entity</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-[var(--bg-card-hover)]">
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>
                    {log.user.name}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                      background: 'rgba(0,176,255,0.1)', color: 'var(--secondary)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{log.entity}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
