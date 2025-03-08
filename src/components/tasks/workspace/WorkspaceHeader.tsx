
import { Button } from "@/components/ui/button";
import { Edit, Users } from "lucide-react";

interface WorkspaceHeaderProps {
  name: string;
  description?: string;
  onEdit?: () => void;
  onManageMembers?: () => void;
}

export const WorkspaceHeader = ({ 
  name, 
  description, 
  onEdit, 
  onManageMembers 
}: WorkspaceHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        {onManageMembers && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onManageMembers}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            إدارة الأعضاء
          </Button>
        )}
        
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
        )}
      </div>
    </div>
  );
};
