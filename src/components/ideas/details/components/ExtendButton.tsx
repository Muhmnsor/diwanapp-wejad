
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ExtendButtonProps {
  onClick: () => void;
}

export const ExtendButton = ({ onClick }: ExtendButtonProps) => {
  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-purple-700 border-purple-200 h-8"
      onClick={onClick}
    >
      <Clock className="h-3.5 w-3.5 ml-1" />
      تمديد
    </Button>
  );
};
