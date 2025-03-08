
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Trash, Users } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Workspace } from "@/types/workspace";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageMembers?: () => void;
}

export const WorkspaceHeader = ({ 
  workspace, 
  onEdit, 
  onDelete,
  onManageMembers
}: WorkspaceHeaderProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              <Badge className={`${getStatusColor(workspace.status)} capitalize`}>
                {workspace.status === 'active' ? 'نشطة' : 'غير نشطة'}
              </Badge>
            </div>
            
            {workspace.description && (
              <p className="text-gray-600">{workspace.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div>
                <span className="font-semibold">تاريخ الإنشاء: </span>
                {formatDate(workspace.created_at)}
              </div>
              
              <div>
                <span className="font-semibold">عدد المهام: </span>
                {workspace.total_tasks || 0}
              </div>
              
              <div>
                <span className="font-semibold">المهام المكتملة: </span>
                {workspace.completed_tasks || 0}
              </div>
              
              {workspace.members_count !== undefined && (
                <div>
                  <span className="font-semibold">الأعضاء: </span>
                  {workspace.members_count}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 self-start">
            {onManageMembers && (
              <Button variant="outline" onClick={onManageMembers} size="sm" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                إدارة الأعضاء
              </Button>
            )}
            
            {onEdit && (
              <Button variant="outline" onClick={onEdit} size="sm" className="flex items-center gap-1">
                <FileEdit className="h-4 w-4" />
                تعديل
              </Button>
            )}
            
            {onDelete && (
              <>
                {showConfirmDelete ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => {
                      onDelete();
                      setShowConfirmDelete(false);
                    }}>
                      تأكيد الحذف
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowConfirmDelete(false)}>
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                    size="sm"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    حذف
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
