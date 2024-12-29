import { Button } from "@/components/ui/button";
import { ShareButton } from "../events/ShareButton";
import { Edit2, Trash2 } from "lucide-react";

interface ProjectTitleProps {
  title: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectTitle = ({
  title,
  isAdmin,
  onEdit,
  onDelete,
}: ProjectTitleProps) => {
  console.log('ProjectTitle - isAdmin:', isAdmin);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 gap-4" dir="rtl">
      <h1 className="text-2xl md:text-[32px] leading-tight font-semibold text-[#1A1F2C] order-1">{title}</h1>
      <div className="flex gap-2 order-2 flex-wrap">
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onEdit}
              className="w-8 h-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDelete}
              className="w-8 h-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <ShareButton url={window.location.href} title={title} />
      </div>
    </div>
  );
};