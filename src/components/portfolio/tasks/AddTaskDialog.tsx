import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange,
  workspaceId,
  onSuccess 
}: AddTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First create task in Asana
      const { data: asanaResponse, error: asanaError } = await supabase.functions.invoke('create-asana-task', {
        body: {
          workspaceId,
          title,
          description,
          dueDate,
          priority
        }
      });

      if (asanaError) {
        console.error('Error creating task in Asana:', asanaError);
        toast.error('حدث خطأ أثناء إنشاء المهمة في Asana');
        throw asanaError;
      }

      console.log('Successfully created task in Asana:', asanaResponse);

      // Then get the workspace UUID from Asana GID
      const { data: workspace, error: workspaceError } = await supabase
        .from('portfolio_workspaces')
        .select('id')
        .eq('asana_gid', workspaceId)
        .single();

      if (workspaceError) {
        console.error('Error fetching workspace:', workspaceError);
        toast.error('حدث خطأ أثناء إنشاء المهمة');
        throw workspaceError;
      }

      if (!workspace) {
        console.error('Workspace not found');
        toast.error('لم يتم العثور على مساحة العمل');
        return;
      }

      console.log('Creating new portfolio task:', {
        workspace_id: workspace.id,
        title,
        description,
        due_date: dueDate,
        priority,
        asana_gid: asanaResponse.gid
      });

      // Create task in our database
      const { error: createError } = await supabase
        .from('portfolio_tasks')
        .insert([
          {
            workspace_id: workspace.id,
            title,
            description,
            due_date: dueDate,
            priority,
            status: 'pending',
            asana_gid: asanaResponse.gid
          }
        ]);

      if (createError) {
        console.error('Error creating task:', createError);
        toast.error('حدث خطأ أثناء إنشاء المهمة في قاعدة البيانات');
        throw createError;
      }

      toast.success('تم إنشاء المهمة بنجاح');
      onSuccess();
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('حدث خطأ أثناء إنشاء المهمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">إضافة مهمة جديدة</h2>
            <p className="text-sm text-gray-500">أدخل تفاصيل المهمة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان المهمة</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المهمة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة"
                className="h-32"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الاستحقاق</Label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={priority} onValueChange={setPriority}>
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

            <div className="flex justify-start gap-2 mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};