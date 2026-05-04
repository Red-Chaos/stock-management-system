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
    const updateData: any = { ...data };
    delete updateData.id;

    const client = await prisma.client.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'Client', client.id, `Updated client: ${client.name}`);

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete clients' }, { status: 403 });
    }

    const client = await prisma.client.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(session.user.id, 'DELETED', 'Client', client.id, `Deleted client: ${client.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
