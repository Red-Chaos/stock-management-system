'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES, LOGISTICS_COMPANIES, SUPPORTED_CURRENCIES, PLUG_TYPES } from '@/lib/utils';
import { ArrowLeft, Save, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [sections, setSections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]); // For parts linking
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    name: '',
    sectionId: '',
    categoryId: '',
    subCategoryId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    price: 0,
    priceCurrency: 'USD',
    quantity: 0,
    minStockLevel: 5,
    location: '',
    supplierId: '',
    warehouseId: '',
    countryOfOrigin: '',
    logisticsCompany: '',
    trackingNumber: '',
    description: '',
    sectionSpecificFields: {},
    parts: []
  });

  const [conversions, setConversions] = useState<Record<string, number> | null>(null);
  const [calculatingCurrency, setCalculatingCurrency] = useState(false);

  useEffect(() => {
    fetch('/api/sections').then(res => res.json()).then(setSections);
    fetch('/api/items').then(res => res.json()).then(setItems);
    fetch('/api/suppliers').then(res => res.json()).then(setSuppliers);
    fetch('/api/warehouses').then(res => res.json()).then(setWarehouses);

    // Fetch existing item data
    const fetchItem = async () => {
      const res = await fetch(`/api/items`);
      const allItems = await res.json();
      const item = allItems.find((i: any) => i.id === resolvedParams.id);
      
      if (item) {
        setFormData({
          name: item.name || '',
          sectionId: item.sectionId || '',
          categoryId: item.categoryId || '',
          subCategoryId: item.subCategoryId || '',
          manufacturer: item.manufacturer || '',
          model: item.model || '',
          serialNumber: item.serialNumber || '',
          price: item.price || 0,
          priceCurrency: item.priceCurrency || 'USD',
          quantity: item.quantity || 0,
          minStockLevel: item.minStockLevel || 5,
          location: item.location || '',
          supplierId: item.supplierId || '',
          warehouseId: item.warehouseId || '',
          countryOfOrigin: item.countryOfOrigin || '',
          logisticsCompany: item.logisticsCompany || '',
          trackingNumber: item.trackingNumber || '',
          description: item.description || '',
          sectionSpecificFields: item.sectionSpecificFields || {},
          imageUrl: item.images?.[0]?.url || '',
          parts: item.parts || []
        });
      }
    };
    fetchItem();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (formData.price > 0 && formData.priceCurrency) {
      const fetchCurrency = async () => {
        setCalculatingCurrency(true);
        try {
          const res = await fetch(`/api/currency?base=${formData.priceCurrency}&amount=${formData.price}`);
          const data = await res.json();
          if (data.conversions) setConversions(data.conversions);
        } finally {
          setCalculatingCurrency(false);
        }
      };
      const timeout = setTimeout(fetchCurrency, 500); // debounce
      return () => clearTimeout(timeout);
    } else {
      setConversions(null);
    }
  }, [formData.price, formData.priceCurrency]);

  const activeSection = sections.find(s => s.id === formData.sectionId);
  const activeCategory = activeSection?.categories.find((c: any) => c.id === formData.categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const item = await res.json();
        router.push(`/dashboard/items/${item.id}`);
        router.refresh();
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateSpecificField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      sectionSpecificFields: {
        ...prev.sectionSpecificFields,
        [key]: value
      }
    }));
  };

  const addPart = () => {
    setFormData((prev: any) => ({
      ...prev,
      parts: [...prev.parts, { partName: '', partItemId: '', isRequired: true }]
    }));
  };

  const renderSectionSpecificFields = () => {
    if (!activeSection) return null;
    const slug = activeSection.slug;

    if (slug === 'physics') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label>Equipment Type</label>
            <input type="text" value={formData.sectionSpecificFields.equipmentType || ''} onChange={e => updateSpecificField('equipmentType', e.target.value)} />
          </div>
          <div>
            <label>Plug Type</label>
            <select value={formData.sectionSpecificFields.plugType || ''} onChange={e => updateSpecificField('plugType', e.target.value)}>
              <option value="">Select Plug...</option>
              {PLUG_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label>Power Requirements</label>
            <input type="text" placeholder="e.g. 220V 50Hz" value={formData.sectionSpecificFields.powerRequirements || ''} onChange={e => updateSpecificField('powerRequirements', e.target.value)} />
          </div>
          <div>
            <label>Measurement Range</label>
            <input type="text" value={formData.sectionSpecificFields.measurementRange || ''} onChange={e => updateSpecificField('measurementRange', e.target.value)} />
          </div>
        </div>
      );
    }
    
    if (slug === 'chemistry') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label>CAS Number</label>
            <input type="text" value={formData.sectionSpecificFields.casNumber || ''} onChange={e => updateSpecificField('casNumber', e.target.value)} />
          </div>
          <div>
            <label>Physical State</label>
            <select value={formData.sectionSpecificFields.physicalState || ''} onChange={e => updateSpecificField('physicalState', e.target.value)}>
              <option value="">Select...</option>
              <option value="Solid">Solid</option>
              <option value="Liquid">Liquid</option>
              <option value="Gas">Gas</option>
            </select>
          </div>
          <div>
            <label>Dilution Status</label>
            <select value={formData.sectionSpecificFields.dilutionStatus || ''} onChange={e => updateSpecificField('dilutionStatus', e.target.value)}>
              <option value="">Select...</option>
              <option value="Pure">Pure</option>
              <option value="Diluted">Diluted</option>
            </select>
          </div>
          {formData.sectionSpecificFields.dilutionStatus === 'Diluted' && (
            <div>
              <label>Dilution Percentage (%)</label>
              <input type="number" value={formData.sectionSpecificFields.dilutionPercentage || ''} onChange={e => updateSpecificField('dilutionPercentage', parseFloat(e.target.value))} />
            </div>
          )}
        </div>
      );
    }

    if (slug === 'medical') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label>Warranty Expiry Date</label>
            <input type="date" value={formData.sectionSpecificFields.warrantyExpiry || ''} onChange={e => updateSpecificField('warrantyExpiry', e.target.value)} />
          </div>
          <div>
            <label>Calibration Due Date</label>
            <input type="date" value={formData.sectionSpecificFields.calibrationDue || ''} onChange={e => updateSpecificField('calibrationDue', e.target.value)} />
          </div>
          <div>
            <label>Last Calibration Date</label>
            <input type="date" value={formData.sectionSpecificFields.lastCalibration || ''} onChange={e => updateSpecificField('lastCalibration', e.target.value)} />
          </div>
          <div>
            <label>Maintenance Interval (Days)</label>
            <input type="number" value={formData.sectionSpecificFields.maintenanceInterval || ''} onChange={e => updateSpecificField('maintenanceInterval', parseInt(e.target.value))} />
          </div>
          <div>
            <label>Regulatory ID</label>
            <input type="text" value={formData.sectionSpecificFields.regulatoryId || ''} onChange={e => updateSpecificField('regulatoryId', e.target.value)} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/items" className="btn btn-secondary" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Edit Item</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update stock item details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step 1: Classification */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Classification</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label>Section *</label>
              <select required value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value, categoryId: '', subCategoryId: '', sectionSpecificFields: {}})}>
                <option value="">Select Section...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Category *</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, subCategoryId: ''})} disabled={!formData.sectionId}>
                <option value="">Select Category...</option>
                {activeSection?.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label>Sub-Category</label>
              <select value={formData.subCategoryId} onChange={e => setFormData({...formData, subCategoryId: e.target.value})} disabled={!formData.categoryId || activeCategory?.subCategories?.length === 0}>
                <option value="">Select Sub-Category...</option>
                {activeCategory?.subCategories?.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Basic Info */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label>Item Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label>Image URL</label>
              <input type="url" placeholder="https://example.com/image.jpg" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Manufacturer / Company</label>
                <input type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
              </div>
              <div>
                <label>Model Number</label>
                <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Pricing & Inventory */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Pricing & Inventory</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label>Currency</label>
              <select value={formData.priceCurrency} onChange={e => setFormData({...formData, priceCurrency: e.target.value})}>
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Price</label>
              <input type="number" step="0.01" min="0" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label>Quantity</label>
              <input type="number" min="0" required value={formData.quantity} disabled title="Quantity can only be changed via transactions" />
            </div>
            <div>
              <label>Min Stock Level</label>
              <input type="number" min="0" required value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* Currency Conversions Preview */}
          {conversions && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                {calculatingCurrency ? <RefreshCw size={14} className="animate-spin" /> : null}
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Live Currency Conversions</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {Object.entries(conversions).map(([curr, val]) => (
                  <div key={curr} style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{curr}</span>
                    <span style={{ fontWeight: 600 }}>{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Origin, Storage & Logistics */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Origin, Storage & Logistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label>Warehouse</label>
              <select value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})}>
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label>Shelf / Bin Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. A-12" />
            </div>
            <div>
              <label>Supplier</label>
              <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                <option value="">Select Supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Country of Origin</label>
              <select value={formData.countryOfOrigin} onChange={e => setFormData({...formData, countryOfOrigin: e.target.value})}>
                <option value="">Select Country...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Logistics Company (Optional)</label>
              <select value={formData.logisticsCompany} onChange={e => setFormData({...formData, logisticsCompany: e.target.value})}>
                <option value="">Select Company...</option>
                {LOGISTICS_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Tracking Number (Optional)</label>
              <input type="text" value={formData.trackingNumber} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Step 5: Section Specific Fields */}
        {activeSection && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: activeSection.color }}>
              {activeSection.name} Details
            </h2>
            {renderSectionSpecificFields()}

            {/* Parts specific to Physics */}
            {activeSection.slug === 'physics' && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Required Parts</h3>
                  <button type="button" onClick={addPart} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+ Add Part</button>
                </div>
                {formData.parts.map((part: any, index: number) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label>Part Name</label>
                      <input type="text" value={part.partName} onChange={e => {
                        const newParts = [...formData.parts];
                        newParts[index].partName = e.target.value;
                        setFormData({...formData, parts: newParts});
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Link to Stock Item (Optional)</label>
                      <select value={part.partItemId} onChange={e => {
                        const newParts = [...formData.parts];
                        newParts[index].partItemId = e.target.value;
                        setFormData({...formData, parts: newParts});
                      }}>
                        <option value="">None</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
