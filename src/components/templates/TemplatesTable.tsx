
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Template } from "./types/template";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { EditTemplateDialog } from "./EditTemplateDialog";
import { DeleteTemplateDialog } from "./DeleteTemplateDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplatesTableProps {
  templates: Template[];
  isLoading: boolean;
  onDownload: (id: string, fileUrl: string, fileName: string) => void;
  onDelete: (id: string, filePath?: string) => void;
  onUpdate: () => void;
}

export const TemplatesTable = ({
  templates,
  isLoading,
  onDownload,
  onDelete,
  onUpdate,
}: TemplatesTableProps) => {
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (template: Template) => {
    setTemplateToEdit(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل النماذج...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-lg">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">لا توجد نماذج</h3>
          <p className="text-muted-foreground mb-4">
            لم يتم العثور على أي نماذج متاحة حاليًا
          </p>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "غير معروف";
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير معروف";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  return (
    <>
      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم النموذج</TableHead>
                <TableHead>الإدارة/الوحدة</TableHead>
                <TableHead>رقم النموذج</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الحجم</TableHead>
                <TableHead>التنزيلات</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.department}</TableCell>
                  <TableCell>{template.template_number}</TableCell>
                  <TableCell>
                    {template.category ? (
                      <Badge variant="outline">{template.category}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatFileSize(template.file_size)}</TableCell>
                  <TableCell>{template.downloads || 0}</TableCell>
                  <TableCell>{formatDate(template.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => template.file_url && onDownload(template.id, template.file_url, template.name)}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ...
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Pencil className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(template)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {templateToEdit && (
        <EditTemplateDialog
          template={templateToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={onUpdate}
        />
      )}

      {templateToDelete && (
        <DeleteTemplateDialog
          template={templateToDelete}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={() => {
            onDelete(templateToDelete.id, templateToDelete.file_path);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}
    </>
  );
};
