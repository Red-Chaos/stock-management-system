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
    
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.expectedEndDate) updateData.expectedEndDate = new Date(updateData.expectedEndDate);
    if (updateData.actualEndDate) updateData.actualEndDate = new Date(updateData.actualEndDate);
    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);

    const project = await prisma.project.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'Project', project.id, `Updated project: ${project.name}`);

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete projects' }, { status: 403 });
    }

    const project = await prisma.project.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(session.user.id, 'DELETED', 'Project', project.id, `Deleted project: ${project.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
