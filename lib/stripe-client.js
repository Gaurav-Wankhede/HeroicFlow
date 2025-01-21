import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export async function createCheckoutSession(planId, interval = 'monthly') {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        interval,
      }),
    });

    const { url, sessionId } = await response.json();

    if (!url) throw new Error('Failed to create checkout session');

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) throw new Error(error.message);

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
}

export async function redirectToCustomerPortal() {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_portal',
      }),
    });

    const { url, error } = await response.json();

    if (error) throw new Error(error);
    if (!url) throw new Error('Failed to create portal session');

    window.location.href = url;
  } catch (error) {
    console.error('Error in redirectToCustomerPortal:', error);
    throw error;
  }
}

export async function getSubscriptionStatus() {
  try {
    const response = await fetch('/api/subscriptions');
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    return {
      subscription: data.subscription,
      usage: data.usage,
      hasStripeSubscription: data.hasStripeSubscription
    };
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    throw error;
  }
}