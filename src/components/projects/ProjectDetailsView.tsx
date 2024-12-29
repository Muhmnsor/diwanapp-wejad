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
      <ProjectImage imageUrl={project.image_url} title={project.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ProjectTitle
            title={project.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          <ProjectContent 
            project={project}
          />
        </div>
      </div>
    </div>
  );
};