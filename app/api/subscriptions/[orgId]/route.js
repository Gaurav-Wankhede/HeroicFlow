import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

export async function GET(req, { params }) {
  try {
    const { userId } = auth();
    const { orgId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
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

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Calculate usage statistics
    const totalRequests = subscription.apiUsage.reduce(
      (sum, usage) => sum + usage.requestCount,
      0
    );

    const usage = {
      currentMonthlyUsage: totalRequests,
      limit: subscription.plan.requestLimit,
      remaining: subscription.plan.requestLimit - totalRequests,
      percentageUsed: (totalRequests / subscription.plan.requestLimit) * 100
    };

    return NextResponse.json({
      subscription,
      usage
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = auth();
    const { orgId } = params;
    const { planId, status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { orgId },
      data: {
        planId,
        status,
        updatedAt: new Date()
      },
      include: { plan: true }
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = auth();
    const { orgId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.subscription.update({
      where: { orgId },
      data: {
        status: 'canceled',
        currentPeriodEnd: new Date() // Immediate cancellation
      }
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}