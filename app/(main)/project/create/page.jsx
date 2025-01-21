"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { projectSchema } from "@/app/lib/validators";
import { createProject } from "@/actions/projects";
import { BarLoader } from "react-spinners";
import OrgSwitcher from "@/components/org-switcher";
import { useTheme } from "next-themes";

export default function CreateProjectPage() {
  const router = useRouter();
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded && membership) {
      setIsAdmin(membership.role === "org:admin");
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  const {
    loading,
    error,
    data: project,
    fn: createProjectFn,
  } = useFetch(createProject);

  const onSubmit = async (data) => {
    if (!isAdmin) {
      alert("Only organization admins can create projects");
      return;
    }

    createProjectFn(data);
  };

  useEffect(() => {
    if (project) router.push(`/project/${project.id}`);
  }, [loading]);

  if (!isOrgLoaded || !isUserLoaded) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Create a New Project
        </h1>

        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Organization</h2>
          <OrgSwitcher className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
        </div>

        {!isAdmin ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-300">
            You need admin privileges to create a project.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-200">
                Project Name
              </label>
              <Input
                {...register("name")}
                className="w-full bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-200">
                Description
              </label>
              <Textarea
                {...register("description")}
                className="w-full bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter project description"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <BarLoader color={theme === 'dark' ? '#ffffff' : '#000000'} width={100} height={4} />
              ) : (
                'Create Project'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
