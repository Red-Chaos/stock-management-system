import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function GET(req: Request) {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, createdBy: true, items: true }
    });
    return NextResponse.json(pos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await req.json();
    
    // Generate PO number if not provided
    let orderNumber = data.orderNumber;
    if (!orderNumber) {
      const count = await prisma.purchaseOrder.count();
      orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        status: data.status || 'DRAFT',
        currency: data.currency || 'USD',
        subtotal: parseFloat(data.subtotal) || 0,
        shippingCost: parseFloat(data.shippingCost) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        shippingMethod: data.shippingMethod,
        notes: data.notes,
        createdById: session.user.id,
        items: {
          create: data.items.map((item: any) => ({
            stockItemId: item.stockItemId || null,
            itemName: item.itemName,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0
          }))
        }
      }
    });

    await logActivity(session.user.id, 'CREATED', 'PurchaseOrder', po.id, `Created Purchase Order: ${po.orderNumber}`);

    return NextResponse.json(po);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
