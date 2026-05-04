import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    const updateData: any = {
      name: data.name,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: data.serialNumber,
      price: data.price ? parseFloat(data.price) : 0,
      priceCurrency: data.priceCurrency,
      minStockLevel: data.minStockLevel ? parseInt(data.minStockLevel) : 5,
      location: data.location,
      supplierId: data.supplierId || null,
      warehouseId: data.warehouseId || null,
      countryOfOrigin: data.countryOfOrigin,
      logisticsCompany: data.logisticsCompany,
      trackingNumber: data.trackingNumber,
      description: data.description,
      sectionSpecificFields: data.sectionSpecificFields,
    };

    if (data.imageUrl) {
      updateData.images = {
        deleteMany: {},
        create: { url: data.imageUrl }
      };
    }

    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);
    if (data.calibrationDate) updateData.calibrationDate = new Date(data.calibrationDate);
    if (data.nextCalibrationDue) updateData.nextCalibrationDue = new Date(data.nextCalibrationDue);

    const item = await prisma.stockItem.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    await logActivity(session.user.id, 'UPDATED', 'StockItem', item.id, `Updated item: ${item.name} (${item.itemCode})`);

    return NextResponse.json(item);
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (user.role !== 'ADMIN' && !user.permissions?.canDeleteItems) {
      return NextResponse.json({ error: 'Forbidden: You lack permission to delete items' }, { status: 403 });
    }

    const item = await prisma.stockItem.delete({
      where: { id: resolvedParams.id }
    });

    await logActivity(user.id, 'DELETED', 'StockItem', item.id, `Deleted item: ${item.name} (${item.itemCode})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
