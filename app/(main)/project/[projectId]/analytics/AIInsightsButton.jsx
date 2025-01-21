'use client';

import { useState } from 'react';
import { generateSummary } from '@/actions/projects';
import { useTheme } from 'next-themes';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-t-transparent border-blue-600 dark:border-blue-400 rounded-full animate-spin" />
      <span>Analyzing Project...</span>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, className }) {
  return (
    <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-200">{title}</h3>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
    </div>
  );
}

export default function AIInsightsButton({ project }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateSummary(project.id);
      setSummary(result);
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate project insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Project Analysis</h2>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center gap-2 py-2 px-4 rounded shadow transition-colors bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Generate Analysis'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          {/* Project Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.projectData.metrics.completionRate !== undefined && (
              <MetricCard
                title="Completion Rate"
                value={`${summary.projectData.metrics.completionRate.toFixed(1)}%`}
              />
            )}
            
            {summary.projectData.project.totalIssues !== undefined && (
              <MetricCard
                title="Total Issues"
                value={summary.projectData.project.totalIssues}
              />
            )}
            
            {summary.projectData.metrics.activeSprint && (
              <MetricCard
                title="Active Sprint"
                value={`${summary.projectData.metrics.activeSprint.name} (${summary.projectData.metrics.activeSprint.remainingDays} days)`}
              />
            )}
          </div>

          {/* Issue Distribution */}
          {(summary.projectData.metrics.issuesByStatus || summary.projectData.metrics.issuesByPriority) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.projectData.metrics.issuesByStatus && (
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">Issues by Status</h3>
                  <div className="space-y-2">
                    {Object.entries(summary.projectData.metrics.issuesByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{status}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {summary.projectData.metrics.issuesByPriority && (
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">Issues by Priority</h3>
                  <div className="space-y-2">
                    {Object.entries(summary.projectData.metrics.issuesByPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{priority}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Activities */}
          {summary.projectData.activities?.length > 0 && (
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">Recent Activities (Last 7 Days)</h3>
              <div className="space-y-3">
                {summary.projectData.activities.map((activity, index) => (
                  <div key={index} className="p-3 rounded bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{activity.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: <span className="font-medium">{activity.status}</span> • 
                          Assignee: <span className="font-medium">{activity.assignee}</span>
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {summary.aiSummary && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
              {/* Project Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                Project Analysis Report
              </h3>

              {/* Executive Summary */}
              <div className="space-y-3">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Executive Summary
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {summary.projectData.project.name} is a {summary.projectData.project.description || 'project'} with 
                  a total of {summary.projectData.project.totalIssues} {summary.projectData.project.totalIssues === 1 ? 'issue' : 'issues'}. 
                  The project has a completion rate of {summary.projectData.metrics.completionRate.toFixed(1)}%.
                </p>
              </div>

              {/* Sprint Analysis */}
              {summary.projectData.metrics.activeSprint && (
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Sprint Analysis
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Active Sprint:</span> {summary.projectData.metrics.activeSprint.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Remaining Days:</span> {summary.projectData.metrics.activeSprint.remainingDays}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Sprint Progress:</span> {
                        ((summary.projectData.metrics.activeSprint.completedIssues / 
                          summary.projectData.metrics.activeSprint.totalIssues) * 100).toFixed(1)
                      }%
                    </p>
                  </div>
                </div>
              )}

              {/* Issue Distribution */}
              <div className="space-y-3">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Issue Distribution Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status:</p>
                    <div className="space-y-1">
                      {Object.entries(summary.projectData.metrics.issuesByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>{status}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Priority:</p>
                    <div className="space-y-1">
                      {Object.entries(summary.projectData.metrics.issuesByPriority).map(([priority, count]) => (
                        <div key={priority} className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>{priority}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Performance */}
              <div className="space-y-3">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Team Performance Metrics
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Total Sprints:</span> {summary.projectData.metrics.sprintMetrics.total}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Completed Sprints:</span> {summary.projectData.metrics.sprintMetrics.completed}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Average Sprint Completion Rate:</span> {
                      summary.projectData.metrics.sprintMetrics.averageCompletionRate.toFixed(1)
                    }%
                  </p>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-3">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Risk Factors and Recommendations
                </h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-amber-700 dark:text-amber-400">
                    {summary.projectData.metrics.completionRate < 20 
                      ? "The project is currently at a high risk due to its low completion rate. It is recommended to focus on completing existing issues and tracking progress regularly."
                      : summary.projectData.metrics.completionRate < 50
                      ? "The project shows moderate progress but requires attention to maintain momentum and meet deadlines."
                      : "The project is progressing well. Continue monitoring and maintaining the current pace."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}