
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProgressCardProps {
  title: string;
  percentage: number;
  value: number;
  total: number;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export const ProgressCard = ({ 
  title, 
  percentage, 
  value, 
  total, 
  icon: Icon, 
  iconColor = "text-amber-600",
  valueColor = "text-amber-600"
}: ProgressCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium ${iconColor} flex items-center gap-2`}>
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{percentage}%</div>
        <div className="text-xs text-gray-500 mt-1">{value} من {total} مشروع</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-amber-500 h-1.5 rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
