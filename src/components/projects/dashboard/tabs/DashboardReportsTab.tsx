import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivitySelector } from "@/components/admin/dashboard/preparation/ActivitySelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ReportPhotoUpload } from "@/components/reports/shared/components/ReportPhotoUpload";

interface DashboardReportsTabProps {
  projectId: string;
}

export const DashboardReportsTab = ({ projectId }: DashboardReportsTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ url: string; description: string }[]>([]);
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
          report_text: formData.reportText,
          activity_objectives: formData.objectives,
          impact_on_participants: formData.impact,
          attendees_count: attendanceCount.toString(),
          activity_duration: selectedActivityDetails?.event_hours?.toString(),
          photos: photos,
        });

      if (error) throw error;

      toast.success("تم إضافة التقرير بنجاح");
      setIsFormOpen(false);
      setSelectedActivity(null);
      setFormData({ reportText: "", objectives: "", impact: "" });
      setPhotos([]);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم البرنامج/المشروع</label>
                <Input value={project?.title} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">النشاط</label>
                <ActivitySelector
                  activities={activities}
                  selectedActivity={selectedActivity}
                  onActivityChange={(value) => setSelectedActivity(value)}
                />
              </div>

              {selectedActivity && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">تقرير النشاط</label>
                    <Textarea
                      value={formData.reportText}
                      onChange={(e) => setFormData({ ...formData, reportText: e.target.value })}
                      placeholder="وصف النشاط"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">عدد الحضور</label>
                      <Input value={attendanceCount} disabled />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">مدة النشاط (ساعات)</label>
                      <Input value={selectedActivityDetails?.event_hours || ''} disabled />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">أهداف النشاط</label>
                    <Textarea
                      value={formData.objectives}
                      onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                      placeholder="أهداف النشاط"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">آثار النشاط</label>
                    <Textarea
                      value={formData.impact}
                      onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                      placeholder="آثار النشاط على المشاركين"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">صور النشاط</label>
                    <ReportPhotoUpload
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxPhotos={6}
                    />
                  </div>

                  <Button type="submit" className="w-full">حفظ التقرير</Button>
                </>
              )}
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};