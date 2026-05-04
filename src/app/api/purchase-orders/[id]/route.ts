import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await req.json();
    
    const updateData: any = {
      status: data.status,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      receivedDate: data.status === 'RECEIVED' && !data.receivedDate ? new Date() : (data.receivedDate ? new Date(data.receivedDate) : null),
      shippingMethod: data.shippingMethod,
      trackingNumber: data.trackingNumber,
      notes: data.notes
    };

    const po = await prisma.purchaseOrder.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'PurchaseOrder', po.id, `Updated PO status to ${po.status}: ${po.orderNumber}`);

    return NextResponse.json(po);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete POs' }, { status: 403 });
    }

    const po = await prisma.purchaseOrder.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(session.user.id, 'DELETED', 'PurchaseOrder', po.id, `Deleted Purchase Order: ${po.orderNumber}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 });
  }
}
