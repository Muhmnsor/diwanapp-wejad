
import { SelfAttendanceCard } from "../self-attendance/SelfAttendanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SelfAttendanceTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">تسجيل الحضور الذاتي</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <SelfAttendanceCard />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">سجل الحضور الشخصي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                قريبًا: عرض سجل الحضور الشخصي هنا
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
