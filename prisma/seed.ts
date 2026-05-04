import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('asdfqwer', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'sentronasia@yahoo.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'sentronasia@yahoo.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sections
  const sections = [
    {
      name: 'Physics',
      slug: 'physics',
      icon: 'atom',
      color: '#7C4DFF',
      description: 'Physics laboratory equipment, instruments, and supplies',
      categories: [
        { name: 'Electronics', subs: ['Multimeters', 'Oscilloscopes', 'Power Supplies', 'Circuit Components'] },
        { name: 'Optics', subs: ['Lenses', 'Mirrors', 'Prisms', 'Laser Equipment', 'Spectrometers'] },
        { name: 'Mechanics', subs: ['Force Gauges', 'Pulleys & Levers', 'Motion Sensors', 'Springs & Weights'] },
        { name: 'Thermodynamics', subs: ['Calorimeters', 'Thermometers', 'Heat Exchangers', 'Thermal Conductors'] },
        { name: 'Electromagnetism', subs: ['Magnets', 'Coils', 'Galvanometers', 'Transformers'] },
        { name: 'Nuclear & Radiation', subs: ['Geiger Counters', 'Radioactive Sources', 'Shielding Materials'] },
        { name: 'General Lab Equipment', subs: ['Stands & Clamps', 'Cables & Connectors', 'Safety Equipment'] },
      ],
    },
    {
      name: 'Chemistry',
      slug: 'chemistry',
      icon: 'flask-conical',
      color: '#00C853',
      description: 'Chemical reagents, glassware, and laboratory apparatus',
      categories: [
        { name: 'Reagents & Chemicals', subs: ['Acids', 'Bases', 'Salts', 'Organic Solvents', 'Indicators'] },
        { name: 'Glassware', subs: ['Beakers', 'Flasks', 'Burettes', 'Pipettes', 'Test Tubes', 'Condensers'] },
        { name: 'Safety Equipment', subs: ['Fume Hoods', 'Safety Goggles', 'Gloves', 'Fire Extinguishers', 'Spill Kits'] },
        { name: 'Analytical Instruments', subs: ['pH Meters', 'Spectrophotometers', 'Chromatography', 'Balances'] },
        { name: 'Heating & Cooling', subs: ['Bunsen Burners', 'Hot Plates', 'Water Baths', 'Refrigerators'] },
        { name: 'Consumables', subs: ['Filter Paper', 'Litmus Paper', 'Rubber Tubing', 'Stoppers'] },
      ],
    },
    {
      name: 'Botany',
      slug: 'botany',
      icon: 'leaf',
      color: '#00E676',
      description: 'Plant specimens, cultivation equipment, and botanical supplies',
      categories: [
        { name: 'Plant Specimens', subs: ['Live Plants', 'Dried Specimens', 'Seeds', 'Tissue Cultures'] },
        { name: 'Growth Equipment', subs: ['Grow Lights', 'Growth Chambers', 'Irrigation Systems', 'Pots & Trays'] },
        { name: 'Microscopy', subs: ['Compound Microscopes', 'Dissecting Microscopes', 'Slides & Coverslips', 'Stains'] },
        { name: 'Soil & Media', subs: ['Soil Types', 'Agar Media', 'Hydroponic Solutions', 'Fertilizers'] },
        { name: 'Preservation', subs: ['Herbarium Supplies', 'Pressing Equipment', 'Preservation Chemicals'] },
        { name: 'Field Equipment', subs: ['Sampling Tools', 'GPS Devices', 'Collection Bags', 'Field Guides'] },
      ],
    },
    {
      name: 'Medical',
      slug: 'medical',
      icon: 'heart-pulse',
      color: '#FF1744',
      description: 'Medical equipment, diagnostic instruments, and healthcare supplies',
      categories: [
        { name: 'Diagnostic Equipment', subs: ['Stethoscopes', 'Blood Pressure Monitors', 'Thermometers', 'Otoscopes'] },
        { name: 'Surgical Instruments', subs: ['Scalpels', 'Forceps', 'Scissors', 'Retractors', 'Suture Kits'] },
        { name: 'Laboratory Diagnostics', subs: ['Centrifuges', 'Analyzers', 'Microscopes', 'Reagent Kits'] },
        { name: 'Patient Care', subs: ['Beds & Stretchers', 'Wheelchairs', 'Monitors', 'Infusion Pumps'] },
        { name: 'Consumables', subs: ['Syringes', 'Gloves', 'Bandages', 'Gauze', 'Masks'] },
        { name: 'Imaging Equipment', subs: ['X-Ray Machines', 'Ultrasound', 'MRI Components', 'CT Scan Parts'] },
        { name: 'Pharmaceuticals', subs: ['Tablets', 'Injectables', 'Topicals', 'IV Fluids'] },
      ],
    },
  ];

  for (const sec of sections) {
    const section = await prisma.section.upsert({
      where: { slug: sec.slug },
      update: {},
      create: {
        name: sec.name,
        slug: sec.slug,
        icon: sec.icon,
        color: sec.color,
        description: sec.description,
      },
    });
    console.log(`✅ Section created: ${section.name}`);

    for (const cat of sec.categories) {
      const category = await prisma.category.upsert({
        where: { name_sectionId: { name: cat.name, sectionId: section.id } },
        update: {},
        create: {
          name: cat.name,
          sectionId: section.id,
        },
      });

      for (const subName of cat.subs) {
        await prisma.subCategory.upsert({
          where: { name_categoryId: { name: subName, categoryId: category.id } },
          update: {},
          create: {
            name: subName,
            categoryId: category.id,
          },
        });
      }
      console.log(`  📁 Category: ${cat.name} (${cat.subs.length} sub-categories)`);
    }
  }

  // Log the seed action
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      entity: 'System',
      details: 'Database seeded with initial data: admin user, 4 sections with categories and sub-categories',
    },
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin Login: sentronasia@yahoo.com');
  console.log('🔑 Admin Password: asdfqwer');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
