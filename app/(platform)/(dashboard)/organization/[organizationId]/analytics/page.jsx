import { getProjects } from '@/actions/projects';
import { generateProjectAnalysis } from '@/lib/gemini';
import { Suspense } from 'react';
import { Loader2, TrendingUp, Users, Clock, AlertCircle } from "lucide-react";

// Component for displaying metric cards
function MetricCard({ title, value, icon: Icon, className }) {
  return (
    <div className={`p-6 rounded-lg ${className} transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </div>
  );
}

// Component for AI insights
async function ProjectInsights({ project }) {
  const analysis = await generateProjectAnalysis({
    project: {
      name: project.name,
      totalIssues: project.issues?.length || 0,
      completedIssues: project.issues?.filter(i => i.status === 'DONE').length || 0,
      inProgressIssues: project.issues?.filter(i => i.status === 'IN_PROGRESS').length || 0,
      blockedIssues: project.issues?.filter(i => i.status === 'BLOCKED').length || 0
    },
    sprints: project.sprints?.length || 0,
    activeSprints: project.sprints?.filter(s => s.status === 'ACTIVE').length || 0
  });

  return (
    <div className="mt-4 p-6 rounded-lg dark:bg-gray-800 bg-white shadow-lg">
      <h3 className="text-xl font-semibold mb-4 dark:text-white">AI Insights</h3>
      <div className="space-y-4">
        {analysis.insights.map((insight, index) => (
          <div key={index} className="p-4 rounded dark:bg-gray-700/50 bg-gray-50">
            <p className="dark:text-gray-200 text-gray-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for project performance metrics
function ProjectMetrics({ project }) {
  const completionRate = project.issues?.length 
    ? ((project.issues.filter(i => i.status === 'DONE').length / project.issues.length) * 100).toFixed(1)
    : 0;

  const activeSprintCount = project.sprints?.filter(s => s.status === 'ACTIVE').length || 0;
  const blockedIssuesCount = project.issues?.filter(i => i.status === 'BLOCKED').length || 0;

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Completion Rate"
        value={`${completionRate}%`}
        icon={TrendingUp}
        className="dark:bg-blue-900/30 dark:text-blue-300 bg-blue-50 text-blue-700"
      />
      <MetricCard
        title="Active Sprints"
        value={activeSprintCount}
        icon={Clock}
        className="dark:bg-green-900/30 dark:text-green-300 bg-green-50 text-green-700"
      />
      <MetricCard
        title="Team Members"
        value={project.members?.length || 0}
        icon={Users}
        className="dark:bg-purple-900/30 dark:text-purple-300 bg-purple-50 text-purple-700"
      />
      <MetricCard
        title="Blocked Issues"
        value={blockedIssuesCount}
        icon={AlertCircle}
        className="dark:bg-red-900/30 dark:text-red-300 bg-red-50 text-red-700"
      />
    </div>
  );
}

// Main Analytics Page Component
export default async function AnalyticsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Organization Analytics</h1>
      </div>

      {/* Overall Organization Metrics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Overall Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Projects"
            value={projects.length}
            icon={TrendingUp}
            className="dark:bg-blue-900/30 dark:text-blue-300 bg-blue-50 text-blue-700"
          />
          <MetricCard
            title="Active Projects"
            value={projects.filter(p => p.status === 'ACTIVE').length}
            icon={Clock}
            className="dark:bg-green-900/30 dark:text-green-300 bg-green-50 text-green-700"
          />
          <MetricCard
            title="Total Sprints"
            value={projects.reduce((acc, p) => acc + (p.sprints?.length || 0), 0)}
            icon={Users}
            className="dark:bg-purple-900/30 dark:text-purple-300 bg-purple-50 text-purple-700"
          />
          <MetricCard
            title="Total Issues"
            value={projects.reduce((acc, p) => acc + (p.issues?.length || 0), 0)}
            icon={AlertCircle}
            className="dark:bg-yellow-900/30 dark:text-yellow-300 bg-yellow-50 text-yellow-700"
          />
        </div>
      </section>

      {/* Individual Project Analytics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold dark:text-white">Project Analytics</h2>
        {projects.map((project) => (
          <div key={project.id} className="p-6 rounded-lg dark:bg-gray-800 bg-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">{project.name}</h3>
            
            <ProjectMetrics project={project} />
            
            <Suspense fallback={
              <div className="mt-6 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin dark:text-blue-400 text-blue-500" />
                <span className="ml-2 dark:text-gray-300 text-gray-600">
                  Generating insights...
                </span>
              </div>
            }>
              <ProjectInsights project={project} />
            </Suspense>
          </div>
        ))}
      </section>
    </div>
  );
}