
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

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  workspace_id: string;
  project_manager?: string | null;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newProject = await copyTaskProject(project, {
        newTitle,
        keepAssignees,
        copyTemplates
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
      // Navigate to the new project
      if (newProject && newProject.id) {
        navigate(`/tasks/project/${newProject.id}`);
      }
    } catch (error) {
      console.error("Error copying project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>نسخ المشروع</DialogTitle>
            <DialogDescription>
              سيتم إنشاء نسخة من المشروع مع مهامه في وضع المسودة للتعديل قبل الإطلاق.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">عنوان المشروع الجديد</Label>
              <Input
                id="projectTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="keepAssignees" 
                checked={keepAssignees} 
                onCheckedChange={(checked) => setKeepAssignees(checked as boolean)} 
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
              />
              <Label htmlFor="copyTemplates" className="text-sm cursor-pointer">
                نسخ النماذج المرفقة بالمهام
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row-reverse gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
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
