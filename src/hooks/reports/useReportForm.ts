import { useState, useEffect } from 'react';
import { useReportPhotos } from './useReportPhotos';
import { useReportQueries } from './useReportQueries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReportForm = (projectId: string, report?: any, onSuccess?: () => void) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reportName: "",
    reportText: "",
    objectives: "",
    impact: "",
  });

  const { photos, setPhotos, preparePhotosForSubmission } = useReportPhotos(report);
  const { project, activities, attendanceCount } = useReportQueries(projectId, selectedActivity);

  useEffect(() => {
    if (report) {
      console.log('ReportForm - Setting initial data from report:', report);
      
      setSelectedActivity(report.activity_id);
      setFormData({
        reportName: report.report_name || "",
        reportText: report.report_text || "",
        objectives: report.activity_objectives || "",
        impact: report.impact_on_participants || "",
      });
    }
  }, [report]);

  const selectedActivityDetails = activities.find(a => a.id === selectedActivity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط");
      return;
    }

    if (!formData.reportName.trim()) {
      toast.error("الرجاء إدخال اسم التقرير");
      return;
    }

    try {
      const validPhotos = preparePhotosForSubmission();

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

      let error;

      if (report?.id) {
        const { error: updateError } = await supabase
          .from('project_activity_reports')
          .update(reportData)
          .eq('id', report.id);
          
        error = updateError;
        
        if (!error) {
          toast.success("تم تحديث التقرير بنجاح");
          onSuccess?.();
        }
      } else {
        const { error: insertError } = await supabase
          .from('project_activity_reports')
          .insert(reportData);
          
        error = insertError;
        
        if (!error) {
          toast.success("تم إضافة التقرير بنجاح");
          onSuccess?.();
          
          // Reset form
          setSelectedActivity(null);
          setFormData({ reportName: "", reportText: "", objectives: "", impact: "" });
          setPhotos(Array(6).fill(null));
        }
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء حفظ التقرير");
    }
  };

  return {
    selectedActivity,
    setSelectedActivity,
    photos,
    setPhotos,
    formData,
    setFormData,
    project,
    activities,
    attendanceCount,
    selectedActivityDetails,
    handleSubmit,
  };
};