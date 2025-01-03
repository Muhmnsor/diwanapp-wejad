import { Card } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";

interface EligibilityStatusProps {
  isEligible: boolean;
  reason?: string;
  requirements: {
    totalAttendance: number;
    requiredAttendance: number;
    attendancePercentage: number;
    requiredPercentage: number;
  };
}

export const EligibilityStatus = ({
  isEligible,
  reason,
  requirements
}: EligibilityStatusProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        {isEligible ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )}
        <h3 className="text-lg font-semibold">
          {isEligible ? "مؤهل للحصول على الشهادة" : "غير مؤهل للحصول على الشهادة"}
        </h3>
      </div>

      {!isEligible && reason && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <p>{reason}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">عدد مرات الحضور</p>
          <p className="font-medium">
            {requirements.totalAttendance} / {requirements.requiredAttendance}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">نسبة الحضور</p>
          <p className="font-medium">
            {requirements.attendancePercentage.toFixed(1)}% / {requirements.requiredPercentage}%
          </p>
        </div>
      </div>
    </Card>
  );
};