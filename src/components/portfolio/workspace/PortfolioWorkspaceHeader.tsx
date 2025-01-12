import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PortfolioWorkspaceHeaderProps {
  name: string;
  onCreateProject: () => void;
}

export const PortfolioWorkspaceHeader = ({
  name,
  onCreateProject
}: PortfolioWorkspaceHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{name}</h1>
      <Button 
        onClick={onCreateProject}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        إضافة مشروع
      </Button>
    </div>
  );
};