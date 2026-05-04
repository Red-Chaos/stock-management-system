import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Layers, ChevronRight, Package, Plus } from 'lucide-react';
import NewSectionModal from './NewSectionModal';
import { DeleteSectionButton } from '@/components/DeleteButtons';

export default async function SectionsPage() {
  const sections = await prisma.section.findMany({
    include: {
      _count: {
        select: { categories: true, items: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Sections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage departments and their categories</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {sections.map(section => (
          <Link 
            key={section.id} 
            href={`/dashboard/sections/${section.id}`}
            className="glass-panel hover-card"
            style={{ 
              padding: '24px', 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              borderTop: `4px solid ${section.color}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: `${section.color}20`, color: section.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Layers size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{section.name}</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{section.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DeleteSectionButton id={section.id} name={section.name} />
                <ChevronRight color="var(--text-muted)" />
              </div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>
              {section.description}
            </p>

            <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Layers size={16} />
                <span>{section._count.categories} Categories</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Package size={16} />
                <span>{section._count.items} Items</span>
              </div>
            </div>
          </Link>
        ))}
        <NewSectionModal />
      </div>
    </div>
  );
}
