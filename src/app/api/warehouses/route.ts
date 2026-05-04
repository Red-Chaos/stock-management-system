import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function GET(req: Request) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity,
        manager: data.manager,
        phone: data.phone,
      }
    });

    await logActivity(session.user.id, 'CREATED', 'Warehouse', warehouse.id, `Created warehouse: ${warehouse.name}`);

    return NextResponse.json(warehouse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 });
  }
}
