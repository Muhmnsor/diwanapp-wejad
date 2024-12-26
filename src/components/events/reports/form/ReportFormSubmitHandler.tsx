import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoWithDescription {
  url: string;
  description: string;
}

interface ReportFormData {
  program_name: string;
  report_name: string;
  report_text: string;
  detailed_description: string;
  event_duration: string;
  attendees_count: string;
  event_objectives: string;
  impact_on_participants: string;
  photos: PhotoWithDescription[];
}

export const submitReport = async (
  data: ReportFormData,
  eventId: string,
  userId: string | undefined
) => {
  try {
    console.log('Submitting report with data:', { ...data, eventId, executorId: userId });
    
    const { error } = await supabase
      .from('event_reports')
      .insert([
        {
          event_id: eventId,
          executor_id: userId,
          program_name: data.program_name,
          report_name: data.report_name,
          report_text: data.report_text,
          detailed_description: data.detailed_description,
          event_duration: data.event_duration,
          attendees_count: data.attendees_count,
          event_objectives: data.event_objectives,
          impact_on_participants: data.impact_on_participants,
          photos: data.photos.filter(photo => photo.url),
        }
      ]);

    if (error) throw error;

    console.log('Report submitted successfully');
    toast.success("تم إضافة التقرير بنجاح");
    return true;
  } catch (error) {
    console.error('Error in form submission:', error);
    toast.error("حدث خطأ أثناء إرسال التقرير");
    throw error;
  }
};