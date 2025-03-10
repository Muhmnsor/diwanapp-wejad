
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { Document } from "../types/document";
import { useAuthStore } from "@/store/refactored-auth";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

interface DocumentActionsProps {
  document: Document;
  onDownload: (filePath: string, fileName: string) => Promise<void>;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const DocumentActions = ({ document, onDownload, onEdit, onDelete }: DocumentActionsProps) => {
  const { user } = useAuthStore();
  
  return (
    <div className="flex items-center justify-center gap-2">
      {document.file_path && (
        <PermissionGuard 
          moduleAction={{ module: 'documents', action: 'download' }}
          fallback={
            <Button
              variant="ghost"
              size="icon"
              disabled
              title="لا تملك صلاحية التنزيل"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          }
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload(document.file_path!, document.name)}
            title="تحميل"
          >
            <Download className="h-4 w-4" />
          </Button>
        </PermissionGuard>
      )}
      
      <PermissionGuard moduleAction={{ module: 'documents', action: 'edit' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(document)}
          title="تعديل"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      
      <PermissionGuard moduleAction={{ module: 'documents', action: 'delete' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(document)}
          title="حذف"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </PermissionGuard>
    </div>
  );
};
