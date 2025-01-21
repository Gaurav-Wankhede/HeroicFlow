import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable version
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function createStripeCheckoutSession({
  orgId,
  planId,
  planName,
  priceId,
  successUrl,
  cancelUrl,
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orgId,
      planId,
      planName,
    },
    subscription_data: {
      metadata: {
        orgId,
        planId,
        planName,
      },
    },
  });

  return session;
}

export async function createStripePortalSession({
  customerId,
  returnUrl,
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getStripeSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function cancelStripeSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

export async function updateStripeSubscription({
  subscriptionId,
  priceId,
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update the subscription
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: priceId,
    }],
  });

  return updatedSubscription;
}