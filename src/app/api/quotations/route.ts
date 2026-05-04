import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quotations = await prisma.quotation.findMany({
      include: {
        client: true,
        createdBy: { select: { name: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId, currency, validUntil, discount, tax, subtotal, totalAmount, notes, items, projectId } = await req.json();

    const count = await prisma.quotation.count();
    const quotationNumber = `QTN-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        clientId,
        projectId,
        currency: currency || 'USD',
        validUntil: validUntil ? new Date(validUntil) : null,
        discount: discount || 0,
        tax: tax || 0,
        subtotal: subtotal || 0,
        totalAmount: totalAmount || 0,
        notes,
        createdById: session.user.id,
        items: {
          create: items.map((item: any) => ({
            stockItemId: item.stockItemId || null,
            itemName: item.itemName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { items: true, client: true }
    });

    await logActivity(session.user.id, 'CREATE', 'Quotation', quotation.id, `Created quotation ${quotationNumber} for ${quotation.client.name}`);

    return NextResponse.json(quotation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}
