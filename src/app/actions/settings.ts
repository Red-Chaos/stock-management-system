'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const COMPANY_NAME_KEY = 'companyName';

export async function getCompanyName() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: COMPANY_NAME_KEY }
    });
    return setting?.value || 'StockSys Corporate';
  } catch (error) {
    console.error('Failed to get company name:', error);
    return 'StockSys Corporate';
  }
}

export async function setCompanyName(name: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: COMPANY_NAME_KEY },
      update: { value: name },
      create: { key: COMPANY_NAME_KEY, value: name }
    });
    // Revalidate dashboard layouts
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to set company name:', error);
    return { error: 'Failed to update company name' };
  }
}
