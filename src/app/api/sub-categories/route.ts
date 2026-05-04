import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const subCategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
      }
    });

    await logActivity(session.user.id, 'CREATED', 'SubCategory', subCategory.id, `Created sub-category: ${subCategory.name}`);

    return NextResponse.json(subCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sub-category' }, { status: 500 });
  }
}
