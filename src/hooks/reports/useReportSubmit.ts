import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReportPhoto } from "@/types/projectReport";

interface ReportFormData {
  reportName: string;
  reportText: string;
  objectives: string;
  impact: string;
}

export const useReportSubmit = (
  projectId: string,
  report: any,
  onSuccess?: () => void
) => {
  const handleSubmit = async (
    e: React.FormEvent,
    {
      selectedActivity,
      photos,
      formData,
      project,
      attendanceCount,
      selectedActivityDetails,
    }: {
      selectedActivity: string | null;
      photos: ReportPhoto[];
      formData: ReportFormData;
      project: any;
      attendanceCount: number;
      selectedActivityDetails: any;
    }
  ) => {
    e.preventDefault();
    console.log('ReportForm - Handling submit. Is update?:', !!report);
    
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط");
      return;
    }

    if (!formData.reportName.trim()) {
      toast.error("الرجاء إدخال اسم التقرير");
      return;
    }

    try {
      // Prepare photos array for submission
      const validPhotos = photos
        .map((photo, index) => {
          if (photo && photo.url) {
            return JSON.stringify({ ...photo, index });
          }
          return null;
        })
        .filter(Boolean);

      console.log('ReportForm - Preparing photos for submission:', validPhotos);

      const reportData = {
        project_id: projectId,
        activity_id: selectedActivity,
        program_name: project?.title,
        report_name: formData.reportName,
        report_text: formData.reportText,
        activity_objectives: formData.objectives,
        impact_on_participants: formData.impact,
        attendees_count: attendanceCount.toString(),
        activity_duration: selectedActivityDetails?.event_hours?.toString(),
        photos: validPhotos,
      };

      console.log('ReportForm - Submitting data:', reportData);

      let error;

      if (report?.id) {
        console.log('ReportForm - Updating existing report:', report.id);
        const { error: updateError } = await supabase
          .from('project_activity_reports')
          .update(reportData)
          .eq('id', report.id);
          
        error = updateError;
        
        if (!error) {
          console.log('ReportForm - Update successful');
          toast.success("تم تحديث التقرير بنجاح");
          onSuccess?.();
        }
      } else {
        console.log('ReportForm - Creating new report');
        const { error: insertError } = await supabase
          .from('project_activity_reports')
          .insert(reportData);
          
        error = insertError;
        
        if (!error) {
          console.log('ReportForm - Insert successful');
          toast.success("تم إضافة التقرير بنجاح");
          onSuccess?.();
        }
      }

      if (error) {
        console.error('Error saving report:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء حفظ التقرير");
    }
  };

  return { handleSubmit };
};