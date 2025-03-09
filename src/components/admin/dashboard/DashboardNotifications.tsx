
import { Card } from "@/components/ui/card";
import { BellRing, Clock } from "lucide-react";
import { PendingTasksList } from "@/components/tasks/PendingTasksList";

interface DashboardNotificationsProps {
  notificationCount: number;
}

export const DashboardNotifications = ({ notificationCount }: DashboardNotificationsProps) => {
  return (
    <div className="mt-10">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex flex-row-reverse items-center mb-4">
              <Clock className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">المهام المطلوبة</h2>
            </div>
            <PendingTasksList />
          </Card>
          
          <Card className="p-6">
            <div className="flex flex-row-reverse items-center mb-4">
              <BellRing className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">آخر الإشعارات</h2>
            </div>
            <div className="space-y-4">
              {notificationCount > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: Math.min(3, notificationCount) }).map((_, i) => (
                    <div key={i} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">منذ قليل</span>
                        <div className="font-medium">إشعار جديد</div>
                      </div>
                      <div className="text-sm text-muted-foreground text-left">يمكنك الاطلاع على تفاصيل الإشعار بالضغط هنا</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">لا توجد إشعارات جديدة</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
