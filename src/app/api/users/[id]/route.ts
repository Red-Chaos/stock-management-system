import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/log';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isSelf = session.user.id === resolvedParams.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const updateData: any = {};

    // Standard updates
    if (data.name) updateData.name = data.name;

    // Password Update Logic
    if (data.newPassword) {
      if (isSelf && !isAdmin) {
        // Self-updating password needs current password check
        if (!data.currentPassword) {
          return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
        }
        
        const user = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        const isValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isValid) return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
      }
      
      updateData.password = await bcrypt.hash(data.newPassword, 12);
    }

    // Admin Only Updates
    if (isAdmin) {
      if (data.email) {
        // Check for email conflicts
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== resolvedParams.id) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        updateData.email = data.email;
      }
      if (data.role) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.permissions) updateData.permissions = data.permissions;
    }

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
    });

    await logActivity(
      session.user.id, 
      'UPDATED', 
      'User', 
      updatedUser.id, 
      `Updated user profile for ${updatedUser.email}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
