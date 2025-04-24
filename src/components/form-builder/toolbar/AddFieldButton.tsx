
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";

interface AddFieldButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
}

export const AddFieldButton = ({ label, icon, onClick }: AddFieldButtonProps) => {
  // جلب الأيقونة من مكتبة lucide-react
  const IconComponent = icon ? (LucideIcons as any)[capitalizeFirstLetter(icon)] : null;
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center justify-start w-full h-auto py-2 px-3"
      onClick={onClick}
    >
      {IconComponent && <IconComponent className="h-4 w-4 ml-2" />}
      <span className="truncate text-sm">{label}</span>
    </Button>
  );
};

// دالة لتحويل أول حرف إلى حرف كبير
function capitalizeFirstLetter(string: string): string {
  const parts = string.split('-');
  return parts.map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
}
