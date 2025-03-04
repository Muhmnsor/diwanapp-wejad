
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskStageFieldProps {
  stageId: string;
  onStageIdChange: (stageId: string) => void;
  projectStages: { id: string; name: string }[];
}

export const TaskStageField = ({ stageId, onStageIdChange, projectStages }: TaskStageFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="stage">المرحلة</Label>
      <Select onValueChange={onStageIdChange} defaultValue={stageId}>
        <SelectTrigger>
          <SelectValue placeholder="اختر المرحلة" />
        </SelectTrigger>
        <SelectContent>
          {projectStages.map(stage => (
            <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
