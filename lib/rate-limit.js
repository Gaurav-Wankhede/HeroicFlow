// lib/rate-limit.js
import { prisma } from '@/lib/prisma';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES } from '@/lib/subscriptions';

export async function checkRequestLimit(orgId, endpoint, isReportRequest = false) {
  const subscription = await prisma.subscription.findUnique({
    where: { orgId },
    include: { plan: true }
  });

  if (!subscription) {
    return { allowed: false, message: 'No active subscription found' };
  }

  const planFeatures = PLAN_FEATURES[subscription.plan.name];

  // Calculate current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Calculate today's usage
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const monthlyUsage = await prisma.aPIUsage.aggregate({
    where: {
      subscriptionId: subscription.id,
      timestamp: { gte: startOfMonth }
    },
    _sum: { requestCount: true }
  });

  const dailyUsage = await prisma.aPIUsage.aggregate({
    where: {
      subscriptionId: subscription.id,
      timestamp: { gte: startOfDay }
    },
    _sum: { requestCount: true }
  });

  const currentMonthlyUsage = monthlyUsage._sum?.requestCount || 0;
  const currentDailyUsage = dailyUsage._sum?.requestCount || 0;

  // Check if this is a report request
  if (isReportRequest) {
    const reportRequestsUsed = await prisma.aPIUsage.aggregate({
      where: {
        subscriptionId: subscription.id,
        timestamp: { gte: startOfMonth },
        endpoint: '/api/reports/daily'
      },
      _sum: { requestCount: true }
    });

    const usedReportRequests = reportRequestsUsed._sum?.requestCount || 0;
    if (usedReportRequests >= planFeatures.reservedForReports) {
      return {
        allowed: false,
        message: 'Monthly report request limit reached',
        currentUsage: usedReportRequests,
        limit: planFeatures.reservedForReports
      };
    }
  }

  // For free trial, check daily limit
  if (subscription.plan.name === 'FREE_TRIAL') {
    if (currentDailyUsage >= planFeatures.maxDailyRequests) {
      return {
        allowed: false,
        message: 'Daily request limit reached for free trial',
        currentDailyUsage,
        dailyLimit: planFeatures.maxDailyRequests
      };
    }
  }

  // Check monthly limit for all plans
  const monthlyLimit = planFeatures.maxMonthlyRequests;
  const remaining = monthlyLimit - currentMonthlyUsage;

  return {
    allowed: currentMonthlyUsage < monthlyLimit,
    currentMonthlyUsage,
    monthlyLimit,
    currentDailyUsage,
    dailyLimit: planFeatures.maxDailyRequests,
    remaining,
    isReportRequest,
  };
}

export async function recordAPIRequest(orgId, endpoint) {
  const subscription = await prisma.subscription.findUnique({
    where: { orgId }
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  return prisma.aPIUsage.create({
    data: {
      subscriptionId: subscription.id,
      endpoint,
      requestCount: 1
    }
  });
}

// Middleware to check rate limits
export async function checkRateLimit(req, orgId) {
  const endpoint = req.url;
  const isReportRequest = endpoint.includes('/api/reports/daily');
  const usage = await checkRequestLimit(orgId, endpoint, isReportRequest);

  if (!usage.allowed) {
    return {
      error: true,
      message: usage.message,
      usage,
      status: 429
    };
  }

  await recordAPIRequest(orgId, endpoint);
  return { error: false, usage };
}