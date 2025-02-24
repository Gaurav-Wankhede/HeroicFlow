"use client";

import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organizations";
import { issueSchema } from "@/app/lib/validators";

export default function IssueCreationDrawer({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}) {
  const {
    loading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch(createIssue);

  const {
    loading: usersLoading,
    fn: fetchUsers,
    data: users,
  } = useFetch(getOrganizationUsers);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    },
  });

  useEffect(() => {
    if (isOpen && orgId) {
      fetchUsers(orgId);
    }
  }, [isOpen, orgId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSubmit = async (data) => {
    await createIssueFn(projectId, {
      ...data,
      status,
      sprintId,
    });
  };

  useEffect(() => {
    if (newIssue) {
      reset();
      onClose();
      onIssueCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newIssue, createIssueLoading]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="dark:bg-gray-800">
        <DrawerHeader>
          <DrawerTitle className="dark:text-white">Create New Issue</DrawerTitle>
        </DrawerHeader>
        {usersLoading && <BarLoader width={"100%"} color="#36d7b7" />}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1 dark:text-gray-300">
              Title
            </label>
            <Input id="title" {...register("title")} className="dark:bg-gray-700 dark:text-white" />
            {errors.title && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="assigneeId"
              className="block text-sm font-medium mb-1 dark:text-gray-300"
            >
              Assignee
            </label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {users
                      ?.sort((a, b) => (a.isAdmin === b.isAdmin ? 0 : a.isAdmin ? -1 : 1))
                      .map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          className={`dark:text-white flex items-center justify-between ${
                            user.isAdmin ? "font-medium" : ""
                          }`}
                        >
                          <span>
                            {user?.name}
                            {user.isAdmin && (
                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.assigneeId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 dark:text-gray-300"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor value={field.value} onChange={field.onChange} className="dark:bg-gray-700" />
              )}
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium mb-1 dark:text-gray-300"
            >
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    <SelectItem value="LOW" className="dark:text-white">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="dark:text-white">Medium</SelectItem>
                    <SelectItem value="HIGH" className="dark:text-white">High</SelectItem>
                    <SelectItem value="URGENT" className="dark:text-white">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 mt-2">{error.message}</p>}
          <Button
            type="submit"
            disabled={createIssueLoading}
            className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {createIssueLoading ? "Creating..." : "Create Issue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}