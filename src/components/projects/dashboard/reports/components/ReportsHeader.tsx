import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReportsHeaderProps {
  onAddReport: () => void;
}

export const ReportsHeader = ({ onAddReport }: ReportsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">تقارير النشاط</h2>
      <Button onClick={onAddReport}>
        <Plus className="h-4 w-4 ml-2" />
        إضافة تقرير
      </Button>
    </div>
  );
};