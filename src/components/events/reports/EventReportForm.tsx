
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
import { EventReportFormValues, Photo } from "./types";
import { useQueryClient } from "@tanstack/react-query";

interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
}

export const EventReportForm: React.FC<EventReportFormProps> = ({ eventId, onClose }) => {
  const [photos, setPhotos] = useState<Photo[]>(Array(6).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
      partners: "",
      links: ""
    }
  });

  useEffect(() => {
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
  }, [eventId, form]);

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
      console.log("Starting report submission with user:", currentUser);

      if (!currentUser) {
        console.error("No user found when submitting report");
        toast.error("يجب تسجيل الدخول لإنشاء تقرير");
        return;
      }

      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', currentUser)
        .single();

      console.log("Profile check result:", profileCheck);

      if (profileError || !profileCheck) {
        console.error("Profile check error:", profileError);
        toast.error("حدث خطأ في التحقق من الملف الشخصي");
        return;
      }

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("date, time")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      const reportData = {
        ...values,
        event_id: eventId,
        executor_id: currentUser,
        photos: photos.filter(Boolean).map(p => p.url),
        photo_descriptions: photos.filter(Boolean).map(p => p.description),
        execution_date: eventData.date,
        execution_time: eventData.time,
        links: values.links.split('\n').filter(Boolean),
        partners: values.partners
      };

      console.log("Submitting report with data:", reportData);

      const { error: insertError } = await supabase
        .from("event_reports")
        .insert(reportData);

      if (insertError) {
        console.error("Error inserting report:", insertError);
        throw insertError;
      }

      await queryClient.invalidateQueries({ queryKey: ["event-reports", eventId] });
      
      toast.success("تم إضافة التقرير بنجاح");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
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
        <ReportFormActions isSubmitting={isSubmitting} onClose={onClose} />
      </form>
    </Form>
  );
};
