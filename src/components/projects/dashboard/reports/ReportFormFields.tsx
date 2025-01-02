import { ActivitySelector } from "@/components/admin/dashboard/preparation/ActivitySelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReportPhotoUpload } from "@/components/reports/shared/components/ReportPhotoUpload";
import { ReportPhoto } from "@/types/projectReport";

interface ReportFormFieldsProps {
  project: any;
  activities: any[];
  selectedActivity: string | null;
  setSelectedActivity: (value: string | null) => void;
  formData: {
    reportText: string;
    objectives: string;
    impact: string;
  };
  setFormData: (value: any) => void;
  attendanceCount: number;
  selectedActivityDetails: any;
  photos: ReportPhoto[];
  setPhotos: (photos: ReportPhoto[]) => void;
}

export const ReportFormFields = ({
  project,
  activities,
  selectedActivity,
  setSelectedActivity,
  formData,
  setFormData,
  attendanceCount,
  selectedActivityDetails,
  photos,
  setPhotos,
}: ReportFormFieldsProps) => {
  return (
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
  );
};