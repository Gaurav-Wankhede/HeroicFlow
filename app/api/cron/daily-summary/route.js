import { NextResponse } from 'next/server';
import { analyzeWorkflow } from '@/lib/gemini';
import { generateProjectSummary } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const projects = await prisma.project.findMany();
    const results = [];

    for (const project of projects) {
      // Generate project summary
      const summary = await generateProjectSummary(project.id);

      // Generate AI analysis with enhanced data
      const analysisData = {
        project: {
          name: summary.projectName,
          totalIssues: summary.totalIssues
        },
        issueMetrics: {
          status: summary.issueStats,
          completionRate: summary.completionRate
        },
        sprint: summary.activeSprint,
        timeframe: {
          timestamp: summary.timestamp
        }
      };

      const analysis = await analyzeWorkflow(analysisData);

      // Store summary in database
      await prisma.dailySummary.create({
        data: {
          organizationId: project.organizationId,
          date: new Date(summary.timestamp),
          tasksAnalyzed: summary.totalIssues,
          tasksByStatus: summary.issueStats,
          activitiesCount: summary.totalIssues,
          analysis
        }
      });

      results.push({
        projectId: project.id,
        projectName: summary.projectName,
        issuesAnalyzed: summary.totalIssues,
        statusBreakdown: summary.issueStats,
        completionRate: summary.completionRate
      });
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Daily Summary Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily summaries' },
      { status: 500 }
    );
  }
}