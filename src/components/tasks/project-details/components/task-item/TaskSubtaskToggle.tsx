
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TaskSubtaskToggleProps {
  showSubtasks: boolean;
  onToggle: () => void;
}

export const TaskSubtaskToggle = ({ showSubtasks, onToggle }: TaskSubtaskToggleProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="p-0 h-7 w-7 ml-2"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={showSubtasks ? "إخفاء المهام الفرعية" : "عرض المهام الفرعية"}
    >
      {showSubtasks ? 
        <ChevronUp className="h-4 w-4 text-gray-500" /> : 
        <ChevronDown className="h-4 w-4 text-gray-500" />
      }
    </Button>
  );
};
