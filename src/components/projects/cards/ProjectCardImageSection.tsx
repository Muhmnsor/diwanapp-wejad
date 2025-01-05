import { ProjectCardImage } from "./ProjectCardImage";
import { ProjectCardVisibility } from "./ProjectCardVisibility";

interface ProjectCardImageSectionProps {
  imageUrl: string;
  title: string;
  isVisible: boolean;
}

export const ProjectCardImageSection = ({ imageUrl, title, isVisible }: ProjectCardImageSectionProps) => {
  return (
    <div className="relative">
      <ProjectCardImage src={imageUrl} alt={title} />
      <ProjectCardVisibility isVisible={isVisible} />
    </div>
  );
};