
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TaskStageFieldProps {
  stageId: string;
  setStageId: (value: string) => void;
  projectStages: { id: string; name: string }[];
}

export const TaskStageField = ({ stageId, setStageId, projectStages }: TaskStageFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="stage">المرحلة</Label>
      <Select value={stageId} onValueChange={setStageId}>
        <SelectTrigger id="stage">
          <SelectValue placeholder="اختر المرحلة" />
        </SelectTrigger>
        <SelectContent>
          {projectStages.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              {stage.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
