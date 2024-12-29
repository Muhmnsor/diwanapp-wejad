import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { EventBasicFields } from "./form/EventBasicFields";
import { EventDateTimeFields } from "./form/EventDateTimeFields";
import { EventLocationFields } from "./form/EventLocationFields";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EditProjectActivityDialogProps {
  activity: ProjectActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projectId: string;
}

export const EditProjectActivityDialog = ({
  activity,
  open,
  onOpenChange,
  onSave,
  projectId
}: EditProjectActivityDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log('Activity data in EditProjectActivityDialog:', activity);

  const form = useForm({
    defaultValues: {
      title: activity.title || "",
      description: activity.description || "",
      date: activity.date || "",
      time: activity.time || "",
      location: activity.location || "",
      location_url: activity.location_url || "",
      special_requirements: activity.special_requirements || "",
      event_hours: activity.event_hours || 0,
    }
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          location_url: data.location_url,
          special_requirements: data.special_requirements,
          event_hours: data.event_hours,
        })
        .eq('id', activity.id);

      if (error) throw error;

      toast.success("تم تحديث النشاط بنجاح");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error("حدث خطأ أثناء تحديث النشاط");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]" dir="rtl">
        <DialogTitle>تعديل النشاط</DialogTitle>
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <EventBasicFields form={form} />
                <EventDateTimeFields form={form} />
                <EventLocationFields form={form} />
                
                <FormField
                  control={form.control}
                  name="event_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مدة النشاط (بالساعات)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min="0" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      "حفظ التغييرات"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};