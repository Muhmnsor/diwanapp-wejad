
import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface WorkspaceCardHeaderProps {
  name: string;
  description: string | undefined;
  canEdit: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const WorkspaceCardHeader = ({
  name,
  description,
  canEdit,
  onEdit,
  onDelete
}: WorkspaceCardHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(e);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="mb-3 flex justify-between items-start">
        <h3 className="font-bold text-lg">{name}</h3>
        
        {canEdit && (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 focus:ring-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="h-4 w-4 ml-2" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <p className="text-gray-500 mb-4 text-sm line-clamp-2">
        {description || 'لا يوجد وصف'}
      </p>
    </>
  );
};
