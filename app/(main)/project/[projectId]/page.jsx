import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";

export default async function ProjectPage({ params }) {
  const { projectId } = params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto">
      <SprintCreationForm
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
      />

      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            No sprints available yet
          </p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create a Sprint using the button above to get started
          </p>
        </div>
      )}
    </div>
  );
}