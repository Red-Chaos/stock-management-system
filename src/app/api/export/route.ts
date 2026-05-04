import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const sectionId = searchParams.get('sectionId');

    const whereClause = sectionId ? { sectionId } : {};

    const items = await prisma.stockItem.findMany({
      where: whereClause,
      include: {
        section: true,
        category: true,
        subCategory: true,
      }
    });

    await logActivity(session.user.id, 'EXPORTED', 'Inventory', undefined, `Exported ${items.length} items to ${format.toUpperCase()}`);

    if (format === 'csv') {
      // Basic CSV generation
      const headers = ['ItemCode', 'Name', 'Section', 'Category', 'Quantity', 'Price', 'Currency', 'Status', 'Manufacturer'];
      const csvRows = [headers.join(',')];
      
      for (const item of items) {
        const row = [
          item.itemCode,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.section.name}"`,
          `"${item.category.name}"`,
          item.quantity,
          item.price,
          item.priceCurrency,
          item.status,
          `"${item.manufacturer || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="inventory-export.csv"'
        }
      });
    }

    // JSON Format (Full backup)
    const sections = await prisma.section.findMany({
      include: {
        categories: { include: { subCategories: true } }
      }
    });

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      sections,
      items
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="inventory-backup.json"'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
