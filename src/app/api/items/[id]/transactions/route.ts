import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/lib/log';
import { getStockStatus } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const quantity = parseInt(data.quantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Use a transaction to ensure stock item and log update together safely
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.stockItem.findUnique({ where: { id: resolvedParams.id } });
      if (!item) throw new Error('Item not found');

      let newQuantity = item.quantity;
      if (data.type === 'INCOMING') {
        newQuantity += quantity;
      } else if (data.type === 'OUTGOING') {
        if (newQuantity < quantity) throw new Error('Insufficient stock for outgoing transaction');
        newQuantity -= quantity;
      } else {
        throw new Error('Invalid transaction type');
      }

      const newStatus = getStockStatus(newQuantity, item.minStockLevel);

      const updatedItem = await tx.stockItem.update({
        where: { id: item.id },
        data: {
          quantity: newQuantity,
          status: newStatus
        }
      });

      const transaction = await tx.stockTransaction.create({
        data: {
          stockItemId: item.id,
          type: data.type,
          quantity: quantity,
          reason: data.reason,
          performedById: session.user.id
        }
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'STOCK_UPDATE',
          entity: 'StockItem',
          entityId: item.id,
          details: `Recorded ${data.type} transaction for ${quantity} units. Reason: ${data.reason}. New total: ${newQuantity}`
        }
      });

      return { updatedItem, transaction };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record transaction' }, { status: 500 });
  }
}
