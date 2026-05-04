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
    delete updateData.id;

    const warehouse = await prisma.warehouse.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'Warehouse', warehouse.id, `Updated warehouse: ${warehouse.name}`);

    return NextResponse.json(warehouse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const warehouse = await prisma.warehouse.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(session.user.id, 'DELETED', 'Warehouse', warehouse.id, `Deleted warehouse: ${warehouse.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 });
  }
}
