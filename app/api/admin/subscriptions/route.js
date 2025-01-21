import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

export async function GET(req) {
  const { userId, orgId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'ADMIN'
    }
  });

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        plan: true,
        apiUsage: {
          where: {
            timestamp: {
              gte: new Date(new Date().setDate(1)) // Start of current month
            }
          }
        }
      }
    });

    const formattedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      currentMonthlyUsage: sub.apiUsage.reduce(
        (sum, usage) => sum + usage.requestCount,
        0
      )
    }));

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}