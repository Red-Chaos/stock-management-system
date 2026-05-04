import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';
import { generateItemCode, getStockStatus } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const sectionId = searchParams.get('sectionId') || '';

    const items = await prisma.stockItem.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { itemCode: { contains: search, mode: 'insensitive' } },
              { manufacturer: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          sectionId ? { sectionId } : {}
        ]
      },
      include: {
        section: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    // Generate unique code based on section
    const section = await prisma.section.findUnique({ where: { id: data.sectionId } });
    if (!section) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    
    const itemCode = generateItemCode(section.slug);
    const status = getStockStatus(data.quantity || 0, data.minStockLevel || 5);

    const item = await prisma.stockItem.create({
      data: {
        name: data.name,
        itemCode,
        sectionId: data.sectionId,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        price: parseFloat(data.price) || 0,
        priceCurrency: data.priceCurrency || 'USD',
        quantity: parseInt(data.quantity) || 0,
        minStockLevel: parseInt(data.minStockLevel) || 5,
        location: data.location,
        supplierId: data.supplierId || null,
        countryOfOrigin: data.countryOfOrigin,
        logisticsCompany: data.logisticsCompany,
        trackingNumber: data.trackingNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        status,
        description: data.description,
        sectionSpecificFields: data.sectionSpecificFields || {},
      }
    });

    // If initial quantity > 0, log it as an incoming transaction
    if (item.quantity > 0) {
      await prisma.stockTransaction.create({
        data: {
          stockItemId: item.id,
          type: 'INCOMING',
          quantity: item.quantity,
          reason: 'Initial Stock Entry',
          performedById: session.user.id
        }
      });
    }

    // Handle parts if provided
    if (data.parts && Array.isArray(data.parts) && data.parts.length > 0) {
      await Promise.all(data.parts.map((p: any) => 
        prisma.itemPart.create({
          data: {
            stockItemId: item.id,
            partName: p.partName,
            partItemId: p.partItemId || null,
            isRequired: p.isRequired !== false
          }
        })
      ));
    }

    await logActivity(session.user.id, 'CREATED', 'StockItem', item.id, `Created item: ${item.name} (${item.itemCode})`);

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
