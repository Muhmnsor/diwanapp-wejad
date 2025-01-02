import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportMetadataType } from "../types";

interface ReportMetadataFieldsProps {
  metadata: ReportMetadataType;
  onMetadataChange: (metadata: ReportMetadataType) => void;
}

export const ReportMetadataFields = ({
  metadata,
  onMetadataChange,
}: ReportMetadataFieldsProps) => {
  const handleChange = (field: keyof ReportMetadataType, value: string) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>المدة</Label>
        <Input
          value={metadata.duration}
          onChange={(e) => handleChange('duration', e.target.value)}
          placeholder="مدة النشاط"
        />
      </div>

      <div className="space-y-2">
        <Label>عدد المشاركين</Label>
        <Input
          value={metadata.attendeesCount}
          onChange={(e) => handleChange('attendeesCount', e.target.value)}
          placeholder="عدد المشاركين"
        />
      </div>

      <div className="space-y-2">
        <Label>الأهداف</Label>
        <Input
          value={metadata.objectives}
          onChange={(e) => handleChange('objectives', e.target.value)}
          placeholder="أهداف النشاط"
        />
      </div>

      <div className="space-y-2">
        <Label>الأثر على المشاركين</Label>
        <Input
          value={metadata.impactOnParticipants}
          onChange={(e) => handleChange('impactOnParticipants', e.target.value)}
          placeholder="الأثر على المشاركين"
        />
      </div>
    </div>
  );
};