'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, X, Loader2, Trash2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';

export default function EditProjectModal({ project, clients }: { project: any, clients: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: project.name || '', 
    clientId: project.clientId || '', 
    status: project.status || 'PLANNING', 
    description: project.description || '', 
    labType: project.labType || '', 
    location: project.location || '', 
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '', 
    expectedEndDate: project.expectedEndDate ? new Date(project.expectedEndDate).toISOString().split('T')[0] : '', 
    budget: project.budget || '', 
    currency: project.currency || 'USD', 
    notes: project.notes || '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update project');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project: ${project.name}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Edit Project</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Project Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label>Client</label>
                <select value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                  <option value="">Select Client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label>Lab Type</label>
                <input type="text" value={formData.labType} onChange={e => setFormData({...formData, labType: e.target.value})} />
              </div>
              <div>
                <label>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label>Start Date</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label>Expected End Date</label>
                <input type="date" value={formData.expectedEndDate} onChange={e => setFormData({...formData, expectedEndDate: e.target.value})} />
              </div>
              <div>
                <label>Budget</label>
                <input type="number" step="0.01" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
              </div>
              <div>
                <label>Currency</label>
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                  {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={handleDelete} className="btn btn-danger" disabled={loading}>
                  <Trash2 size={16} /> Delete
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
