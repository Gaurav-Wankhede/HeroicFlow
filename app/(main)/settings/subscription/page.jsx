"use client";

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/subscription';
import { createCheckoutSession, redirectToCustomerPortal, getSubscriptionStatus } from '@/lib/stripe-client';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      fetchSubscriptionStatus();
    }
  }, [organization]);

  async function fetchSubscriptionStatus() {
    try {
      const { subscription, usage } = await getSubscriptionStatus();
      setSubscription(subscription);
      setUsage(usage);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to fetch subscription status');
    }
  }

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      
      if (planId === 'free_trial') {
        // Handle free trial subscription
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            skipPayment: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start free trial');
        }

        const data = await response.json();
        toast.success('Free trial activated successfully!');
        router.push('/dashboard');
        return;
      }

      // Handle paid subscriptions
      await createCheckoutSession(planId, 'monthly');
    } catch (error) {
      console.error('Error in subscription:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalAccess = async () => {
    try {
      setLoading(true);
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Error accessing portal:', error);
      toast.error('Failed to access billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your subscription and usage
            </p>
          </div>
          {subscription?.stripeCustomerId && (
            <Button onClick={handlePortalAccess} disabled={loading}>
              Billing Portal
            </Button>
          )}
        </div>

        {subscription && usage && (
          <Card className="p-6 mb-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-medium mb-1">Current Plan</h3>
                <p className="text-2xl font-bold">
                  {SUBSCRIPTION_PLANS[subscription.planId]?.name || 'Unknown Plan'}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <div className="flex items-center">
                  {subscription.status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span className="capitalize">{subscription.status}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="capitalize">{subscription.status}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Current Period</h3>
                <p>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">API Usage</h3>
              <Progress value={usage.percentageUsed} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage.currentMonthlyUsage} requests used</span>
                <span>{usage.remaining} requests remaining</span>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative p-6 ${
                plan.highlighted ? 'border-primary' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-sm text-primary-foreground">
                  Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">
                  {formatPrice(plan.monthlyPrice)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                disabled={loading || (subscription?.planId === key && subscription?.status === 'active')}
                onClick={() => handleSubscribe(key)}
              >
                {subscription?.planId === key && subscription?.status === 'active'
                  ? 'Current Plan'
                  : key === 'free_trial'
                  ? 'Start Free Trial'
                  : 'Subscribe'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}