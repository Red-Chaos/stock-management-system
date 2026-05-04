import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Briefcase, Calendar, MapPin, Building, DollarSign } from 'lucide-react';
import NewProjectModal from './NewProjectModal';
import EditProjectModal from './EditProjectModal';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      _count: { select: { items: true, quotations: true } }
    }
  });

  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Lab Build Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage laboratory construction and setup projects</p>
        </div>
        <NewProjectModal clients={clients} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {projects.map(project => (
          <div key={project.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 188, 212, 0.1)', color: '#00BCD4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{project.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{project.projectCode}</div>
                </div>
              </div>
              <EditProjectModal project={project} clients={clients} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {project.client && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Building size={14} /> {project.client.name}</div>}
              {project.labType && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Briefcase size={14} /> Type: {project.labType}</div>}
              {project.location && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={14} /> {project.location}</div>}
              {project.budget !== null && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><DollarSign size={14} /> {project.currency} {project.budget?.toFixed(2)}</div>}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{project._count.items}</strong> Items
              </div>
              <span style={{
                marginLeft: 'auto', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: project.status === 'COMPLETED' ? 'rgba(0, 200, 83, 0.1)' : project.status === 'IN_PROGRESS' ? 'rgba(0, 176, 255, 0.1)' : 'rgba(255, 145, 0, 0.1)',
                color: project.status === 'COMPLETED' ? 'var(--success)' : project.status === 'IN_PROGRESS' ? 'var(--secondary)' : 'var(--warning)'
              }}>
                {project.status.replace('_', ' ')}
              </span>
              <Link href={`/dashboard/projects/${project.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                View Project
              </Link>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-panel">
            <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No projects found</h3>
            <p style={{ marginTop: '8px' }}>Create your first lab build project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
