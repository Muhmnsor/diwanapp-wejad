
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProjectMember } from "./hooks/useProjectMembers";
import { TaskAssigneeField } from "./components/TaskAssigneeField";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: any[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  isDraftProject?: boolean;
}

export const AddTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectStages,
  onTaskAdded,
  projectMembers,
  isGeneral = false,
  isDraftProject = false,
}: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [stageId, setStageId] = useState<string | null>(null);
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isGeneral) {
      fetchCategories();
    }
    
    // Reset form when opened
    if (open) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setStageId(projectStages.length > 0 ? projectStages[0].id : null);
      setPriority("medium");
      setAssignedTo(null);
      setSelectedCategory(null);
    }
  }, [open, isGeneral, projectStages]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching task categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine the initial status based on whether this is a draft project
      const initialStatus = isDraftProject ? "draft" : "pending";
      
      // Create the new task
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description: description || null,
            status: initialStatus,
            due_date: dueDate || null,
            assigned_to: assignedTo,
            project_id: isGeneral ? null : projectId,
            workspace_id: isGeneral ? null : projectId,
            is_general: isGeneral,
            stage_id: isGeneral ? null : stageId,
            priority,
            category: isGeneral ? selectedCategory : null,
          },
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("تمت إضافة المهمة بنجاح");
      onTaskAdded();
      onOpenChange(false);
      
      // Send notification to assigned user if not in draft mode
      if (assignedTo && !isDraftProject) {
        // Get current user info
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's display name or email
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', user.id)
            .single();
            
          const creatorName = creatorProfile?.display_name || creatorProfile?.email || user.email || 'مدير المشروع';
          
          // Send notification to assignee
          await supabase
            .from('in_app_notifications')
            .insert([
              {
                user_id: assignedTo,
                title: 'تم إسناد مهمة جديدة إليك',
                message: `قام ${creatorName} بإسناد مهمة "${title}" إليك`,
                notification_type: 'task_assignment',
                related_entity_id: data?.[0]?.id,
                related_entity_type: 'task',
              },
            ]);
        }
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة {isGeneral ? "عامة" : "جديدة"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المهمة {isGeneral ? "العامة" : ""} أدناه
            {isDraftProject && !isGeneral && (
              <span className="block mt-1 text-blue-600">
                (المهمة ستكون في وضع المسودة حتى يتم إطلاق المشروع)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المهمة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المهمة</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">تاريخ الاستحقاق</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isGeneral ? (
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر فئة المهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون فئة</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="stage">المرحلة</Label>
                <Select value={stageId || ""} onValueChange={setStageId}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <TaskAssigneeField
              assignedTo={assignedTo}
              setAssignedTo={setAssignedTo}
              projectMembers={projectMembers}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة المهمة"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
