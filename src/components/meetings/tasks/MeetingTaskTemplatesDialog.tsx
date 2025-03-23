
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeetingTask } from "@/types/meeting";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeetingTaskTemplateType {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface MeetingTaskTemplatesDialogProps {
  task: MeetingTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingTaskTemplatesDialog = ({
  task,
  open,
  onOpenChange
}: MeetingTaskTemplatesDialogProps) => {
  const [templates, setTemplates] = useState<MeetingTaskTemplateType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    if (!task?.id) return;
    setIsLoading(true);
    console.log("Fetching templates for meeting task:", task.id);
    
    try {
      // Try to fetch from unified_task_attachments 
      const { data: unifiedData, error: unifiedError } = await supabase
        .from('unified_task_attachments')
        .select('*')
        .eq('task_id', task.id)
        .eq('attachment_category', 'template')
        .eq('task_table', 'meeting_tasks')
        .order('created_at', { ascending: false });
        
      if (unifiedError) {
        console.error('Error fetching from unified_task_attachments:', unifiedError);
      } else {
        console.log(`Found ${unifiedData?.length || 0} templates in unified_task_attachments:`, unifiedData);
      }
      
      // Also fetch from task_templates 
      const { data: templateData, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('task_id', task.id)
        .eq('task_table', 'meeting_tasks')
        .order('created_at', { ascending: false });
        
      if (templateError) {
        console.error('Error fetching from task_templates:', templateError);
      } else {
        console.log(`Found ${templateData?.length || 0} templates in task_templates:`, templateData);
      }
      
      // Combine results from both sources
      const combinedTemplates = [
        ...(unifiedData || []),
        ...(templateData || [])
      ];
      
      // Remove duplicates based on file_url
      const uniqueTemplates = combinedTemplates.filter(
        (template, index, self) => 
          index === self.findIndex(t => t.file_url === template.file_url)
      );
      
      console.log(`Total unique templates found: ${uniqueTemplates.length}`);
      setTemplates(uniqueTemplates);
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && task) {
      fetchTemplates();
    }
  }, [open, task]);

  const handleDownloadTemplate = (template: MeetingTaskTemplateType) => {
    if (!template.file_url) {
      toast.error('رابط النموذج غير متوفر');
      return;
    }
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = template.file_url;
    link.target = '_blank';
    link.download = template.file_name || `template-${template.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('جاري تنزيل النموذج');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">نماذج المهمة</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{task.title}</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-4">جاري تحميل النماذج...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              لا توجد نماذج متاحة لهذه المهمة
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className="p-3 border rounded-md flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">{template.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(template.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    <FileDown className="h-4 w-4 ml-1" />
                    تنزيل
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
