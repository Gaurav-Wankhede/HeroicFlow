"use client";

import { useState, useEffect } from 'react';
import { OrganizationList, useOrganization, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { Building2, CreditCard, CheckCircle2 } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe-client';
import { toast } from 'sonner';

const steps = [
  { id: 'organization', title: 'Create Organization' },
  { id: 'subscription', title: 'Choose Plan' },
  { id: 'complete', title: 'Complete Setup' }
];

export default function Onboarding() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('organization');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization && currentStep === 'organization') {
      setCurrentStep('subscription');
    }
  }, [organization, currentStep]);

  const handlePlanSelection = async (planKey) => {
    setSelectedPlan(planKey);
    setLoading(true);

    try {
      if (planKey === 'free_trial') {
        // For free trial, create subscription directly without Stripe
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: planKey,
            orgId: organization.id,
            skipPayment: true
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create free trial subscription');
        }

        // Redirect to organization admin page
        router.push(`/organization/${organization.id}`);
        return;
      } else {
        // For paid plans, redirect to Stripe checkout
        await createCheckoutSession(planKey, 'monthly');
      }
    } catch (error) {
      console.error('Error in plan selection:', error);
      toast.error('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress 
              value={
                currentStep === 'organization' ? 33 :
                currentStep === 'subscription' ? 66 :
                100
              } 
              className="h-2"
            />
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`text-sm ${
                    currentStep === step.id 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'organization' && (
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h1 className="text-3xl font-bold mb-4">Create Your Organization</h1>
                <p className="text-muted-foreground mb-8">
                  Start by setting up your organization to collaborate with your team
                </p>
                <OrganizationList
                  hidePersonal
                  afterCreateOrganizationUrl="/onboarding"
                  afterSelectOrganizationUrl="/onboarding"
                />
              </div>
            )}

            {currentStep === 'subscription' && (
              <div>
                <div className="text-center mb-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
                  <p className="text-muted-foreground">
                    Select a plan that best fits your needs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <Card
                      key={key}
                      className={`p-6 cursor-pointer transition-all ${
                        selectedPlan === key
                          ? 'border-primary ring-2 ring-primary ring-opacity-50'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => !loading && handlePlanSelection(key)}
                    >
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-4">{plan.description}</p>
                      <p className="text-3xl font-bold mb-6">
                        ${plan.monthlyPrice}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.highlighted ? 'default' : 'outline'}
                        disabled={loading}
                      >
                        {loading && selectedPlan === key ? 'Processing...' : 
                         key === 'free_trial' ? 'Start Free Trial' : 'Subscribe'}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h1 className="text-3xl font-bold mb-4">Setup Complete!</h1>
                <p className="text-muted-foreground mb-8">
                  Your organization is ready to go. Let's start managing your projects.
                </p>
                <Button size="lg" onClick={handleComplete}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
