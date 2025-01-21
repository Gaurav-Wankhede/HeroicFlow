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