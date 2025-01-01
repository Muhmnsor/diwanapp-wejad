import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectActivity } from "@/types/activity";

interface ReportNameFieldProps {
  value: string;
  programName: string;
  activities: ProjectActivity[];
  onChange: (value: string) => void;
  onProgramNameChange: (value: string) => void;
}

export const ReportNameField = ({ 
  value, 
  programName,
  activities,
  onChange,
  onProgramNameChange 
}: ReportNameFieldProps) => {
  console.log("ReportNameField - activities:", activities);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="program_name">اسم البرنامج/المشروع</Label>
        <Input
          id="program_name"
          value={programName}
          onChange={(e) => onProgramNameChange(e.target.value)}
          placeholder="أدخل اسم البرنامج/المشروع..."
          className="text-right"
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="report_name">اسم النشاط</Label>
        <Select 
          value={value} 
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full text-right">
            <SelectValue placeholder="اختر النشاط..." />
          </SelectTrigger>
          <SelectContent>
            {activities.map((activity) => (
              <SelectItem key={activity.id} value={activity.title}>
                {activity.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};