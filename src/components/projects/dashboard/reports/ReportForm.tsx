
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const ReportForm = ({ projectId, onSuccess }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reportName: "",
    selectedActivity: "",
    reportText: "",
    objectives: "",
    impact: "",
    attendeesCount: "",
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .insert({
          project_id: projectId,
          activity_id: formData.selectedActivity,
          report_name: formData.reportName,
          report_text: formData.reportText,
          activity_objectives: formData.objectives,
          impact_on_participants: formData.impact,
          attendees_count: formData.attendeesCount,
        });

      if (error) throw error;
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>النشاط</Label>
          <Select
            value={formData.selectedActivity}
            onValueChange={(value) => 
              setFormData((prev) => ({ ...prev, selectedActivity: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النشاط" />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>اسم التقرير</Label>
          <Input
            value={formData.reportName}
            onChange={(e) => 
              setFormData((prev) => ({ ...prev, reportName: e.target.value }))
            }
            placeholder="اسم التقرير"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>تقرير النشاط</Label>
          <Textarea
            value={formData.reportText}
            onChange={(e) => 
              setFormData((prev) => ({ ...prev, reportText: e.target.value }))
            }
            placeholder="وصف النشاط"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>عدد الحضور</Label>
          <Input
            type="number"
            value={formData.attendeesCount}
            onChange={(e) => 
              setFormData((prev) => ({ ...prev, attendeesCount: e.target.value }))
            }
            placeholder="عدد الحضور"
          />
        </div>

        <div className="space-y-2">
          <Label>أهداف النشاط</Label>
          <Textarea
            value={formData.objectives}
            onChange={(e) => 
              setFormData((prev) => ({ ...prev, objectives: e.target.value }))
            }
            placeholder="أهداف النشاط"
          />
        </div>

        <div className="space-y-2">
          <Label>آثار النشاط على المشاركين</Label>
          <Textarea
            value={formData.impact}
            onChange={(e) => 
              setFormData((prev) => ({ ...prev, impact: e.target.value }))
            }
            placeholder="آثار النشاط على المشاركين"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
