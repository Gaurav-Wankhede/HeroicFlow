"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function BoardFilters({ issues, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const assignees = issues
    .map((issue) => issue.assignee)
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

  useEffect(() => {
    if (selectedAssignees.length > 0 || selectedPriority !== "" || selectedStatus !== "") {
      onFilterChange({
        assignee: selectedAssignees.length > 0 ? selectedAssignees[0] : null,
        priority: selectedPriority,
        status: selectedStatus,
      });
    }
  }, [selectedAssignees, selectedPriority, selectedStatus, onFilterChange]);

  const toggleAssignee = (assigneeId) => {
    setSelectedAssignees((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((id) => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAssignees([]);
    setSelectedPriority("");
    setSelectedStatus("");
  };

  const isFiltersApplied =
    searchTerm !== "" ||
    selectedAssignees.length > 0 ||
    selectedPriority !== "" ||
    selectedStatus !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col pr-2 sm:flex-row gap-4 sm:gap-6 mt-6">
        <Input
          className="w-full sm:w-72 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {assignees.map((assignee, i) => {
              const selected = selectedAssignees.includes(assignee.id);

              return (
                <div
                  key={assignee.id}
                  className={`rounded-full ring ${
                    selected ? "ring-blue-600 dark:ring-blue-400" : "ring-gray-300 dark:ring-gray-600"
                  } ${i > 0 ? "-ml-6" : ""}`}
                  style={{
                    zIndex: i,
                  }}
                  onClick={() => toggleAssignee(assignee.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignee.imageUrl} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">{assignee.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </div>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-52 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority} className="text-gray-900 dark:text-gray-100">
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltersApplied && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}