import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TemplateHeaderProps {
  onAddClick: () => void;
}

export const TemplateHeader = ({ onAddClick }: TemplateHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">قوالب الواتساب</h3>
      <Button onClick={onAddClick} className="gap-2">
        <Plus className="w-4 h-4" />
        إضافة قالب
      </Button>
    </div>
  );
};