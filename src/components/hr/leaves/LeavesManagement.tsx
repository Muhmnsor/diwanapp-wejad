
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddLeaveRequestDialog } from "./AddLeaveRequestDialog";
import { LeavesTable } from "../tables/LeavesTable";
import { toast } from "@/components/ui/use-toast";

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
           <LeavesTable 
             onApproveSuccess={() => {
               toast({
                 title: "تمت الموافقة على الإجازة",
                 description: "تم تحديث رصيد الإجازات بنجاح",
                 variant: "default",
               });
             }}
             onApproveError={(error) => {
               console.error("Error approving leave:", error);
               toast({
                 title: "حدث خطأ",
                 description: "لم نتمكن من تحديث حالة الاجازة",
                 variant: "destructive",
               });
             }}
             onRejectSuccess={() => {
               toast({
                 title: "تم رفض الإجازة",
                 description: "تم تحديث حالة الإجازة بنجاح",
                 variant: "default",
               });
             }}
           />
        </CardContent>
      </Card>

      <AddLeaveRequestDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
