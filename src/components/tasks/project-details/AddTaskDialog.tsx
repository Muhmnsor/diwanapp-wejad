import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | undefined;
  projectStages: { id: string; name: string }[];
  onSuccess: () => void;
}

type TaskFormData = {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  stageId: string;
  assignedTo: string;
};

export const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  projectId,
  projectStages,
  onSuccess 
}: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormSubmit = async (formData: TaskFormData) => {
    if (!projectId) {
      toast.error("معرف المشروع غير موجود");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the task
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: formData.title,
          description: formData.description,
          status: "pending",
          priority: formData.priority,
          due_date: formData.dueDate,
          project_id: projectId,
          stage_id: formData.stageId,
          assigned_to: formData.assignedTo,
          workspace_id: null
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        toast.error("حدث خطأ أثناء إنشاء المهمة");
        return;
      }

      toast.success("تم إنشاء المهمة بنجاح");
      
      // Update project status to in_progress if it was previously completed
      // since adding a new task means the project is no longer complete
      const { data: projectData, error: projectError } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('id', projectId)
        .single();
        
      if (!projectError && projectData && projectData.status === 'completed') {
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ status: 'in_progress' })
          .eq('id', projectId);
          
        if (updateError) {
          console.error("Error updating project status:", updateError);
        }
      }
      
      // Reset the form and close the dialog
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>إضافة مهمة جديدة</AlertDialogTitle>
          <AlertDialogDescription>
            أدخل تفاصيل المهمة لإنشائها في المشروع الحالي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">عنوان المهمة</Label>
            <Input 
              type="text" 
              id="name" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">وصف المهمة</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="stage">المرحلة</Label>
            <Select onValueChange={(value) => setStageId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المرحلة" />
              </SelectTrigger>
              <SelectContent>
                {projectStages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">الأولوية</Label>
            <Select onValueChange={(value) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due-date">تاريخ التسليم</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>اختر تاريخ التسليم</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assigned-to">تعيين إلى</Label>
            <Input
              type="text"
              id="assigned-to"
              placeholder="اسم المستخدم أو البريد الإلكتروني"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <Button 
            type="submit" 
            onClick={() => handleFormSubmit({
              title,
              description,
              status: "pending",
              priority,
              dueDate,
              stageId,
              assignedTo
            })}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإنشاء..." : "إنشاء"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
