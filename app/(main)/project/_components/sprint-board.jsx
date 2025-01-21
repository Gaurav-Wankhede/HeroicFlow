"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import useFetch from "@/hooks/use-fetch";

import statuses from "@/data/status";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";

import SprintManager from "./sprint-manager";
import IssueCreationDrawer from "./create-issue";
import IssueCard from "@/components/issue-card";
import BoardFilters from "./board-filters";

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function SprintBoard({ sprints = [], projectId, orgId }) {
  const [currentSprint, setCurrentSprint] = useState(
    sprints?.find((spr) => spr.status === "ACTIVE") || sprints?.[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch(getIssuesForSprint);

  const [filteredIssues, setFilteredIssues] = useState(issues);

  const {
    fn: updateIssueOrderFn,
    loading: updateIssuesLoading,
    error: updateIssuesError,
  } = useFetch(updateIssueOrder);

  useEffect(() => {
    if (currentSprint?.id) {
      fetchIssues(currentSprint.id);
    }
  }, [currentSprint?.id]);

  const handleFilterChange = (newFilteredIssues) => {
    setFilteredIssues(newFilteredIssues);
  };

  const handleAddIssue = (status) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {
    fetchIssues(currentSprint.id);
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    if (currentSprint?.status === "PLANNED") {
      toast.warning("Start the sprint to update board");
      return;
    }
    if (currentSprint?.status === "COMPLETED") {
      toast.warning("Cannot update board after sprint end");
      return;
    }

    const newOrderedData = [...issues];
    const sourceList = newOrderedData.filter(list => list.status === source.droppableId);
    const destinationList = newOrderedData.filter(list => list.status === destination.droppableId);

    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorder(sourceList, source.index, destination.index);
      reorderedCards.forEach((card, i) => { card.order = i; });
    } else {
      const [movedCard] = sourceList.splice(source.index, 1);
      movedCard.status = destination.droppableId;
      destinationList.splice(destination.index, 0, movedCard);
      sourceList.forEach((card, i) => { card.order = i; });
      destinationList.forEach((card, i) => { card.order = i; });
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    setIssues(newOrderedData, sortedIssues);
    updateIssueOrderFn(sortedIssues);
  };

  if (issuesError) return <div>Error loading issues</div>;

  return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={sprints}
        projectId={projectId}
      />
      {issues && !issuesLoading && (
        <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
      )}
      {updateIssuesError && (
        <p className="text-red-500 mt-2">{updateIssuesError.message}</p>
      )}
      {(updateIssuesLoading || issuesLoading) && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          {statuses.map((column) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 bg-white dark:bg-slate-700 p-4 rounded-md shadow-sm"
                >
                  <h3 className="font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">
                    {column.name}
                  </h3>
                  {filteredIssues
                    ?.filter((issue) => issue.status === column.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                        isDragDisabled={updateIssuesLoading}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 dark:bg-slate-600 rounded-md shadow-sm"
                          >
                            <IssueCard
                              issue={issue}
                              onDelete={() => fetchIssues(currentSprint.id)}
                              onUpdate={(updated) =>
                                setIssues((issues) =>
                                  issues.map((issue) =>
                                    issue.id === updated.id ? updated : issue
                                  )
                                )
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {column.key === "TODO" && currentSprint?.status !== "COMPLETED" && (
                    <Button
                      variant="ghost"
                      className="w-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                      onClick={() => handleAddIssue(column.key)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Issue
                    </Button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprint?.id}
        status={selectedStatus}
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
}