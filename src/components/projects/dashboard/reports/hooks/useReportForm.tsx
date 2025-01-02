import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReportPhoto } from "@/types/projectReport";

export const useReportForm = (projectId: string, report?: any, onSuccess?: () => void) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>(Array(6).fill(null));
  const [formData, setFormData] = useState({
    reportName: "",
    reportText: "",
    objectives: "",
    impact: "",
  });

  // Initialize form data from report
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

      // Initialize photos array with nulls
      const initialPhotos = Array(6).fill(null);
      
      // Parse and place photos in their correct positions
      if (report.photos && Array.isArray(report.photos)) {
        report.photos.forEach((photoStr: string, index: number) => {
          try {
            const photo = JSON.parse(photoStr);
            if (photo && photo.url) {
              initialPhotos[index] = photo;
            }
          } catch (e) {
            console.error('Error parsing photo:', e);
          }
        });
      }

      console.log('ReportForm - Initialized photos array:', initialPhotos);
      setPhotos(initialPhotos);
    }
  }, [report]);

  // Fetch project data
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

  // Fetch activities
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

  // Fetch attendance count
  const { data: attendanceCount = 0 } = useQuery({
    queryKey: ['activity-attendance', selectedActivity],
    enabled: !!selectedActivity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('activity_id', selectedActivity)
        .eq('status', 'present');

      if (error) throw error;
      return data?.length || 0;
    },
  });

  const selectedActivityDetails = activities.find(a => a.id === selectedActivity);

  const handleSubmit = async (e: React.FormEvent) => {
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
          
          // Reset form
          setSelectedActivity(null);
          setFormData({ reportName: "", reportText: "", objectives: "", impact: "" });
          setPhotos(Array(6).fill(null));
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