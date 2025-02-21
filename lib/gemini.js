import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateProjectAnalysis({ project, sprints, activeSprints }) {
  try {
    // If no API key is set, return mock insights for development
    if (!process.env.GEMINI_API_KEY) {
      return {
        insights: [
          `Project ${project.name} has ${project.totalIssues} total issues with ${project.completedIssues} completed.`,
          `Current completion rate is ${((project.completedIssues / project.totalIssues) * 100).toFixed(1)}%.`,
          `There are ${project.blockedIssues} blocked issues that need attention.`,
          `Team is managing ${activeSprints} active sprints out of ${sprints} total sprints.`
        ],
        timestamp: new Date().toISOString()
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze this project's metrics and provide 3-4 insightful observations:
      
      Project: ${project.name}
      Total Issues: ${project.totalIssues}
      Completed Issues: ${project.completedIssues}
      In Progress Issues: ${project.inProgressIssues}
      Blocked Issues: ${project.blockedIssues}
      Total Sprints: ${sprints}
      Active Sprints: ${activeSprints}
      
      Consider:
      1. Project health and progress
      2. Team velocity and efficiency
      3. Potential bottlenecks or risks
      4. Areas for improvement
      
      Format each insight as a clear, actionable statement.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split the text into individual insights
    const insights = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove numbering if present

    return {
      insights,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating project analysis:', error);
    return {
      insights: [
        'Unable to generate AI insights at this time.',
        'Please try again later or contact support if the issue persists.'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export async function analyzeWorkflow({ organization, projects, users, period }) {
  try {
    // If no API key is set, return mock summary for development
    if (!process.env.GEMINI_API_KEY) {
      return {
        summary: [
          `Organization ${organization.name} has ${projects.length} active projects.`,
          `Team of ${users.length} members completed ${projects.reduce((acc, p) => acc + p.completedIssues, 0)} issues this ${period}.`,
          `Current focus is on ${projects.filter(p => p.inProgressIssues > 0).length} projects with active tasks.`,
          `Overall project health is good with ${projects.filter(p => p.blockedIssues === 0).length} projects running smoothly.`
        ],
        recommendations: [
          'Consider reviewing projects with blocked issues',
          'Monitor team workload distribution',
          'Plan capacity for upcoming sprints'
        ],
        timestamp: new Date().toISOString()
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      Analyze this organization's workflow and provide a summary with recommendations:
      
      Organization: ${organization.name}
      Period: ${period}
      Total Projects: ${projects.length}
      Active Users: ${users.length}
      
      Project Metrics:
      ${projects.map(p => `
        - ${p.name}:
          * Total Issues: ${p.totalIssues}
          * Completed: ${p.completedIssues}
          * In Progress: ${p.inProgressIssues}
          * Blocked: ${p.blockedIssues}
      `).join('\n')}
      
      Consider:
      1. Overall productivity and efficiency
      2. Resource allocation and workload
      3. Project health and bottlenecks
      4. Team collaboration patterns
      
      Provide:
      1. 3-4 key observations about the workflow
      2. 2-3 actionable recommendations for improvement
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split the text into summary and recommendations
    const sections = text.split('\n\nRecommendations:');
    const summary = sections[0]
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove numbering if present
    
    const recommendations = sections[1]
      ? sections[1]
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, ''))
      : ['Review project metrics regularly', 'Plan team capacity proactively'];

    return {
      summary,
      recommendations,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing workflow:', error);
    return {
      summary: ['Unable to generate workflow analysis at this time.'],
      recommendations: ['Please try again later or contact support if the issue persists.'],
      timestamp: new Date().toISOString()
    };
  }
}