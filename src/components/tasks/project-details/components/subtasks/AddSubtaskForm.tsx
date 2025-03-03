
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useProjectMembers } from "../../hooks/useProjectMembers";

interface AddSubtaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onSubtaskAdded: () => void;
  projectId: string | undefined;
}

export const AddSubtaskForm = ({ isOpen, onClose, taskId, onSubtaskAdded, projectId }: AddSubtaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projectMembers, isLoading: isMembersLoading } = useProjectMembers(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting subtask:", { 
        title, 
        description, 
        due_date: dueDate, 
        assigned_to: assignedTo,
        parent_task_id: taskId
      });
      
      // Insert the subtask into the database
      const { error } = await supabase
        .from('task_subtasks')
        .insert({
          title,
          description: description || null,
          due_date: dueDate ? dueDate.toISOString() : null,
          assigned_to: assignedTo,
          parent_task_id: taskId
        });
      
      if (error) {
        console.error("Error creating subtask:", error);
        throw error;
      }
      
      onSubtaskAdded();
      handleClose();
    } catch (error) {
      console.error("Error adding subtask:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setAssignedTo(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة مهمة فرعية</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المهمة</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المهمة"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">وصف المهمة</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصفاً للمهمة"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: ar }) : "اختر تاريخاً"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="assignedTo">الشخص المسؤول</Label>
            <Select 
              value={assignedTo || "none"} 
              onValueChange={(value) => setAssignedTo(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <SelectValue placeholder="اختر الشخص المسؤول" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">غير محدد</SelectItem>
                {isMembersLoading ? (
                  <SelectItem value="loading" disabled>جاري تحميل المستخدمين...</SelectItem>
                ) : projectMembers && projectMembers.length > 0 ? (
                  projectMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.user_display_name || member.user_email || 'مستخدم بلا اسم'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-members" disabled>لا يوجد مستخدمين</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { supabase } from "@/integrations/supabase/client";
