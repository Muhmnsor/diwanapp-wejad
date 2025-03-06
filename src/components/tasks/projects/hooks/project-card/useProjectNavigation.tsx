
import { useNavigate } from "react-router-dom";

export const useProjectNavigation = (projectId: string) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-actions')) {
      e.stopPropagation();
      return;
    }
    navigate(`/tasks/project/${projectId}`);
  };

  return {
    handleClick
  };
};
