
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ReportPhoto } from "@/types/projectReport";
import { useReportPhotos } from "./useReportPhotos";

export const useReportForm = (projectId: string, report?: any, onSuccess?: () => void) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(report?.activity_id || null);
  const { photos, setPhotos } = useReportPhotos(report?.photos);
  const [formData, setFormData] = useState({
    reportName: report?.report_name || '',
    reportText: report?.report_text || '',
    objectives: report?.objectives || '',
    impact: report?.impact_on_participants || '',
  });
  const { toast } = useToast();

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch project activities
  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;
      return data || [];
    },
  });

  // Get attendance count for selected activity
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [selectedActivityDetails, setSelectedActivityDetails] = useState<any>(null);

  useEffect(() => {
    const fetchAttendanceCount = async () => {
      if (!selectedActivity) {
        setAttendanceCount(0);
        setSelectedActivityDetails(null);
        return;
      }

      // Get activity details
      const { data: activityData } = await supabase
        .from('events')
        .select('*')
        .eq('id', selectedActivity)
        .single();

      setSelectedActivityDetails(activityData);

      // Get attendance count
      const { count } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', selectedActivity)
        .eq('status', 'present');

      setAttendanceCount(count || 0);
    };

    fetchAttendanceCount();
  }, [selectedActivity]);

  const handleSubmit = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();

    try {
      const reportData = {
        project_id: projectId,
        activity_id: selectedActivity,
        report_name: formData.reportName,
        report_text: formData.reportText,
        objectives: formData.objectives,
        impact_on_participants: formData.impact,
        photos: photos.filter(Boolean), // Filter out null values
        attendees_count: attendanceCount.toString(),
        author_id: userId
      };

      if (report?.id) {
        // Update existing report
        const { error } = await supabase
          .from('project_activity_reports')
          .update(reportData)
          .eq('id', report.id);

        if (error) throw error;
        toast({
          title: "تم تحديث التقرير بنجاح",
          variant: "default",
        });
      } else {
        // Create new report
        const { error } = await supabase
          .from('project_activity_reports')
          .insert([reportData]);

        if (error) throw error;
        toast({
          title: "تم إنشاء التقرير بنجاح",
          variant: "default",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "حدث خطأ أثناء حفظ التقرير",
        variant: "destructive",
      });
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
