import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';


export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        categories: {
          include: { subCategories: true }
        }
      }
    });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const section = await prisma.section.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || 'box',
        color: data.color || '#00B0FF',
        description: data.description,
      }
    });

    await logActivity(session.user.id, 'CREATED', 'Section', section.id, `Created section: ${section.name}`);

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
