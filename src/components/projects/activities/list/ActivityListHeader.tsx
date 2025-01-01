import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ActivityListHeaderProps {
  onAddActivity: () => void;
}

export const ActivityListHeader = ({ onAddActivity }: ActivityListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">أنشطة المشروع</h2>
      <Button onClick={onAddActivity}>
        <Plus className="h-4 w-4 ml-2" />
        إضافة نشاط
      </Button>
    </div>
  );
};