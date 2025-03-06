
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface CopyProjectFieldsProps {
  newTitle: string;
  onTitleChange: (value: string) => void;
  includeStages: boolean;
  onIncludeStagesChange: (checked: boolean) => void;
  includeTasks: boolean;
  onIncludeTasksChange: (checked: boolean) => void;
  includeAttachments: boolean;
  onIncludeAttachmentsChange: (checked: boolean) => void;
  isLoading: boolean;
}

export const CopyProjectFields = ({
  newTitle,
  onTitleChange,
  includeStages,
  onIncludeStagesChange,
  includeTasks,
  onIncludeTasksChange,
  includeAttachments,
  onIncludeAttachmentsChange,
  isLoading
}: CopyProjectFieldsProps) => {
  if (isLoading) return null;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="projectTitle">عنوان المشروع الجديد</Label>
        <Input
          id="projectTitle"
          value={newTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
          autoFocus
        />
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox
          id="includeStages"
          checked={includeStages}
          onCheckedChange={() => onIncludeStagesChange(!includeStages)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="includeStages" className="mr-2 cursor-pointer">نسخ مراحل المشروع</Label>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox
          id="includeTasks"
          checked={includeTasks}
          onCheckedChange={() => onIncludeTasksChange(!includeTasks)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="includeTasks" className="mr-2 cursor-pointer">نسخ جميع المهام</Label>
      </div>

      {includeTasks && (
        <div className="flex items-center space-x-2 space-x-reverse mr-6">
          <Checkbox
            id="includeAttachments"
            checked={includeAttachments}
            onCheckedChange={() => onIncludeAttachmentsChange(!includeAttachments)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="includeAttachments" className="mr-2 cursor-pointer">نسخ المرفقات والقوالب</Label>
        </div>
      )}
    </div>
  );
};
