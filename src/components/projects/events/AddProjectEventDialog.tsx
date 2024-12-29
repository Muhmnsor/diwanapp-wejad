import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddProjectEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

interface ProjectEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  special_requirements?: string;
}

export const AddProjectEventDialog = ({
  open,
  onOpenChange,
  projectId,
  onSuccess
}: AddProjectEventDialogProps) => {
  const form = useForm<ProjectEventFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      location_url: "",
      special_requirements: ""
    }
  });

  const onSubmit = async (data: ProjectEventFormData) => {
    try {
      console.log('Creating new project event:', data);
      
      // First, create the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          location_url: data.location_url,
          special_requirements: data.special_requirements,
          event_type: 'in-person',
          max_attendees: 0,
          image_url: '/placeholder.svg',
          beneficiary_type: 'both'
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Then, link it to the project
      const { error: linkError } = await supabase
        .from('project_events')
        .insert([{
          project_id: projectId,
          event_id: eventData.id,
          event_order: 0
        }]);

      if (linkError) throw linkError;

      toast.success('تم إضافة الفعالية بنجاح');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating project event:', error);
      toast.error('حدث خطأ أثناء إضافة الفعالية');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة فعالية جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الفعالية</FormLabel>
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
                  <FormLabel>وصف الفعالية</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
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
                    <FormLabel>الوقت</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المكان</FormLabel>
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
                  <FormLabel>رابط المكان (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" placeholder="https://maps.google.com/..." />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>احتياجات خاصة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="أي متطلبات أو احتياجات خاصة للفعالية..." />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button type="submit">إضافة الفعالية</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};