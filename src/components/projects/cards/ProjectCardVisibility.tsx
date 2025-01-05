import { EyeOff } from "lucide-react";

interface ProjectCardVisibilityProps {
  isVisible: boolean;
}

export const ProjectCardVisibility = ({ isVisible }: ProjectCardVisibilityProps) => {
  if (isVisible) return null;
  
  return (
    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
      <EyeOff className="w-4 h-4" />
      مخفي
    </div>
  );
};