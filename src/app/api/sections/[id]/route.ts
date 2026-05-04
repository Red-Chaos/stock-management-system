import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (user.role !== 'ADMIN' && !user.permissions?.canDeleteSections) {
      return NextResponse.json({ error: 'Forbidden: You lack permission to delete sections' }, { status: 403 });
    }

    const section = await prisma.section.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(user.id, 'DELETED', 'Section', section.id, `Deleted section: ${section.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
