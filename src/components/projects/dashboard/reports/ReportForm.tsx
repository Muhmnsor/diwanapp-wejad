import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReportFormFields } from "./ReportFormFields";
import { ReportPhoto } from "@/types/projectReport";

interface ReportFormProps {
  projectId: string;
  report?: any;
  onSuccess?: () => void;
}

export const ReportForm = ({ projectId, report, onSuccess }: ReportFormProps) => {
  console.log('ReportForm - Initializing with report:', report);
  
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [formData, setFormData] = useState({
    reportName: "",
    reportText: "",
    objectives: "",
    impact: "",
  });

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
      
      // Parse photos and filter out any invalid entries
      const parsedPhotos = report.photos
        ?.map((p: string) => {
          try {
            return JSON.parse(p);
          } catch (e) {
            console.error('Error parsing photo:', e);
            return null;
          }
        })
        .filter((p: ReportPhoto | null): p is ReportPhoto => p !== null) || [];
      
      console.log('ReportForm - Parsed photos:', parsedPhotos);
      setPhotos(parsedPhotos);
    }
  }, [report]);

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
      // Filter out null values from photos array
      const validPhotos = photos.filter(photo => photo && photo.url);
      console.log('ReportForm - Valid photos for submission:', validPhotos);

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
        photos: validPhotos.map(photo => JSON.stringify(photo)),
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
          
          // Reset form for new reports only
          setSelectedActivity(null);
          setFormData({ reportName: "", reportText: "", objectives: "", impact: "" });
          setPhotos([]);
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ReportFormFields
          project={project}
          activities={activities}
          selectedActivity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
          formData={formData}
          setFormData={setFormData}
          attendanceCount={attendanceCount}
          selectedActivityDetails={selectedActivityDetails}
          photos={photos}
          setPhotos={setPhotos}
        />
        <Button type="submit" className="w-full">
          {report ? "تحديث التقرير" : "حفظ التقرير"}
        </Button>
      </form>
    </Card>
  );
};