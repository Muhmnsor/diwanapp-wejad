
import { AttendanceTab } from "@/components/hr/tabs/AttendanceTab";

const HRAttendance = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الحضور والإجازات</h1>
        <p className="text-muted-foreground">إدارة سجلات الحضور والإجازات للموظفين</p>
      </div>
      
      <AttendanceTab />
    </div>
  );
};

export default HRAttendance;
