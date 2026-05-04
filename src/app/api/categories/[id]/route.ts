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
    
    if (user.role !== 'ADMIN' && !user.permissions?.canDeleteCategories) {
      return NextResponse.json({ error: 'Forbidden: You lack permission to delete categories' }, { status: 403 });
    }

    const category = await prisma.category.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(user.id, 'DELETED', 'Category', category.id, `Deleted category: ${category.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
