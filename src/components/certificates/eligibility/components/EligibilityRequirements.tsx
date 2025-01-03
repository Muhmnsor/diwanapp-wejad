import { Card } from "@/components/ui/card";

interface EligibilityRequirementsProps {
  requirements: {
    totalAttendance: number;
    requiredAttendance: number;
    attendancePercentage: number;
    requiredPercentage: number;
  };
}

export const EligibilityRequirements = ({ requirements }: EligibilityRequirementsProps) => {
  return (
    <Card className="p-4 space-y-2">
      <h3 className="font-semibold text-lg mb-4">متطلبات الحضور</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">عدد مرات الحضور</p>
          <p className="font-medium">{requirements.totalAttendance} / {requirements.requiredAttendance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">نسبة الحضور</p>
          <p className="font-medium">{requirements.attendancePercentage.toFixed(1)}% / {requirements.requiredPercentage}%</p>
        </div>
      </div>
    </Card>
  );
};