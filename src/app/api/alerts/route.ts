import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Step 1: Automated Low Stock Check
    // We check all items where quantity <= minStockLevel and no active alert exists
    const lowStockItems = await prisma.stockItem.findMany({
      where: {
        quantity: { lte: prisma.stockItem.fields.minStockLevel },
        alerts: {
          none: {
            status: 'ACTIVE',
            type: 'LOW_STOCK'
          }
        }
      }
    });

    if (lowStockItems.length > 0) {
      await prisma.stockAlert.createMany({
        data: lowStockItems.map(item => ({
          stockItemId: item.id,
          type: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          message: `${item.name} is ${item.quantity === 0 ? 'out of stock' : 'running low'} (${item.quantity} remaining)`,
        }))
      });
    }

    // Step 2: Fetch all ACTIVE alerts
    const alerts = await prisma.stockAlert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        stockItem: {
          select: { name: true, itemCode: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alerts API Error:', error);
    return NextResponse.json({ error: 'Failed to process alerts' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { alertId, status } = await req.json();

    const alert = await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        status: status || 'ACKNOWLEDGED',
        acknowledgedById: session.user.id,
        acknowledgedAt: new Date()
      }
    });

    return NextResponse.json(alert);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
