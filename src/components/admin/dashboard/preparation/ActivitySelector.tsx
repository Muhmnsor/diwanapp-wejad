import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivitySelectorProps {
  activities: any[];
  selectedActivity: string | null;
  onActivityChange: (value: string) => void;
}

export const ActivitySelector = ({ 
  activities, 
  selectedActivity, 
  onActivityChange 
}: ActivitySelectorProps) => {
  return (
    <Select
      value={selectedActivity || ""}
      onValueChange={onActivityChange}
    >
      <SelectTrigger className="w-[280px]">
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
  );
};