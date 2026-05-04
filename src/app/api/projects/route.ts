import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function GET(req: Request) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await req.json();
    
    // Generate project code if not provided
    let projectCode = data.projectCode;
    if (!projectCode) {
      const count = await prisma.project.count();
      projectCode = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        projectCode,
        clientId: data.clientId || null,
        status: data.status || 'PLANNING',
        description: data.description,
        labType: data.labType,
        location: data.location,
        startDate: data.startDate ? new Date(data.startDate) : null,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
        budget: data.budget ? parseFloat(data.budget) : 0,
        currency: data.currency || 'USD',
        notes: data.notes,
        createdById: session.user.id
      }
    });

    await logActivity(session.user.id, 'CREATED', 'Project', project.id, `Created project: ${project.name}`);

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
