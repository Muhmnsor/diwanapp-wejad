import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EventMetadataFieldsProps {
  duration: string;
  attendeesCount: string;
  onDurationChange: (value: string) => void;
  onAttendeesCountChange: (value: string) => void;
}

export const EventMetadataFields = ({
  duration,
  attendeesCount,
  onDurationChange,
  onAttendeesCountChange,
}: EventMetadataFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="event_duration">مدة الفعالية</Label>
        <Input
          id="event_duration"
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          placeholder="مثال: ساعتين، 3 ساعات..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendees_count">عدد المشاركين</Label>
        <Input
          id="attendees_count"
          value={attendeesCount}
          onChange={(e) => onAttendeesCountChange(e.target.value)}
          placeholder="أدخل عدد المشاركين..."
          required
        />
      </div>
    </div>
  );
};