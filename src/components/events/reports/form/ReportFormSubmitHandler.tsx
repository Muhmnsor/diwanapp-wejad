import { supabase } from "@/integrations/supabase/client";
import { EventReportFormData } from "@/types/eventReport";

export const submitReport = async (
  data: EventReportFormData,
  eventId: string,
  executorId?: string
) => {
  console.log('Submitting report:', { data, eventId, executorId });
  
  const { error } = await supabase
    .from('event_reports')
    .insert({
      event_id: eventId,
      executor_id: executorId,
      program_name: data.program_name,
      report_name: data.report_name,
      report_text: data.report_text,
      detailed_description: data.detailed_description,
      duration: data.duration,
      attendees_count: data.attendees_count,
      objectives: data.objectives,
      impact_on_participants: data.impact_on_participants,
      photos: data.photos,
    });

  if (error) {
    console.error('Error submitting report:', error);
    throw error;
  }

  console.log('Report submitted successfully');
};