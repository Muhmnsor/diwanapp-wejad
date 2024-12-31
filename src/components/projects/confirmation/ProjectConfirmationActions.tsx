import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProjectConfirmationActionsProps {
  onClose: () => void;
  hasDownloaded: boolean;
}

export const ProjectConfirmationActions = ({ 
  onClose,
  hasDownloaded 
}: ProjectConfirmationActionsProps) => {
  return (
    <Button 
      variant="outline" 
      className="w-full mt-2"
      onClick={onClose}
    >
      <X className="w-4 h-4 mr-2" />
      إغلاق
    </Button>
  );
};