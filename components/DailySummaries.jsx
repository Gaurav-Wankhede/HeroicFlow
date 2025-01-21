'use client';

import { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

export default function DailySummaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('all');
  const { organization } = useOrganization();

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!organization) return;
      
      try {
        const response = await fetch(`/api/summaries?organizationId=${organization.organizationId}`);
        const data = await response.json();
        setSummaries(data.summaries);
      } catch (error) {
        console.error('Failed to fetch summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [organization]);

  const formatDate = (date) => {
    return format(new Date(date), 'PPP');
  };

  const filteredSummaries = selectedDate === 'all'
    ? summaries
    : summaries.filter(summary => 
        format(new Date(summary.date), 'yyyy-MM') === selectedDate
      );

  const getUniqueDates = () => {
    const dates = new Set(
      summaries.map(summary => format(new Date(summary.date), 'yyyy-MM'))
    );
    return Array.from(dates).sort().reverse();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading summaries...</div>;
  }

  return (
    <div className="space-y-6 p-6 dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight dark:text-white">Daily Summaries</h2>
        <Select
          value={selectedDate}
          onValueChange={setSelectedDate}
        >
          <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-white">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700">
            <SelectItem value="all" className="dark:text-white">All Time</SelectItem>
            {getUniqueDates().map(date => (
              <SelectItem key={date} value={date} className="dark:text-white">
                {format(new Date(date + '-01'), 'MMMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredSummaries.map((summary) => (
          <Card key={summary.id} className="dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">{formatDate(summary.date)}</CardTitle>
              <CardDescription className="dark:text-gray-300">
                {summary.tasksAnalyzed} tasks analyzed • {summary.activitiesCount} activities recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 dark:text-white">Tasks by Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(summary.tasksByStatus).map(([status, count]) => (
                      <div
                        key={status}
                        className="bg-secondary dark:bg-gray-600 p-3 rounded-lg"
                      >
                        <div className="text-sm font-medium dark:text-gray-300">{status}</div>
                        <div className="text-2xl font-bold dark:text-white">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 dark:text-white">Tasks by Priority</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(summary.tasksByPriority).map(([priority, count]) => (
                      <div
                        key={priority}
                        className="bg-secondary dark:bg-gray-600 p-3 rounded-lg"
                      >
                        <div className="text-sm font-medium dark:text-gray-300">{priority}</div>
                        <div className="text-2xl font-bold dark:text-white">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 dark:text-white">AI Analysis</h4>
                  <p className="text-muted-foreground dark:text-gray-300">{summary.analysis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
