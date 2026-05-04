import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft, Folder, Package, Plus } from 'lucide-react';
import NewCategoryModal from './NewCategoryModal';
import NewSubCategoryModal from './NewSubCategoryModal';
import { DeleteCategoryButton, DeleteSubCategoryButton } from '@/components/DeleteButtons';

export default async function SectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const section = await prisma.section.findUnique({
    where: { id: resolvedParams.id },
    include: {
      categories: {
        include: {
          subCategories: true,
          _count: { select: { items: true } }
        },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!section) notFound();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/sections" className="btn btn-secondary" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              background: `${section.color}20`, color: section.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Layers size={18} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{section.name}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{section.description}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Categories & Sub-categories</h2>
          <NewCategoryModal sectionId={section.id} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {section.categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No categories found.</p>
          ) : (
            section.categories.map(category => (
              <div key={category.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${section.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Folder size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{category.name}</h3>
                    <DeleteCategoryButton id={category.id} name={category.name} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '16px' }}>
                    <Package size={14} />
                    {category._count.items} Items
                  </div>
                </div>
                
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '32px', alignItems: 'center' }}>
                  {category.subCategories.length > 0 && category.subCategories.map(sub => (
                    <span key={sub.id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 8px 4px 12px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sub.name}
                      <DeleteSubCategoryButton id={sub.id} name={sub.name} />
                    </span>
                  ))}
                  <NewSubCategoryModal categoryId={category.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
