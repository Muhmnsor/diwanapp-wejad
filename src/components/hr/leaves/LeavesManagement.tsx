
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RequestLeaveForm } from "./RequestLeaveForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeaveRequestsList } from "./LeaveRequestsList";

export function LeavesManagement() {
  const [isOpenRequestDialog, setIsOpenRequestDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          إدارة الإجازات
        </h2>
        <Dialog open={isOpenRequestDialog} onOpenChange={setIsOpenRequestDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              طلب إجازة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديدة</DialogTitle>
              <DialogDescription>
                يرجى تعبئة نموذج طلب الإجازة أدناه
              </DialogDescription>
            </DialogHeader>
            <RequestLeaveForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">طلبات الإجازات</TabsTrigger>
          <TabsTrigger value="balances">رصيد الإجازات</TabsTrigger>
          <TabsTrigger value="calendar">تقويم الإجازات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <LeaveRequestsList />
        </TabsContent>
        
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>رصيد الإجازات</CardTitle>
              <CardDescription>عرض استحقاقات الإجازات ورصيدك الحالي</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">قيد التطوير</p>
              <p className="text-sm text-muted-foreground">
                ستتمكن قريباً من مشاهدة استحقاقات الإجازات ورصيدك الحالي
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>تقويم الإجازات</CardTitle>
              <CardDescription>عرض الإجازات في تقويم شهري</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">قيد التطوير</p>
              <p className="text-sm text-muted-foreground">
                ستتمكن قريباً من مشاهدة الإجازات في تقويم شهري
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
