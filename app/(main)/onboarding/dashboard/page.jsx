"use client";

import { useEffect, useState } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings 
} from 'lucide-react';

export default function OnboardingDashboard() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      fetchSubscriptionData();
    }
  }, [organization]);

  async function fetchSubscriptionData() {
    try {
      const response = await fetch(`/api/subscriptions/${organization.id}`);
      const data = await response.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-muted-foreground">
          Manage your organization and subscription settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickStatsCard
          title="Organization"
          value={organization?.name}
          icon={<Building2 />}
        />
        <QuickStatsCard
          title="Team Members"
          value={organization?.membersCount || 0}
          icon={<Users />}
        />
        <QuickStatsCard
          title="Current Plan"
          value={subscription?.plan?.name || 'Free Trial'}
          icon={<CreditCard />}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <UsageOverview usage={usage} subscription={subscription} />
            <ActivityFeed />
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManager 
            subscription={subscription} 
            organization={organization} 
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement organization={organization} />
        </TabsContent>

        <TabsContent value="settings">
          <OrganizationSettings organization={organization} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuickStatsCard({ title, value, icon }) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function UsageOverview({ usage, subscription }) {
  if (!usage || !subscription) return null;

  const percentage = (usage.currentMonthlyUsage / subscription.plan.requestLimit) * 100;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">API Usage</h2>
      <div className="space-y-4">
        <Progress value={percentage} />
        <div className="flex justify-between text-sm">
          <span>{usage.currentMonthlyUsage} requests used</span>
          <span>{subscription.plan.requestLimit} requests total</span>
        </div>
        {percentage > 80 && (
          <div className="text-yellow-500 text-sm">
            You're approaching your usage limit. Consider upgrading your plan.
          </div>
        )}
      </div>
    </Card>
  );
}

function SubscriptionManager({ subscription, organization }) {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`p-6 rounded-lg border ${
                subscription?.plan?.name === key
                  ? 'border-primary'
                  : 'border-border'
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold my-4">
                ${plan.monthlyPrice}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={subscription?.plan?.name === key ? 'outline' : 'default'}
              >
                {subscription?.plan?.name === key
                  ? 'Current Plan'
                  : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TeamManagement({ organization }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Team Members</h2>
      <div className="space-y-4">
        {/* Add team management UI here */}
      </div>
    </Card>
  );
}

function OrganizationSettings({ organization }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
      <div className="space-y-4">
        {/* Add organization settings form here */}
      </div>
    </Card>
  );
}

function ActivityFeed() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {/* Add activity feed here */}
      </div>
    </Card>
  );
}