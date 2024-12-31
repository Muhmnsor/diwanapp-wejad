import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProjectConfirmationActionsProps {
  onClose: () => void;
}

export const ProjectConfirmationActions = ({ onClose }: ProjectConfirmationActionsProps) => {
  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={onClose}
    >
      <X className="w-4 h-4 mr-2" />
      إغلاق
    </Button>
  );
};