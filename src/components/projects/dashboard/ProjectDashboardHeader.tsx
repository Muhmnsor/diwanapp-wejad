import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectDashboardHeaderProps {
  onAddEvent: () => void;
}

export const ProjectDashboardHeader = ({ onAddEvent }: ProjectDashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold">فعاليات وأنشطة المشروع</h3>
      <Button onClick={onAddEvent} className="gap-2">
        <Plus className="w-4 h-4" />
        إضافة فعالية
      </Button>
    </div>
  );
};