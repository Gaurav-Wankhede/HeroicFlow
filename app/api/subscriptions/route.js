import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_PLANS, getStripePriceId } from '@/lib/subscription';

export async function GET(req) {
  try {
    const { orgId } = auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { orgId },
      include: {
        organization: true
      }
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        hasStripeSubscription: false,
        usage: { currentMonthlyUsage: 0, remaining: 0, percentageUsed: 0 }
      });
    }

    // Get current usage
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const usage = await prisma.usage.findFirst({
      where: {
        orgId,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const plan = SUBSCRIPTION_PLANS[subscription.planId];
    const currentMonthlyUsage = usage?.count || 0;
    const remaining = plan.monthlyRequestLimit - currentMonthlyUsage;
    const percentageUsed = (currentMonthlyUsage / plan.monthlyRequestLimit) * 100;

    return NextResponse.json({
      subscription,
      hasStripeSubscription: !!subscription.stripeSubscriptionId,
      usage: {
        currentMonthlyUsage,
        remaining,
        percentageUsed
      }
    });

  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { orgId } = auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, planId, interval = 'monthly', skipPayment = false } = body;

    // Check if organization already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { orgId }
    });

    if (existingSubscription?.status === 'active' && existingSubscription.planId !== 'free_trial') {
      return NextResponse.json(
        { error: 'Organization already has an active subscription' },
        { status: 400 }
      );
    }

    // Handle customer portal creation
    if (action === 'create_portal') {
      if (!existingSubscription?.stripeCustomerId) {
        return NextResponse.json(
          { error: 'No Stripe customer found' },
          { status: 400 }
        );
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: existingSubscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Handle free trial
    if (skipPayment && planId === 'free_trial') {
      // Check if user has already used free trial
      if (existingSubscription?.planId === 'free_trial') {
        return NextResponse.json(
          { error: 'Free trial already used' },
          { status: 400 }
        );
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

      const subscription = await prisma.subscription.upsert({
        where: { orgId },
        create: {
          orgId,
          planId: 'free_trial',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate,
          trialEnd: trialEndDate
        },
        update: {
          planId: 'free_trial',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate,
          trialEnd: trialEndDate
        },
      });

      // Initialize usage record
      await prisma.usage.create({
        data: {
          orgId,
          count: 0,
          subscriptionId: subscription.id
        }
      });

      return NextResponse.json({ 
        subscription,
        redirectUrl: `/organization/${orgId}`
      });
    }

    // Handle paid subscriptions
    const priceId = getStripePriceId(planId, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or interval' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = existingSubscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          orgId
        }
      });
      customerId = customer.id;

      // Update subscription with customer ID if it exists
      if (existingSubscription) {
        await prisma.subscription.update({
          where: { orgId },
          data: { stripeCustomerId: customerId }
        });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/organization/${orgId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?canceled=true`,
      metadata: {
        orgId,
        planId
      }
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}