'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';

export default function NewSectionModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '#00B0FF', icon: 'box' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: '', slug: '', description: '', color: '#00B0FF', icon: 'box' });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create section');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="glass-panel hover-card" 
        style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          gap: '12px', padding: '24px', cursor: 'pointer', border: '2px dashed var(--border)', 
          background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)'
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={24} />
        </div>
        <span style={{ fontWeight: 600 }}>Add New Section</span>
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Create New Section</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Section Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: generateSlug(e.target.value)})} />
              </div>
              <div>
                <label>Slug</label>
                <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div>
                <label>Color Hex</label>
                <input type="color" required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ padding: '0', height: '42px', cursor: 'pointer' }} />
              </div>
              <div>
                <label>Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Section'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
