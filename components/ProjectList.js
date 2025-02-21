import React from 'react';
import Link from 'next/link';

const ProjectList = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <Link href={`/projects/${project.id}`}>
            <a className="text-blue-500 hover:text-blue-600">View Project</a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 