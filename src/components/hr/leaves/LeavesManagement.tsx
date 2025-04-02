
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { LeavesTable } from "../tables/LeavesTable";
import { AddLeaveDialog } from "../dialogs/AddLeaveDialog";

export function LeavesManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          إدارة الإجازات
        </h2>
        <AddLeaveDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <LeavesTable />
        </CardContent>
      </Card>
    </div>
  );
}
