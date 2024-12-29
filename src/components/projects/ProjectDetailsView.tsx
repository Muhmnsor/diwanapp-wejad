import { useState } from "react";
import { Project } from "@/types/project";
import { ProjectContent } from "./ProjectContent";
import { ProjectImage } from "./ProjectImage";
import { ProjectTitle } from "./ProjectTitle";

interface ProjectDetailsViewProps {
  project: Project;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  id: string;
}

export const ProjectDetailsView = ({
  project,
  isAdmin,
  onEdit,
  onDelete,
  id
}: ProjectDetailsViewProps) => {
  console.log('ProjectDetailsView - User is admin:', isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ProjectTitle
            title={project.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 md:order-2">
              <ProjectContent 
                project={project}
              />
            </div>
            
            <div className="md:w-1/2 md:order-1">
              <ProjectImage 
                imageUrl={project.image_url} 
                title={project.title} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};