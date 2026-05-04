import { prisma } from '@/lib/prisma';
import { Download, Upload, AlertCircle, FileJson, FileSpreadsheet } from 'lucide-react';
import ImportForm from './ImportForm';

export default async function ExportImportPage() {
  const sections = await prisma.section.findMany();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Export & Import</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your entire inventory database</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="md:grid-cols-1">
        
        {/* Export Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(0,176,255,0.1)', color: 'var(--secondary)', borderRadius: '12px' }}>
              <Download size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Export Data</h2>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Download a full backup of your inventory, including all sections, categories, and stock items.
          </p>

          <form action="/api/export" method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label>Format</label>
              <select name="format" defaultValue="json">
                <option value="json">JSON</option>
                <option value="csv">CSV (Items Only)</option>
              </select>
            </div>
            <div>
              <label>Filter Section (Optional)</label>
              <select name="sectionId">
                <option value="">All Sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <FileJson size={18} /> Export Now
            </button>
          </form>
        </div>

        {/* Import Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,145,0,0.1)', color: 'var(--warning)', borderRadius: '12px' }}>
              <Upload size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Import Data</h2>
          </div>
          
          <div style={{ background: 'rgba(255,145,0,0.1)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Overwriting will permanently delete existing data before import. Merge will only add missing items.</span>
          </div>

          <ImportForm />
        </div>

      </div>
    </div>
  );
}
