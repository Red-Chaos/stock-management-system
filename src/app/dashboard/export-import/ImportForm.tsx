'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'overwrite'>('merge');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult({ success: true, message: data.message, stats: data.stats });
        router.refresh();
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (err) {
      setResult({ success: false, message: 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value as any)}>
          <option value="merge">Merge (Add Missing / Update Existing)</option>
          <option value="overwrite">Overwrite (Delete All Existing Data First)</option>
        </select>
      </div>

      <div>
        <label>Select JSON File</label>
        <input 
          type="file" 
          accept=".json" 
          required 
          onChange={e => setFile(e.target.files?.[0] || null)}
          style={{ background: 'transparent', padding: '8px 0', border: 'none' }}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ marginTop: '8px' }}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        Start Import
      </button>

      {result && (
        <div style={{ 
          marginTop: '16px', padding: '12px', borderRadius: '8px', fontSize: '0.9rem',
          background: result.success ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)',
          color: result.success ? 'var(--success)' : 'var(--danger)'
        }}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
          {result.stats && (
            <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
              Items processed: {result.stats.items}<br/>
              Sections processed: {result.stats.sections}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
