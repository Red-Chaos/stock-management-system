'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';

export default function NewSupplierModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', contactPerson: '', email: '', phone: '', address: '', 
    city: '', country: '', website: '', paymentTerms: '', leadTimeDays: '', rating: '0', notes: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', city: '', country: '', website: '', paymentTerms: '', leadTimeDays: '', rating: '0', notes: '' });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create supplier');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        <Plus size={18} /> Add Supplier
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Add New Supplier</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Company Name *</label>
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
                <label>Website</label>
                <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="e.g. www.supplier.com" />
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
              <div>
                <label>Payment Terms</label>
                <input type="text" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} placeholder="e.g. Net 30" />
              </div>
              <div>
                <label>Lead Time (Days)</label>
                <input type="number" min="0" value={formData.leadTimeDays} onChange={e => setFormData({...formData, leadTimeDays: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Rating (1-5)</label>
                <select value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                  <option value="0">Not Rated</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
