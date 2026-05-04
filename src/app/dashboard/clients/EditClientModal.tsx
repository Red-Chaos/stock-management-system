'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, X, Loader2, Trash2 } from 'lucide-react';

export default function EditClientModal({ client }: { client: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: client.name || '', 
    contactPerson: client.contactPerson || '', 
    email: client.email || '', 
    phone: client.phone || '', 
    address: client.address || '', 
    city: client.city || '', 
    country: client.country || '', 
    organization: client.organization || '', 
    organizationType: client.organizationType || '', 
    notes: client.notes || '',
    isActive: client.isActive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update client');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete client');
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
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Edit Client</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Client Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label>Contact Person</label>
                <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label>Organization</label>
                <input type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
              </div>
              <div>
                <label>Org Type</label>
                <select value={formData.organizationType} onChange={e => setFormData({...formData, organizationType: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="University">University</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Industry">Industry</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label>City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label>Country</label>
                <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                <input type="checkbox" id={`active-${client.id}`} checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: 'auto' }} />
                <label htmlFor={`active-${client.id}`} style={{ margin: 0 }}>Active Client</label>
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
