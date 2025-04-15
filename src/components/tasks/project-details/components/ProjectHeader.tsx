import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Trash, Copy } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Project } from "@/types/workspace";

interface ProjectHeaderProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ProjectHeader = ({ project, onEdit, onDelete, canEdit, canDelete }: ProjectHeaderProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge className={`${getStatusColor(project.status)} capitalize`}>
                {project.status === 'active' ? 'نشط' :
                  project.status === 'completed' ? 'مكتمل' :
                    project.status === 'cancelled' ? 'ملغي' : project.status}
              </Badge>
            </div>

            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div>
                <span className="font-semibold">تاريخ الإنشاء: </span>
                {formatDate(project.created_at)}
              </div>

              {project.start_date && (
                <div>
                  <span className="font-semibold">تاريخ البدء: </span>
                  {formatDate(project.start_date)}
                </div>
              )}

              {project.end_date && (
                <div>
                  <span className="font-semibold">تاريخ الإنتهاء: </span>
                  {formatDate(project.end_date)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 self-start">
            {canEdit && (
              <Button variant="outline" onClick={onEdit} size="sm" className="flex items-center gap-1">
                <FileEdit className="h-4 w-4" />
                تعديل
              </Button>
            )}
            {canDelete && (
              <>
                {showConfirmDelete ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => {
                      onDelete?.();
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
