import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TemplateHeaderProps {
  onAddClick: () => void;
}

export const TemplateHeader = ({ onAddClick }: TemplateHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">قوالب الرسائل</h2>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 ml-2" />
        إضافة قالب جديد
      </Button>
    </div>
  );
};