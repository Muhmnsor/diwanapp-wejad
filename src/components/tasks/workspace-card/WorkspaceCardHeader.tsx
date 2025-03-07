
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
  return (
    <>
      <div className="mb-3 flex justify-between items-start">
        <h3 className="font-bold text-lg">{name}</h3>
        
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 ml-2" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
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
