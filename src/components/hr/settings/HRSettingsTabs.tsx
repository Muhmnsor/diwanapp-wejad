
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Building, Users, CalendarDays } from "lucide-react";
import { LeaveTypesManagement } from "./leave-types/LeaveTypesManagement";

export function HRSettingsTabs() {
  return (
    <Tabs defaultValue="leaves" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full sm:w-auto">
        <TabsTrigger value="leaves" className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          الإجازات
        </TabsTrigger>
        <TabsTrigger value="schedules" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          جداول العمل
        </TabsTrigger>
        <TabsTrigger value="departments" className="flex items-center gap-1">
          <Building className="h-4 w-4" />
          الأقسام
        </TabsTrigger>
        <TabsTrigger value="positions" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          المناصب
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="leaves" className="space-y-4">
        <LeaveTypesManagement />
      </TabsContent>
      
      <TabsContent value="schedules" className="space-y-4">
        <h3 className="text-lg font-medium">جداول العمل</h3>
        <p className="text-muted-foreground">قريباً...</p>
      </TabsContent>
      
      <TabsContent value="departments" className="space-y-4">
        <h3 className="text-lg font-medium">الأقسام</h3>
        <p className="text-muted-foreground">قريباً...</p>
      </TabsContent>
      
      <TabsContent value="positions" className="space-y-4">
        <h3 className="text-lg font-medium">المناصب</h3>
        <p className="text-muted-foreground">قريباً...</p>
      </TabsContent>
    </Tabs>
  );
}
