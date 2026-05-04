'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DUMMY_SLUG = 'dummy-development-section';

export async function seedDummyStock() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only allowed in development mode.');
  }

  // Create a Dummy Section
  const section = await prisma.section.upsert({
    where: { slug: DUMMY_SLUG },
    update: {},
    create: {
      name: 'Dummy Development Section',
      slug: DUMMY_SLUG,
      icon: 'flask-conical',
      color: '#FF4081',
      description: 'Used for development testing. Do not use in production.',
    }
  });

  // Create a Dummy Category
  const category = await prisma.category.upsert({
    where: { name_sectionId: { name: 'Dummy Category', sectionId: section.id } },
    update: {},
    create: {
      name: 'Dummy Category',
      sectionId: section.id,
      description: 'Dummy category for testing items.',
    }
  });

  // Create some dummy items
  const dummyItems = Array.from({ length: 5 }).map((_, i) => ({
    name: `Dummy Test Equipment ${i + 1}`,
    itemCode: `DUMMY-EQ-${Date.now()}-${i}`,
    sectionId: section.id,
    categoryId: category.id,
    manufacturer: 'Test Labs Inc',
    model: `Model ${i + 1}`,
    price: Math.floor(Math.random() * 500) + 10,
    priceCurrency: 'USD',
    quantity: Math.floor(Math.random() * 50),
    minStockLevel: 5,
    location: `Shelf ${i + 1}`,
    status: (i === 0 ? 'LOW_STOCK' : i === 1 ? 'OUT_OF_STOCK' : 'ACTIVE') as 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK',
    description: 'This is a generated dummy item for development.',
  }));

  for (const item of dummyItems) {
    await prisma.stockItem.create({
      data: item
    });
  }

  revalidatePath('/dashboard/items');
}

export async function clearDummyStock() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only allowed in development mode.');
  }

  // Deleting the dummy section will cascade and delete dummy categories and items
  try {
    await prisma.section.delete({
      where: { slug: DUMMY_SLUG }
    });
  } catch (error) {
    console.error('Failed to clear dummy stock (may not exist)', error);
  }

  revalidatePath('/dashboard/items');
}
