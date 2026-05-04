'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Edit, User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive?: boolean;
  permissions?: {
    canDeleteSections: boolean;
    canDeleteCategories: boolean;
    canDeleteItems: boolean;
    canEditSensitiveItemFields: boolean;
  };
}

export default function EditUserModal({ 
  user, 
  buttonStyle = 'icon' // 'icon' | 'full'
}: { 
  user: UserData;
  buttonStyle?: 'icon' | 'full';
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isSelf = session?.user?.id === user.id;

  const defaultPerms = {
    canDeleteSections: false,
    canDeleteCategories: false,
    canDeleteItems: false,
    canEditSensitiveItemFields: false,
  };

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive ?? true,
    currentPassword: '',
    newPassword: '',
    permissions: user.permissions || defaultPerms
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: isAdmin ? formData.email : undefined,
          role: isAdmin ? formData.role : undefined,
          isActive: isAdmin ? formData.isActive : undefined,
          permissions: isAdmin ? formData.permissions : undefined,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        })
      });
      
      if (res.ok) {
        setIsOpen(false);
        setFormData({ ...formData, currentPassword: '', newPassword: '' });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePermChange = (key: keyof typeof defaultPerms) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  return (
    <>
      {buttonStyle === 'icon' ? (
        <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
          <Edit size={18} />
        </button>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', width: '100%' }}>
          <UserIcon size={18} />
          <span>Edit Profile</span>
        </button>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {isSelf ? 'Edit My Profile' : `Edit User: ${user.name}`}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              {isAdmin ? (
                <>
                  <div>
                    <label>Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label>Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <input 
                      type="checkbox" 
                      id={`isActive-${user.id}`}
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor={`isActive-${user.id}`} style={{ margin: 0 }}>Account Active</label>
                  </div>

                  {formData.role === 'EMPLOYEE' && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--secondary)' }}>Granular Permissions</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={formData.permissions.canDeleteSections} onChange={() => handlePermChange('canDeleteSections')} style={{ width: 'auto' }} />
                          Can Delete Sections
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={formData.permissions.canDeleteCategories} onChange={() => handlePermChange('canDeleteCategories')} style={{ width: 'auto' }} />
                          Can Delete Categories & Sub-Categories
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={formData.permissions.canDeleteItems} onChange={() => handlePermChange('canDeleteItems')} style={{ width: 'auto' }} />
                          Can Delete Stock Items
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={formData.permissions.canEditSensitiveItemFields} onChange={() => handlePermChange('canEditSensitiveItemFields')} style={{ width: 'auto' }} />
                          Can Edit Sensitive Item Data (Price/Manual Quantity)
                        </label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label>Email (Contact Admin to change)</label>
                  <input type="email" disabled value={formData.email} />
                </div>
              )}

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Change Password</h3>
                {isSelf && !isAdmin && (
                  <div style={{ marginBottom: '12px' }}>
                    <label>Current Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="password" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} placeholder="Required to change password" />
                  </div>
                )}
                <div>
                  <label>New Password</label>
                  <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} placeholder="Leave blank to keep current" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
