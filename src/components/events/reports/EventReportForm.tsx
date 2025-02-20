
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
}

interface EventReportFormValues {
  report_name: string;
  report_text: string;
  objectives: string;
  impact_on_participants: string;
  speaker_name: string;
  attendees_count: number;
  absent_count: number;
  satisfaction_level: number;
}

export const EventReportForm = ({ eventId, onClose }: EventReportFormProps) => {
  const [photos, setPhotos] = useState<{ url: string; description: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventReportFormValues>({
    defaultValues: {
      report_name: "",
      report_text: "",
      objectives: "",
      impact_on_participants: "",
      speaker_name: "",
      attendees_count: 0,
      absent_count: 0,
      satisfaction_level: 0,
    },
  });

  const onSubmit = async (values: EventReportFormValues) => {
    try {
      setIsSubmitting(true);

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("date, time")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      const { error: insertError } = await supabase.from("event_reports").insert({
        ...values,
        event_id: eventId,
        photos: photos.map(p => p.url),
        photo_descriptions: photos.map(p => p.description),
        execution_date: eventData.date,
        execution_time: eventData.time,
      });

      if (insertError) throw insertError;

      toast.success("تم إضافة التقرير بنجاح");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos(prev => [...prev, { url, description: "" }]);
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index].description = description;
      return newPhotos;
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="report_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم التقرير</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="speaker_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المتحدث/المنظم</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="report_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نص التقرير</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>أهداف الفعالية</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact_on_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الأثر على المشاركين</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="attendees_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الحضور</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="absent_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الغائبين</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="satisfaction_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مستوى الرضا (1-5)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={5} 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>صور الفعالية</FormLabel>
          <ImageUpload onChange={handlePhotoUpload} />
          
          {photos.map((photo, index) => (
            <div key={index} className="flex items-start gap-4">
              <img src={photo.url} alt="" className="w-24 h-24 object-cover rounded" />
              <Input
                placeholder="وصف الصورة"
                value={photo.description}
                onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
