import { prisma } from '@/lib/prisma';

export async function generateProjectSummary(projectId) {
  try {
    // Get project and issue details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        issues: true,
        sprints: {
          where: { status: 'ACTIVE' }
        }
      },
    });

    const today = new Date();

    // Calculate issue statistics
    const issueStats = {
      TODO: project.issues.filter(i => i.status === 'TODO').length,
      IN_PROGRESS: project.issues.filter(i => i.status === 'IN_PROGRESS').length,
      IN_REVIEW: project.issues.filter(i => i.status === 'IN_REVIEW').length,
      DONE: project.issues.filter(i => i.status === 'DONE').length
    };

    const completionRate = (issueStats.DONE / project.issues.length * 100) || 0;
    const activeSprint = project.sprints[0];

    // Return summary data
    return {
      projectId: project.id,
      projectName: project.name,
      issueStats,
      completionRate,
      totalIssues: project.issues.length,
      activeSprint: activeSprint ? {
        name: activeSprint.name,
        startDate: activeSprint.startDate,
        endDate: activeSprint.endDate,
        daysRemaining: Math.ceil((new Date(activeSprint.endDate) - today) / (1000 * 60 * 60 * 24))
      } : null,
      timestamp: today.toISOString()
    };
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

export async function sendDailySummary(organizationId, analysis) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: true,
        members: true
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // For now, just log the analysis (implement actual email sending later)
    console.log('Daily Summary for:', organization.name);
    console.log('Analysis:', analysis);

    // Return true to indicate success
    return true;
  } catch (error) {
    console.error('Failed to send daily summary:', error);
    return false;
  }
}