
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ReportPhotoUpload } from "./components/ReportPhotoUpload";
import { ReportMetricsFields } from "./components/ReportMetricsFields";
import { ReportBasicFields } from "./components/ReportBasicFields";
import { ReportDescriptionFields } from "./components/ReportDescriptionFields";
import { ReportFeedbackComments } from "./components/ReportFeedbackComments";
import { ReportFormActions } from "./components/ReportFormActions";
import { EventReportFormValues, EventReportFormProps, Photo } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { photoPlaceholders } from "@/utils/reports/constants";

export const EventReportForm: React.FC<EventReportFormProps> = ({ 
  eventId, 
  onClose,
  initialData,
  mode = 'create'
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<EventReportFormValues>({
    defaultValues: {
      ...(initialData || {
        report_name: "",
        report_text: "",
        objectives: "",
        impact_on_participants: "",
        speaker_name: "",
        attendees_count: 0,
        absent_count: 0,
        satisfaction_level: 0,
        partners: "",
        links: "",
        photos: [],
        photo_descriptions: []
      })
    }
  });

  useEffect(() => {
    if (initialData?.photos?.length) {
      const processedPhotos = initialData.photos
        .filter((photo): photo is NonNullable<typeof photo> => photo !== null)
        .map((photo, index) => {
          let url: string;
          if (typeof photo === 'string') {
            try {
              const parsed = JSON.parse(photo);
              url = parsed.url || '';
            } catch {
              url = photo;
            }
          } else if (typeof photo === 'object' && photo !== null) {
            url = 'url' in photo ? photo.url : '';
          } else {
            url = '';
          }
          
          return {
            url,
            description: initialData.photo_descriptions?.[index] || photoPlaceholders[index],
            index
          };
        });
      console.log("Processed photos:", processedPhotos);
      setPhotos(processedPhotos);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      const fetchEventTitle = async () => {
        const { data: event } = await supabase
          .from("events")
          .select("title")
          .eq("id", eventId)
          .single();

        if (event) {
          form.setValue("report_name", `تقرير فعالية ${event.title}`);
        }
      };

      fetchEventTitle();
    }
  }, [eventId, form, initialData]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
      if (user) {
        setCurrentUser(user.id);
      }
    };

    getCurrentUser();
  }, []);

  const onSubmit = async (values: EventReportFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!currentUser) {
        toast.error("يجب تسجيل الدخول لإنشاء تقرير");
        return;
      }

      const validPhotos = photos.filter(p => p.url);
      const reportData = {
        ...values,
        event_id: eventId,
        executor_id: currentUser,
        photos: validPhotos.map(p => p.url),
        photo_descriptions: validPhotos.map(p => p.description),
        links: values.links.split('\n').filter(Boolean)
      };

      if (mode === 'edit' && initialData?.id) {
        const { error: updateError } = await supabase
          .from("event_reports")
          .update(reportData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        toast.success("تم تحديث التقرير بنجاح");
      } else {
        const { error: insertError } = await supabase
          .from("event_reports")
          .insert(reportData);

        if (insertError) throw insertError;
        toast.success("تم إضافة التقرير بنجاح");
      }

      await queryClient.invalidateQueries({ queryKey: ["event-reports", eventId] });
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(mode === 'edit' ? "حدث خطأ أثناء تحديث التقرير" : "حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ReportBasicFields form={form} />
        <ReportDescriptionFields form={form} />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="partners"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الشركاء (إن وجد)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="أدخل أسماء الشركاء المشاركين في الفعالية"
                    className="resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links"
            render={({ field }) => (
              <FormItem>
                <FormLabel>روابط</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="أدخل الروابط (رابط واحد في كل سطر)"
                    className="resize-none"
                    rows={3}
                    dir="ltr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ReportMetricsFields form={form} eventId={eventId} />
        <ReportPhotoUpload photos={photos} onPhotosChange={setPhotos} />
        <ReportFeedbackComments eventId={eventId} />
        <ReportFormActions 
          isSubmitting={isSubmitting} 
          onClose={onClose}
          mode={mode} 
        />
      </form>
    </Form>
  );
};
