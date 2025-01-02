import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReportFormFields } from "./ReportFormFields";
import { ReportPhoto } from "@/types/projectReport";

interface ReportFormProps {
  projectId: string;
}

export const ReportForm = ({ projectId }: ReportFormProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [formData, setFormData] = useState({
    reportText: "",
    objectives: "",
    impact: "",
  });

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
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط");
      return;
    }

    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .insert({
          project_id: projectId,
          activity_id: selectedActivity,
          program_name: project?.title,
          report_name: selectedActivityDetails?.title,
          report_text: formData.reportText,
          activity_objectives: formData.objectives,
          impact_on_participants: formData.impact,
          photos: photos,
        });

      if (error) throw error;

      toast.success("تم إضافة التقرير بنجاح");
      setFormData({ reportText: "", objectives: "", impact: "" });
      setPhotos([]);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ReportFormFields
          formData={formData}
          setFormData={setFormData}
          photos={photos}
          setPhotos={setPhotos}
        />
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            إضافة التقرير
          </Button>
        </div>
      </form>
    </Card>
  );
};
