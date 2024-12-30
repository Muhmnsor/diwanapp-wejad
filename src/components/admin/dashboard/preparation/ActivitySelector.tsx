import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivitySelectorProps {
  activities: any[];
  selectedActivity: string | null;
  onActivityChange: (value: string) => void;
  mode: 'activity' | 'registrant';
  onModeChange: (mode: 'activity' | 'registrant') => void;
}

export const ActivitySelector = ({ 
  activities, 
  selectedActivity, 
  onActivityChange,
  mode,
  onModeChange
}: ActivitySelectorProps) => {
  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value: 'activity' | 'registrant') => onModeChange(value)} className="w-[280px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">حسب النشاط</TabsTrigger>
          <TabsTrigger value="registrant">حسب المستفيد</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {mode === 'activity' && (
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
      )}
    </div>
  );
};