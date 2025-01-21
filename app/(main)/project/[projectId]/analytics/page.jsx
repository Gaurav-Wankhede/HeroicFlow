import { getProject } from '@/actions/projects';
import { Suspense } from 'react';
import { TrendingUp, Users, Clock, AlertCircle } from "lucide-react";
import AIInsightsButton from './AIInsightsButton';

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
export default async function ProjectAnalyticsPage({ params }) {
  const project = await getProject(params.projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl dark:text-white">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">{project.name} Analytics</h1>
      </div>

      {/* Project Metrics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Project Metrics</h2>
        <ProjectMetrics project={project} />
      </section>

      {/* Sprint Performance */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Sprint Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.sprints?.map((sprint) => (
            <div 
              key={sprint.id}
              className="p-4 rounded-lg dark:bg-gray-800 bg-white shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2 dark:text-white">{sprint.name}</h3>
              <div className="space-y-2">
                <p className="dark:text-gray-300 text-gray-600">
                  Status: <span className="font-medium">{sprint.status}</span>
                </p>
                <p className="dark:text-gray-300 text-gray-600">
                  Issues: <span className="font-medium">{sprint.issues?.length || 0}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Suspense>
        <AIInsightsButton project={project} />
      </Suspense>
    </div>
  );
}