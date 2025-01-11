import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SelectField } from "@/components/events/form/fields/SelectField";

interface TaskDialogProps {
  projectId: string;
  onSuccess: () => void;
}

export const TaskDialog = ({ projectId, onSuccess }: TaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: projectId,
          title,
          description,
          status
        }]);

      if (error) throw error;

      toast.success("تم إضافة المهمة بنجاح");
      setOpen(false);
      onSuccess();
      setTitle("");
      setDescription("");
      setStatus("pending");
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتمل" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المهمة</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <SelectField
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};