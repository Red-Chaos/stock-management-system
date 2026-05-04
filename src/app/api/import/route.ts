import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as 'merge' | 'overwrite';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileContent = await file.text();
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    if (!data.sections || !data.items) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    // WARNING: This is a simplified import logic. 
    // In production, you'd want massive validation and safe id mapping.
    
    await prisma.$transaction(async (tx) => {
      if (mode === 'overwrite') {
        // Warning: Cascade deletes will wipe out related transactions, images, parts, etc.
        await tx.stockItem.deleteMany({});
        // In a true overwrite, we might also overwrite sections/categories, 
        // but for safety in this demo, we'll assume we only overwrite items.
      }

      // Re-insert or upsert items
      for (const item of data.items) {
        // Simplified upsert logic. Assuming section/categories exist.
        // In reality, we need to map old IDs to new IDs if sections were wiped.
        await tx.stockItem.upsert({
          where: { itemCode: item.itemCode },
          update: {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            priceCurrency: item.priceCurrency,
            status: item.status,
            // ... update other fields as needed
          },
          create: {
            id: item.id,
            name: item.name,
            itemCode: item.itemCode,
            sectionId: item.sectionId,
            categoryId: item.categoryId,
            subCategoryId: item.subCategoryId,
            quantity: item.quantity,
            price: item.price,
            priceCurrency: item.priceCurrency,
            status: item.status,
            // ... add other fields
          }
        });
      }

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'IMPORTED',
          entity: 'Inventory',
          details: `Imported backup file using ${mode} mode.`
        }
      });
    }, {
      maxWait: 10000,
      timeout: 20000
    });

    return NextResponse.json({ 
      message: 'Import completed successfully',
      stats: { items: data.items.length, sections: data.sections.length }
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
