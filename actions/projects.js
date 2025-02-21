"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function createProject(data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  // Check if the user is an admin of the organization
  const { data: membershipList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membershipList.find(
    (membership) => membership.publicUserData.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
}

export async function getProject(projectId) {
  console.log("getProject called with projectId:", projectId);
  try {
    const { userId, orgId } = auth();
    console.log("Auth result:", { userId, orgId });

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // Find user or create if not exists
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
    console.log("User found in database:", user);

    if (!user) {
      console.log("User not found, creating new user");
      try {
        // Get user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("Clerk user details:", clerkUser);
        
        // Create user in the database
        user = await prisma.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName} ${clerkUser.lastName}`,
            imageUrl: clerkUser.imageUrl,
          },
        });
        console.log("User created:", user);
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    }

    // Get project with all related data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          include: {
            issues: {
              include: {
                reporter: true,
                assignee: true,
              },
              orderBy: [
                { status: 'asc' },
                { order: 'asc' }
              ],
            },
          },
          orderBy: { createdAt: "desc" },
        },
        issues: {
          include: {
            reporter: true,
            assignee: true,
            sprint: true,
          },
          orderBy: [
            { status: 'asc' },
            { order: 'asc' }
          ],
        },
        _count: {
          select: {
            issues: true,
            sprints: true,
          },
        },
      },
    });
    console.log("Project found:", project);

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify project belongs to the organization
    if (project.organizationId !== orgId) {
      throw new Error("Unauthorized access to project");
    }

    return project;
  } catch (error) {
    console.error("Error in getProject:", error);
    throw error;
  }
}

export async function getProjects() {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sprints: {
          include: {
            issues: true
          }
        },
        issues: {
          include: {
            reporter: true,
            assignee: true,
            sprint: true
          }
        }
      }
    });

    // Add computed fields for the UI
    return projects.map(project => ({
      ...project,
      activeSprints: project.sprints.filter(s => s.status === 'ACTIVE').length,
      totalSprints: project.sprints.length,
      totalIssues: project.issues.length,
      completedIssues: project.issues.filter(i => i.status === 'DONE').length
    }));

  } catch (error) {
    throw new Error("Error fetching projects: " + error.message);
  }
}

export async function deleteProject(projectId) {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}

export async function fetchProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        sprints: true, // Include related sprints
      },
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// Generate a summary for a specific project
export async function generateSummary(projectId) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          include: {
            issues: true
          }
        },
        issues: {
          include: {
            assignee: true,
            reporter: true
          }
        }
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate project metrics
    const issuesByStatus = {
      TODO: project.issues.filter(i => i.status === 'TODO').length,
      IN_PROGRESS: project.issues.filter(i => i.status === 'IN_PROGRESS').length,
      IN_REVIEW: project.issues.filter(i => i.status === 'IN_REVIEW').length,
      DONE: project.issues.filter(i => i.status === 'DONE').length,
      BLOCKED: project.issues.filter(i => i.status === 'BLOCKED').length
    };

    const issuesByPriority = {
      LOW: project.issues.filter(i => i.priority === 'LOW').length,
      MEDIUM: project.issues.filter(i => i.priority === 'MEDIUM').length,
      HIGH: project.issues.filter(i => i.priority === 'HIGH').length
    };

    const activeSprint = project.sprints.find(s => s.status === 'ACTIVE');
    const completedSprints = project.sprints.filter(s => s.status === 'COMPLETED');
    const completionRate = project.issues.length ? 
      (issuesByStatus.DONE / project.issues.length * 100) : 0;

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = project.issues
      .filter(issue => new Date(issue.updatedAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(issue => ({
        type: 'ISSUE_UPDATE',
        issueId: issue.id,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        updatedAt: issue.updatedAt,
        assignee: issue.assignee?.name || 'Unassigned'
      }));

    // Calculate sprint metrics
    const sprintMetrics = {
      total: project.sprints.length,
      active: project.sprints.filter(s => s.status === 'ACTIVE').length,
      completed: completedSprints.length,
      averageCompletionRate: completedSprints.length ? 
        completedSprints.reduce((acc, sprint) => {
          const sprintIssues = sprint.issues.length;
          const completedIssues = sprint.issues.filter(i => i.status === 'DONE').length;
          return acc + (completedIssues / sprintIssues * 100);
        }, 0) / completedSprints.length : 0
    };

    // Prepare data for AI analysis
    const analysisData = {
      project: {
        name: project.name,
        key: project.key,
        description: project.description,
        totalIssues: project.issues.length
      },
      metrics: {
        issuesByStatus,
        issuesByPriority,
        completionRate,
        sprintMetrics,
        activeSprint: activeSprint ? {
          name: activeSprint.name,
          remainingDays: Math.ceil((new Date(activeSprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
          totalIssues: activeSprint.issues.length,
          completedIssues: activeSprint.issues.filter(i => i.status === 'DONE').length
        } : null
      },
      activities: recentActivities
    };

    // Generate AI summary using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze this project data and provide a comprehensive summary:
      
      Project Overview:
      - Name: ${analysisData.project.name}
      - Description: ${analysisData.project.description || 'No description provided'}
      - Total Issues: ${analysisData.project.totalIssues}
      
      Current Status:
      - Overall Completion: ${analysisData.metrics.completionRate.toFixed(1)}%
      - Issues by Status: ${JSON.stringify(analysisData.metrics.issuesByStatus)}
      - Issues by Priority: ${JSON.stringify(analysisData.metrics.issuesByPriority)}
      
      Sprint Information:
      ${analysisData.metrics.activeSprint ? `
      Active Sprint: ${analysisData.metrics.activeSprint.name}
      - Remaining Days: ${analysisData.metrics.activeSprint.remainingDays}
      - Sprint Progress: ${(analysisData.metrics.activeSprint.completedIssues / analysisData.metrics.activeSprint.totalIssues * 100).toFixed(1)}%
      ` : 'No Active Sprint'}
      
      Sprint Metrics:
      - Total Sprints: ${analysisData.metrics.sprintMetrics.total}
      - Completed Sprints: ${analysisData.metrics.sprintMetrics.completed}
      - Average Sprint Completion Rate: ${analysisData.metrics.sprintMetrics.averageCompletionRate.toFixed(1)}%
      
      Recent Activities (Last 7 Days):
      ${analysisData.activities.map(activity => 
        `- ${activity.title} (${activity.status}) - Assigned to: ${activity.assignee}`
      ).join('\n')}
      
      Please provide a detailed analysis with the following sections:
      1. Executive Summary (2-3 sentences overview)
      2. Sprint Analysis (focus on current sprint if exists)
      3. Issue Distribution Insights
      4. Team Performance Metrics
      5. Risk Factors and Recommendations
      
      Format the response as modern HTML with appropriate semantic tags and Tailwind classes for both light and dark themes.
      Use these class patterns:
      - Sections: bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg
      - Headings: text-xl font-semibold text-gray-900 dark:text-white mb-4
      - Paragraphs: text-gray-600 dark:text-gray-300
      - Lists: space-y-2 list-disc pl-5
      - Important metrics: font-semibold text-blue-600 dark:text-blue-400
      - Warnings: text-amber-600 dark:text-amber-400
      - Success metrics: text-green-600 dark:text-green-400
    `;

    const result = await model.generateContent(prompt);
    const aiSummary = result.response.text();

    return {
      projectData: analysisData,
      aiSummary: aiSummary
    };

  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function getOrganizationStats() {
  const { userId, orgId } = auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    console.log('Fetching stats for organization:', orgId);

    // Get all projects with their sprints and issues
    const projects = await prisma.project.findMany({
      where: { 
        organizationId: orgId,
      },
      include: {
        sprints: {
          select: {
            id: true,
            status: true,
            issues: {
              select: {
                id: true,
                status: true
              }
            }
          }
        },
        issues: {
          select: {
            id: true,
            status: true,
            sprintId: true
          }
        }
      }
    });

    console.log('Found projects:', projects.length);
    projects.forEach(p => {
      console.log(`Project ${p.name}:`, {
        sprints: p.sprints.length,
        issues: p.issues.length
      });
    });

    // Calculate project stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      p.sprints.some(s => s.status === 'ACTIVE')
    ).length;

    // Calculate sprint stats
    const allSprints = projects.flatMap(p => p.sprints);
    const totalSprints = allSprints.length;
    const activeSprints = allSprints.filter(s => s.status === 'ACTIVE').length;

    // Calculate issue stats
    const allIssues = projects.flatMap(p => p.issues);
    console.log('All issues:', allIssues.map(i => ({
      id: i.id,
      status: i.status,
      sprintId: i.sprintId
    })));

    const issueStatsByStatus = allIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

    console.log('Issue stats by status:', issueStatsByStatus);

    const totalIssues = allIssues.length;
    const completedIssues = issueStatsByStatus.DONE || 0;
    const inProgressIssues = (issueStatsByStatus.IN_PROGRESS || 0) + 
                            (issueStatsByStatus.IN_REVIEW || 0);

    const stats = {
      projects: {
        total: totalProjects,
        active: activeProjects
      },
      sprints: {
        total: totalSprints,
        active: activeSprints
      },
      issues: {
        total: totalIssues,
        completed: completedIssues,
        inProgress: inProgressIssues,
        byStatus: {
          todo: issueStatsByStatus.TODO || 0,
          inProgress: issueStatsByStatus.IN_PROGRESS || 0,
          inReview: issueStatsByStatus.IN_REVIEW || 0,
          done: issueStatsByStatus.DONE || 0
        }
      }
    };

    console.log('Final stats:', stats);
    return stats;

  } catch (error) {
    console.error('Error in getOrganizationStats:', error);
    throw new Error('Failed to fetch organization statistics');
  }
}