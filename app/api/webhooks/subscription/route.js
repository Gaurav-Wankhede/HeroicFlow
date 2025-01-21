import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getPlanByPriceId } from '@/lib/subscription';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function updateSubscriptionInDatabase(subscription, status) {
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanByPriceId(priceId);

  if (!plan) {
    console.error('No matching plan found for price:', priceId);
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      planId: plan.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(' Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const data = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const subscription = await stripe.subscriptions.retrieve(
          data.subscription
        );

        // For new subscriptions
        await prisma.subscription.upsert({
          where: { orgId: data.metadata.orgId },
          create: {
            orgId: data.metadata.orgId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: data.customer,
            stripePriceId: subscription.items.data[0].price.id,
            planId: data.metadata.planId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: data.customer,
            stripePriceId: subscription.items.data[0].price.id,
            planId: data.metadata.planId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        if (data.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            data.subscription
          );
          await updateSubscriptionInDatabase(subscription, 'active');
        }
        break;
      }

      case 'invoice.payment_failed': {
        if (data.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            data.subscription
          );
          await updateSubscriptionInDatabase(subscription, 'past_due');
        }
        break;
      }

      case 'customer.subscription.updated': {
        await updateSubscriptionInDatabase(data, data.status);
        break;
      }

      case 'customer.subscription.deleted': {
        await updateSubscriptionInDatabase(data, 'canceled');
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}