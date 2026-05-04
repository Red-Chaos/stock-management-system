import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, Users, MapPin, Package, CheckCircle2, Circle, Clock } from 'lucide-react';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      items: { include: { stockItem: true } },
      createdBy: { select: { name: true } }
    }
  }) as any;

  if (!project) notFound();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return '#2196F3';
      case 'IN_PROGRESS': return '#00C853';
      case 'ON_HOLD': return '#FFAB00';
      case 'COMPLETED': return '#7B1FA2';
      case 'CANCELLED': return '#D32F2F';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/projects" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{project.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{project.projectCode}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: getStatusColor(project.status) }}>{project.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }} className="md:grid-cols-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Project Info */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--primary)" /> Project Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Client</label>
                <div style={{ fontWeight: 600 }}>{project.client?.name || 'Internal Project'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{project.client?.organization}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lab Type</label>
                <div style={{ fontWeight: 600 }}>{project.labType || 'N/A'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location</label>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {project.location || 'N/A'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Budget</label>
                <div style={{ fontWeight: 600 }}>{project.currency} {project.budget?.toLocaleString() || '0'}</div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description</label>
              <p style={{ marginTop: '8px', fontSize: '0.95rem', lineHeight: 1.6 }}>{project.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Project Items / Equipment */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--primary)" /> Equipment & Supplies
              </h2>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>+ Assign Items</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Item</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Planned</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {project.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No items assigned to this project yet.</td>
                    </tr>
                  ) : (
                    project.items.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 500 }}>{item.itemName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.stockItem?.itemCode || 'Custom'}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{item.quantity}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: item.dispatchedQty >= item.quantity ? 'var(--success)' : 'var(--warning)' }}>
                            {item.dispatchedQty >= item.quantity ? 'Fully Dispatched' : `Dispatched: ${item.dispatchedQty}/${item.quantity}`}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }}>Update</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Timeline / Milestones */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--primary)" /> Timeline
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-25px', top: '0', background: 'var(--bg-card)', padding: '2px' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Created</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(project.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-25px', top: '0', background: 'var(--bg-card)', padding: '2px' }}>
                  {project.startDate ? <CheckCircle2 size={16} color="var(--success)" /> : <Circle size={16} color="var(--border)" />}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Start Date</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-25px', top: '0', background: 'var(--bg-card)', padding: '2px' }}>
                  {project.actualEndDate ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={16} color="var(--warning)" />}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Estimated Completion</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString() : 'TBD'}</div>
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="var(--primary)" /> Stakeholders
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                  {project.createdBy.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{project.createdBy.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
