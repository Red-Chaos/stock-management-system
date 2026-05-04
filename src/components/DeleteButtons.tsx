'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function DeleteSectionButton({ id, name }: { id: string; name: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the section link
    e.stopPropagation(); // Prevent Next.js router from catching the click
    
    if (!window.confirm(`Are you sure you want to delete the ${name} section?`)) return;
    if (!window.confirm(`WARNING: This will permanently delete ALL categories, sub-categories, and stock items within ${name}. This action CANNOT be undone. Are you absolutely sure?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete section');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (session?.user?.role !== 'ADMIN' && !(session?.user as any)?.permissions?.canDeleteSections) {
    return null;
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer',
        padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', transition: 'background 0.2s', zIndex: 10
      }}
      className="hover:bg-red-500/10"
      title="Delete Section"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}" and all its sub-categories?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete category');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (session?.user?.role !== 'ADMIN' && !(session?.user as any)?.permissions?.canDeleteCategories) {
    return null;
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
        padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px', transition: 'color 0.2s'
      }}
      className="hover:text-[var(--danger)]"
      title="Delete Category"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

export function DeleteSubCategoryButton({ id, name }: { id: string; name: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the sub-category "${name}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/sub-categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete sub-category');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (session?.user?.role !== 'ADMIN' && !(session?.user as any)?.permissions?.canDeleteCategories) {
    return null;
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
        padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginLeft: '4px'
      }}
      className="hover:text-[var(--danger)]"
      title="Delete Sub-category"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
    </button>
  );
}
