
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { Document } from "../types/document";
import { useAuthStore } from "@/store/authStore";

interface DocumentActionsProps {
  document: Document;
  onDownload: (filePath: string, fileName: string) => Promise<void>;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const DocumentActions = ({ document, onDownload, onEdit, onDelete }: DocumentActionsProps) => {
  const { user } = useAuthStore();
  
  // التحقق من صلاحيات المستخدم
  const isAdmin = user?.isAdmin || false;
  const isDocumentsManager = user?.role === 'documents_manager';
  const hasEditPermission = isAdmin || isDocumentsManager;

  return (
    <div className="flex items-center justify-center gap-2">
      {document.file_path && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDownload(document.file_path!, document.name)}
          title="تحميل"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      {hasEditPermission && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(document)}
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(document)}
            title="حذف"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </>
      )}
    </div>
  );
};
