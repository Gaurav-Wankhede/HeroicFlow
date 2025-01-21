// lib/subscriptions.js
export const SUBSCRIPTION_PLANS = {
  free_trial: {
    name: 'Free Trial',
    description: 'Perfect for trying out our features',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyRequestLimit: 100,
    highlighted: false,
    features: [
      '100 API requests per month',
      'Basic project management',
      'Up to 3 team members',
      'Basic analytics',
      '30-day trial period'
    ]
  },
  pro: {
    name: 'Pro',
    description: 'Best for growing teams',
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    monthlyRequestLimit: 1000,
    highlighted: true,
    features: [
      '1,000 API requests per month',
      'Advanced project management',
      'Unlimited team members',
      'Advanced analytics',
      'Priority support',
      'Custom integrations'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    monthlyRequestLimit: 5000,
    highlighted: false,
    features: [
      '5,000 API requests per month',
      'Enterprise-grade security',
      'Dedicated account manager',
      'Custom analytics',
      '24/7 phone support',
      'SLA guarantees'
    ]
  }
};

export function getStripePriceId(planId, interval = 'monthly') {
  const priceMap = {
    pro: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID
    },
    enterprise: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID
    }
  };

  return priceMap[planId]?.[interval];
}

export function getPlanByPriceId(priceId) {
  const priceToPlans = {
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID]: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID]: 'enterprise',
    [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID]: 'enterprise'
  };

  const planId = priceToPlans[priceId];
  return planId ? { id: planId, ...SUBSCRIPTION_PLANS[planId] } : null;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}

export function calculateYearlySavings(monthlyPrice, yearlyPrice) {
  const monthlyTotal = monthlyPrice * 12;
  const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
  return Math.round(savings);
}

export function getPlanFeatures(planId) {
  return SUBSCRIPTION_PLANS[planId]?.features || [];
}

export function isFreePlan(planId) {
  return planId === 'free_trial';
}

export function getNextPlan(currentPlanId) {
  const plans = Object.keys(SUBSCRIPTION_PLANS);
  const currentIndex = plans.indexOf(currentPlanId);
  return plans[currentIndex + 1] || null;
}

export function isPlanExpired(subscription) {
  if (!subscription) return true;
  if (subscription.status !== 'active') return true;
  return new Date(subscription.currentPeriodEnd) < new Date();
}