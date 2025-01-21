import { getProjects, getOrganizationStats } from '@/actions/projects';
import { generateProjectAnalysis } from '@/lib/gemini';
import { Suspense } from 'react';
import { Loader2 } from "lucide-react";
import Link from "next/link";

function ProjectCard({ project }) {
  return (
    <div className="rounded-lg p-6 transition-all duration-200 dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 bg-white shadow-lg hover:shadow-xl">
      <h3 className="text-xl font-bold mb-3 dark:text-white text-gray-900">
        {project.name}
      </h3>
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/30">
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Sprints</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {project.totalSprints}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {project.activeSprints} Active
            </p>
          </div>
          <div className="p-3 rounded bg-green-50 dark:bg-green-900/30">
            <p className="text-sm text-green-700 dark:text-green-300">Total Issues</p>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              {project.totalIssues}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {project.completedIssues} Completed
            </p>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Link
          href={`/project/${project.id}`}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-center"
        >
          View Project
        </Link>
        <Link
          href={`/project/${project.id}/analytics`}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-center"
        >
          View Analytics
        </Link>
      </div>
    </div>
  );
}

export default async function OrganizationPage() {
  const projects = await getProjects();
  const stats = await getOrganizationStats();

  return (
    <div className="container mx-auto py-6 px-4 transition-colors duration-300 dark:text-white text-gray-900">
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {/* Project Summary Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-900">
          Overall Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg dark:bg-blue-900/30 dark:text-blue-300 bg-blue-50 text-blue-700">
            <h3 className="font-semibold mb-2">Projects</h3>
            <p className="text-3xl font-bold">{stats.projects.total}</p>
            <p className="text-sm mt-2">
              {stats.projects.active} Active
            </p>
          </div>
          
          <div className="p-6 rounded-lg dark:bg-green-900/30 dark:text-green-300 bg-green-50 text-green-700">
            <h3 className="font-semibold mb-2">Sprints</h3>
            <p className="text-3xl font-bold">{stats.sprints.total}</p>
            <p className="text-sm mt-2">
              {stats.sprints.active} Active
            </p>
          </div>
          
          <div className="p-6 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300 bg-yellow-50 text-yellow-700">
            <h3 className="font-semibold mb-2">Issues</h3>
            <p className="text-3xl font-bold">{stats.issues.total}</p>
            <div className="text-sm mt-2 space-y-1">
              <p>{stats.issues.byStatus.inProgress} In Progress</p>
              <p>{stats.issues.byStatus.inReview} In Review</p>
              <p>{stats.issues.byStatus.done} Done</p>
            </div>
          </div>
          
          <div className="p-6 rounded-lg dark:bg-purple-900/30 dark:text-purple-300 bg-purple-50 text-purple-700">
            <h3 className="font-semibold mb-2">Progress</h3>
            <p className="text-3xl font-bold">
              {stats.issues.total > 0 
                ? Math.round((stats.issues.completed / stats.issues.total) * 100)
                : 0}%
            </p>
            <div className="text-sm mt-2">
              <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-purple-600 dark:bg-purple-300 h-2.5 rounded-full" 
                  style={{ 
                    width: `${stats.issues.total > 0 
                      ? Math.round((stats.issues.completed / stats.issues.total) * 100)
                      : 0}%` 
                  }}
                ></div>
              </div>
              <p>{stats.issues.inProgress} Active Tasks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white text-gray-900">
          Project Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}