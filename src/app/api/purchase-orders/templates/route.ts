import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const templates = await prisma.orderTemplate.findMany({
      include: { items: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, supplierId, items, currency, description } = await req.json();

    const template = await prisma.orderTemplate.create({
      data: {
        name,
        supplierId,
        description,
        currency: currency || 'USD',
        items: {
          create: items.map((item: any) => ({
            stockItemId: item.stockItemId || null,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
