
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YearlyPlanFilters } from "../types/yearlyPlanTypes";
import { WorkspaceWithProjects } from "../types/yearlyPlanTypes";

interface YearlyPlanFilterProps {
  workspaces: WorkspaceWithProjects[];
  filters: YearlyPlanFilters;
  onFilterChange: (filters: YearlyPlanFilters) => void;
}

export const YearlyPlanFilter = ({ workspaces, filters, onFilterChange }: YearlyPlanFilterProps) => {
  const handleStatusChange = (status: string | null) => {
    onFilterChange({ ...filters, status });
  };

  const handleWorkspaceChange = (workspace: string | null) => {
    onFilterChange({ ...filters, workspace });
  };

  const clearFilters = () => {
    onFilterChange({ status: null, workspace: null });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border mb-4 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm mb-1 block">حالة المشروع</label>
        <Select 
          value={filters.status || ""} 
          onValueChange={(value) => handleStatusChange(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الحالات</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="delayed">متعثر</SelectItem>
            <SelectItem value="stopped">متوقف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm mb-1 block">مساحة العمل</label>
        <Select 
          value={filters.workspace || ""} 
          onValueChange={(value) => handleWorkspaceChange(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="جميع مساحات العمل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع مساحات العمل</SelectItem>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 flex justify-end min-w-[100px]">
        <Button
          variant="outline"
          onClick={clearFilters}
          disabled={!filters.status && !filters.workspace}
        >
          إعادة ضبط الفلاتر
        </Button>
      </div>
    </div>
  );
};
