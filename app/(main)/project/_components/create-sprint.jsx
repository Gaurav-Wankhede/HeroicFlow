"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import { sprintSchema } from "@/app/lib/validators";
import useFetch from "@/hooks/use-fetch";
import { createSprint } from "@/actions/sprints";
import { useTheme } from "next-themes";

export default function SprintCreationForm({
  projectTitle,
  projectKey,
  projectId,
  sprintKey,
}) {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 14),
  });
  const router = useRouter();
  const { loading: createSprintLoading, fn: createSprintFn } = useFetch(createSprint);
  const { theme } = useTheme();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: `${projectKey}-${sprintKey}`,
      startDate: dateRange.from,
      endDate: dateRange.to,
    },
  });

  const onSubmit = async (data) => {
    try {
      await createSprintFn(projectId, {
        ...data,
        startDate: dateRange.from,
        endDate: dateRange.to,
      });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create sprint:", error);
    }
  };

  useEffect(() => {
    const handleChunkError = (event) => {
      if (event.message.includes('Loading chunk')) {
        console.error('Chunk loading error:', event);
        router.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, [router]);

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold mb-8 mt-10 text-gray-900 dark:text-white">
          {projectTitle}
        </h1>
        <Button
          className="mt-10"
          onClick={() => setShowForm(!showForm)}
          variant={!showForm ? "secondary" : "destructive"}
        >
          {!showForm ? "Create New Sprint" : "Cancel"}
        </Button>
      </div>
      {showForm && (
        <Card className="pt-4 mb-4">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Sprint Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700"
                />
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Sprint Duration
                </label>
                <Controller
                  control={control}
                  name="dateRange"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !dateRange && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                            : <span>Pick a date</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DayPicker
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                            ...{
                              day_range_start: "bg-primary text-primary-foreground",
                              day_range_end: "bg-primary text-primary-foreground",
                            },
                          }}
                          components={{
                            IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                            IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                          }}
                          mode="range"
                          disabled={[{ before: new Date() }]}
                          selected={dateRange}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange(range);
                              field.onChange(range);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={createSprintLoading}
                variant="secondary"
               >
                {createSprintLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Sprint"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}