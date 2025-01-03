import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { CertificateTemplateDialog } from "./CertificateTemplateDialog";
import { CertificateTemplatePreview } from "./preview/CertificateTemplatePreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const CertificateTemplateList = ({ templates }: { templates: any[] }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const handleDelete = async (template: any) => {
    try {
      const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      toast.success('تم حذف القالب بنجاح');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('حدث خطأ أثناء حذف القالب');
    }
  };

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(template)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

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