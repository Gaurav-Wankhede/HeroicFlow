import { NextResponse } from 'next/server';
import { analyzeWorkflow } from '@/lib/gemini';
import { sendDailySummary } from '@/lib/email';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the first organization for testing
    const organization = await prisma.organization.findFirst({
      include: {
        owner: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Get sample tasks and activities
    const tasks = await prisma.task.findMany({
      where: { organizationId: organization.id },
      take: 10,
      include: {
        assignedTo: true,
        status: true,
        priority: true
      }
    });

    const activities = await prisma.activity.findMany({
      where: { organizationId: organization.id },
      take: 10,
      include: {
        user: true,
        task: true
      }
    });

    // Generate test analysis
    const analysis = await analyzeWorkflow(tasks, activities);

    // Send test email
    const emailSent = await sendDailySummary(organization.id, analysis);

    return NextResponse.json({
      success: true,
      organization: organization.name,
      tasksAnalyzed: tasks.length,
      activitiesAnalyzed: activities.length,
      emailSent
    });
  } catch (error) {
    console.error('Test Summary Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test summary' },
      { status: 500 }
    );
  }
}