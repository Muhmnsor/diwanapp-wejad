
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventReportFormValues, Photo } from "@/components/events/reports/types";
import { toast } from "sonner";

export const useReportForm = (
  eventId: string,
  initialData?: EventReportFormValues & { id: string },
  onClose?: () => void,
  mode: 'create' | 'edit' = 'create'
) => {
  const [photos, setPhotos] = useState<Photo[]>(Array(6).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<EventReportFormValues>({
    defaultValues: initialData || {
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
    if (mode === 'edit' && initialData?.id) {
      console.log('Initializing edit mode with data:', initialData);
      if (initialData.photos && initialData.photo_descriptions) {
        const newPhotos = Array(6).fill(null);
        initialData.photos.forEach((url: string, index: number) => {
          if (url) {
            console.log('Setting photo at index:', index, 'URL:', url);
            newPhotos[index] = {
              url,
              description: initialData.photo_descriptions[index] || ''
            };
          }
        });
        console.log('Setting photos state:', newPhotos);
        setPhotos(newPhotos);
      }
    } else if (!initialData) {
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
  }, [eventId, form, initialData, mode]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      console.log("Current photos state:", photos);

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

      const validPhotos = photos.filter(p => p && p.url);
      console.log("Valid photos for submission:", validPhotos);

      const reportData = {
        ...values,
        event_id: eventId,
        executor_id: currentUser,
        photos: validPhotos.map(p => p.url),
        photo_descriptions: validPhotos.map(p => p.description),
        execution_date: eventData.date,
        execution_time: eventData.time,
        links: values.links.split('\n').filter(Boolean),
        partners: values.partners
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
      onClose?.();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(mode === 'edit' ? "حدث خطأ أثناء تحديث التقرير" : "حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    photos,
    setPhotos,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit)
  };
};
