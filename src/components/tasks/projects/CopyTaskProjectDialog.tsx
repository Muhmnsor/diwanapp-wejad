
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { copyTaskProject } from "./services/copyTaskProject";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  workspace_id: string;
  project_manager?: string | null;
  project_manager_name?: string | null;
  due_date?: string | null;
  status?: string;
  priority?: string;
}

interface CopyTaskProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: TaskProject;
  onSuccess?: () => void;
}

export const CopyTaskProjectDialog = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}: CopyTaskProjectDialogProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState(`نسخة من ${project.title}`);
  const [keepAssignees, setKeepAssignees] = useState(false);
  const [copyTemplates, setCopyTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newProject = await copyTaskProject(project, {
        newTitle,
        keepAssignees,
        copyTemplates
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      toast.success("تم نسخ المشروع بنجاح");
      
      // Close dialog and navigate to the new project
      onClose();
      if (newProject && newProject.id) {
        navigate(`/tasks/project/${newProject.id}`);
      }
    } catch (error) {
      console.error("Error copying project:", error);
      setError("حدث خطأ أثناء نسخ المشروع. يرجى المحاولة مرة أخرى.");
      toast.error("حدث خطأ أثناء نسخ المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Only allow closing if not submitting
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>نسخ المشروع</DialogTitle>
            <DialogDescription>
              سيتم إنشاء نسخة من المشروع مع مهامه في وضع المسودة للتعديل قبل الإطلاق.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">عنوان المشروع الجديد</Label>
              <Input
                id="projectTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="keepAssignees" 
                checked={keepAssignees} 
                onCheckedChange={(checked) => setKeepAssignees(checked as boolean)} 
                disabled={isSubmitting}
              />
              <Label htmlFor="keepAssignees" className="text-sm cursor-pointer">
                الاحتفاظ بالأشخاص المكلفين بالمهام
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="copyTemplates" 
                checked={copyTemplates} 
                onCheckedChange={(checked) => setCopyTemplates(checked as boolean)} 
                disabled={isSubmitting}
              />
              <Label htmlFor="copyTemplates" className="text-sm cursor-pointer">
                نسخ النماذج المرفقة بالمهام
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row-reverse gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || !newTitle.trim()}>
              {isSubmitting ? "جاري النسخ..." : "نسخ المشروع"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
