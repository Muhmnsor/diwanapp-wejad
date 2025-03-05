
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../../types/task";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TaskTemplateType {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface TaskTemplatesDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskTemplatesDialog = ({
  task,
  open,
  onOpenChange
}: TaskTemplatesDialogProps) => {
  const [templates, setTemplates] = useState<TaskTemplateType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    if (!task?.id) return;
    setIsLoading(true);
    try {
      console.log("Fetching templates for task:", task.id);
      
      // Determine the task table type to ensure we check for the correct task_table value
      let taskTable = 'tasks';
      if (task.is_subtask) {
        taskTable = 'subtasks';
      } else if (task.workspace_id) {
        taskTable = 'portfolio_tasks';
      } else if (task.project_id) {
        taskTable = 'project_tasks';
      }
      
      console.log("Using task table:", taskTable);
      
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('task_id', task.id)
        .eq('task_table', taskTable)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      
      console.log("Templates found:", data);
      setTemplates(data || []);
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

  const handleDownloadTemplate = (template: TaskTemplateType) => {
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
