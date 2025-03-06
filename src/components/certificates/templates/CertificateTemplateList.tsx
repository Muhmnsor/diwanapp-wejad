
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash, Copy, Archive, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CertificateTemplateDialog } from "./CertificateTemplateDialog";
import { CertificateTemplatePreview } from "./preview/CertificateTemplatePreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const CertificateTemplateList = ({ templates }: { templates: any[] }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async (template: any) => {
    if (!confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      toast.success('تم حذف القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('حدث خطأ أثناء حذف القالب');
    }
  };

  const handleArchive = async (template: any) => {
    try {
      const { error } = await supabase
        .from('certificate_templates')
        .update({ is_archived: !template.is_archived })
        .eq('id', template.id);

      if (error) throw error;
      toast.success(template.is_archived 
        ? 'تم إلغاء أرشفة القالب بنجاح' 
        : 'تم أرشفة القالب بنجاح'
      );
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    } catch (error) {
      console.error('Error archiving template:', error);
      toast.error('حدث خطأ أثناء أرشفة القالب');
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      // Create a new template based on the selected one
      const newTemplate = {
        ...template,
        name: `نسخة من ${template.name}`,
        id: undefined, // Remove the ID to create a new entry
        created_at: undefined, // Remove timestamp to let DB generate new one
        updated_at: undefined, // Remove timestamp to let DB generate new one
      };
      
      delete newTemplate.id;
      delete newTemplate.created_at;
      delete newTemplate.updated_at;

      const { error } = await supabase
        .from('certificate_templates')
        .insert([newTemplate]);

      if (error) throw error;
      toast.success('تم نسخ القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('حدث خطأ أثناء نسخ القالب');
    }
  };

  return (
    <div className="space-y-4">
      {templates.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">لا توجد قوالب. قم بإضافة قالب جديد.</p>
        </div>
      ) : (
        templates.map((template) => (
          <div
            key={template.id}
            className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg ${
              template.is_archived ? "bg-muted/30" : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{template.name}</h3>
                {template.is_archived && (
                  <Badge variant="outline" className="bg-muted">مؤرشف</Badge>
                )}
                {template.category && template.category !== 'عام' && (
                  <Badge variant="secondary">{template.category}</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
            
            <div className="flex gap-2 mt-3 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsPreviewDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ القالب
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchive(template)}>
                    <Archive className="h-4 w-4 ml-2" />
                    {template.is_archived ? 'إلغاء الأرشفة' : 'أرشفة القالب'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(template)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="h-4 w-4 ml-2" />
                    حذف القالب
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}

      {selectedTemplate && (
        <>
          <CertificateTemplateDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            template={selectedTemplate}
          />
          <CertificateTemplatePreview
            open={isPreviewDialogOpen}
            onOpenChange={setIsPreviewDialogOpen}
            template={selectedTemplate}
          />
        </>
      )}
    </div>
  );
};
