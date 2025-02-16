
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "./EditProjectEventHeader";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditProjectEventDialogProps {
  activity: ProjectActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedActivity: ProjectActivity) => void;
  projectId: string;
}

export const EditProjectEventDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditProjectEventDialogProps) => {
  console.log('Activity data in EditProjectEventDialog:', activity);
  
  const form = useForm({
    defaultValues: {
      title: activity.title || "",
      description: activity.description || "",
      date: activity.date || "",
      time: activity.time || "",
      location: activity.location || "",
      location_url: activity.location_url || "",
      special_requirements: activity.special_requirements || "",
      activity_duration: activity.activity_duration || 0,
    },
  });

  const handleSubmit = async (data: any) => {
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
          event_hours: data.activity_duration,
        })
        .eq('id', activity.id);

      if (error) throw error;

      toast.success("تم تحديث النشاط بنجاح");
      onSave({
        ...activity,
        ...data,
        activity_duration: data.activity_duration
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error("حدث خطأ أثناء تحديث النشاط");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]" dir="rtl">
        <EditProjectEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pr-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان النشاط</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف النشاط</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النشاط</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت النشاط</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموقع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الموقع (قوقل ماب)</FormLabel>
                    <FormControl>
                      <Input dir="ltr" placeholder="https://maps.google.com/..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="special_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>احتياجات خاصة</FormLabel>
                    <FormControl>
                      <Input placeholder="أي متطلبات أو احتياجات خاصة للنشاط..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدة النشاط (بالساعات)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">حفظ التغييرات</Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
