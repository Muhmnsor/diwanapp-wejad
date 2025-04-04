
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddLeaveRequestDialog } from "./AddLeaveRequestDialog";
import { LeavesTable } from "../tables/LeavesTable";

export function LeavesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">إدارة الإجازات</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> طلب إجازة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          {/* طلبات الإجازات ستظهر هنا لاحقاً */}
           <LeavesTable />
            لا توجد طلبات إجازات حالية
        </CardContent>
      </Card>

      <AddLeaveRequestDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
