import { prisma } from '@/lib/prisma';
import { Package, AlertTriangle, XCircle, Layers, Activity, DollarSign, FileText, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const totalItems = await prisma.stockItem.count();
  const lowStock = await prisma.stockItem.count({ where: { status: 'LOW_STOCK' } });
  const outOfStock = await prisma.stockItem.count({ where: { status: 'OUT_OF_STOCK' } });
  const sectionsCount = await prisma.section.count();

  const allItems = await prisma.stockItem.findMany({ select: { price: true, quantity: true } });
  const totalStockValue = allItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const pendingPOs = await prisma.purchaseOrder.count({
    where: { status: { in: ['SUBMITTED', 'CONFIRMED', 'SHIPPED'] } }
  });

  const activeProjects = await prisma.project.count({
    where: { status: { in: ['IN_PROGRESS', 'PLANNING'] } }
  });

  const recentActivity = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, avatar: true } } },
  });

  const lowStockItems = await prisma.stockItem.findMany({
    where: { status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
    take: 5,
    orderBy: { quantity: 'asc' },
    include: { section: true },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Stock Management System.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 200, 83, 0.1)', color: 'var(--success)' }}>
            <Package size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Stock Items</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalItems}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 145, 0, 0.1)', color: 'var(--warning)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Low Stock Items</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{lowStock}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.1)', color: 'var(--danger)' }}>
            <XCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Out of Stock</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{outOfStock}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 235, 59, 0.1)', color: '#FBC02D' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Inventory Value</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(totalStockValue, 'USD')}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(124, 77, 255, 0.1)', color: '#7C4DFF' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pending Orders</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{pendingPOs}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 230, 118, 0.1)', color: '#00E676' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Projects</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{activeProjects}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 176, 255, 0.1)', color: 'var(--secondary)' }}>
            <Layers size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Sections</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{sectionsCount}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Low Stock Alerts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Attention Needed
          </h2>
          {lowStockItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>All stock levels are adequate.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lowStockItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <Link href={`/dashboard/items/${item.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {item.name}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.section.name} • {item.itemCode}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: item.status === 'OUT_OF_STOCK' ? 'var(--danger)' : 'var(--warning)' }}>
                      {item.quantity} left
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Min: {item.minStockLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivity.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, flexShrink: 0, fontSize: '0.8rem' }}>
                    {log.user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600 }}>{log.user.name}</span> {log.action} <span style={{ color: 'var(--text-secondary)' }}>{log.entity}</span>
                    </div>
                    {log.details && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {log.details}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
