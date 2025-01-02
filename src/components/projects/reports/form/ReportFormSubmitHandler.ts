import { supabase } from "@/integrations/supabase/client";
import { ProjectReportFormData } from "@/types/projectReport";

export const submitReport = async (
  data: ProjectReportFormData,
  projectId: string,
  activityId: string,
  executorId?: string
) => {
  console.log('Submitting project report:', { data, projectId, activityId, executorId });
  
  const { error } = await supabase
    .from('project_activity_reports')
    .insert({
      project_id: projectId,
      activity_id: activityId,
      executor_id: executorId,
      program_name: data.program_name,
      report_name: data.report_name,
      report_text: data.report_text,
      detailed_description: data.detailed_description,
      activity_duration: data.activity_duration,
      attendees_count: data.attendees_count,
      activity_objectives: data.activity_objectives,
      impact_on_participants: data.impact_on_participants,
      photos: data.photos,
    });

  if (error) {
    console.error('Error submitting report:', error);
    throw error;
  }

  console.log('Project report submitted successfully');
};