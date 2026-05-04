import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const updateData: any = { ...data };
    if (updateData.leadTimeDays !== undefined) updateData.leadTimeDays = updateData.leadTimeDays ? parseInt(updateData.leadTimeDays) : null;
    if (updateData.rating !== undefined) updateData.rating = updateData.rating ? parseInt(updateData.rating) : 0;
    
    // id should not be updated
    delete updateData.id;

    const supplier = await prisma.supplier.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'Supplier', supplier.id, `Updated supplier: ${supplier.name}`);

    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supplier = await prisma.supplier.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(session.user.id, 'DELETED', 'Supplier', supplier.id, `Deleted supplier: ${supplier.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
