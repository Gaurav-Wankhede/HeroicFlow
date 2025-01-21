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