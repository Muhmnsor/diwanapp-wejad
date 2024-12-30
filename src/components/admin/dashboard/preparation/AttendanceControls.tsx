import { FC } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck } from "lucide-react";

export const AttendanceControls: FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-[#1A1F2C]">تحضير المشاركين</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 ml-2" />
          تحضير بالباركود
        </Button>
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 ml-2" />
          تحضير جماعي
        </Button>
      </div>
    </div>
  );
};