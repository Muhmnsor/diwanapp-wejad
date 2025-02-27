
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
      className="text-xs flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      onClick={onClick}
    >
      <Clock size={14} />
      تمديد المناقشة
    </Button>
  );
};
