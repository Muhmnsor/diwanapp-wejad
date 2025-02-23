
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddIdeaDialog = ({ open, onOpenChange }: AddIdeaDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([
          {
            title,
            description,
            opportunity,
            status: 'draft'
          }
        ]);

      if (error) throw error;

      toast.success("تم إضافة الفكرة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setOpportunity("");
    } catch (error) {
      console.error('Error adding idea:', error);
      toast.error("حدث خطأ أثناء إضافة الفكرة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة فكرة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-right block text-sm font-medium">
              عنوان الفكرة
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-right"
              placeholder="أدخل عنوان الفكرة"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-right block text-sm font-medium">
              وصف الفكرة
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-right min-h-[100px]"
              placeholder="اشرح فكرتك بالتفصيل"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="opportunity" className="text-right block text-sm font-medium">
              الفرصة التي تحققها الفكرة
            </label>
            <Textarea
              id="opportunity"
              value={opportunity}
              onChange={(e) => setOpportunity(e.target.value)}
              className="text-right min-h-[100px]"
              placeholder="اشرح الفرصة التي تحققها فكرتك"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة الفكرة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
