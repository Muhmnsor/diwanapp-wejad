import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export function ViewEmployeeDialog({ 
  isOpen, 
  onClose, 
  employee 
}: ViewEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState("basic-info");
  
  // Fetch employee schedule
  const { data: workSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["employee-schedule", employee?.id, employee?.schedule_id],
    queryFn: async () => {
      if (!employee?.id || !employee?.schedule_id) return null;
      
      try {
        const { data, error } = await supabase
          .from("hr_work_schedules")
          .select("*")
          .eq("id", employee.schedule_id)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching schedule:", error);
        return null;
      }
    },
    enabled: !!employee?.id && !!employee?.schedule_id,
  });
  
  // Fetch work days
  const { data: workDays, isLoading: isLoadingWorkDays } = useQuery({
    queryKey: ["work-days", employee?.schedule_id],
    queryFn: async () => {
      if (!employee?.schedule_id) return [];
      
      try {
        const { data, error } = await supabase
          .from("hr_work_days")
          .select("*")
          .eq("schedule_id", employee.schedule_id)
          .order("day_of_week", { ascending: true });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching work days:", error);
        return [];
      }
    },
    enabled: !!employee?.schedule_id,
  });
  
  // Convert day number to Arabic day name
  const getDayName = (dayNumber: number) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayNumber];
  };
  
  // Format time (HH:MM)
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الموظف</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic-info">البيانات الأساسية</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="schedule">جدول العمل</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">الاسم</h3>
                <p>{employee?.full_name || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">الرقم الوظيفي</h3>
                <p>{employee?.employee_number || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">المسمى الوظيفي</h3>
                <p>{employee?.position || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">القسم</h3>
                <p>{employee?.department || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">رقم الهاتف</h3>
                <p dir="ltr">{employee?.phone || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">البريد الإلكتروني</h3>
                <p dir="ltr">{employee?.email || "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">تاريخ التعيين</h3>
                <p>{employee?.hire_date ? new Date(employee.hire_date).toLocaleDateString("ar-SA") : "-"}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground">الحالة</h3>
                <Badge
                  variant={employee?.status === "active" ? "outline" : "secondary"}
                  className={
                    employee?.status === "active"
                      ? "bg-green-50 text-green-700 hover:bg-green-50"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }
                >
                  {employee?.status === "active" ? "يعمل" : "منتهي"}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4">
            <div className="border rounded-md p-4">
              <p className="text-muted-foreground text-center">بيانات العقود غير متوفرة حالياً</p>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            {isLoadingSchedule ? (
              <div className="text-center p-4">جاري تحميل بيانات الجدول...</div>
            ) : workSchedule ? (
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-bold mb-2">{workSchedule.name}</h3>
                  <p className="text-muted-foreground text-sm">{workSchedule.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground">ساعات العمل اليومية</h4>
                      <p className="font-medium">{workSchedule.work_hours_per_day} ساعة</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">أيام العمل الأسبوعية</h4>
                      <p className="font-medium">{workSchedule.work_days_per_week} أيام</p>
                    </div>
                  </div>
                </div>
                
                {isLoadingWorkDays ? (
                  <div className="text-center">جاري تحميل أيام العمل...</div>
                ) : workDays.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-right">اليوم</th>
                          <th className="p-2 text-right">يوم عمل</th>
                          <th className="p-2 text-right">وقت البدء</th>
                          <th className="p-2 text-right">وقت الانتهاء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workDays.map((day) => (
                          <tr key={day.id} className="border-t">
                            <td className="p-2">{getDayName(day.day_of_week)}</td>
                            <td className="p-2">
                              {day.is_working_day ? (
                                <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                                  نعم
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50">
                                  لا
                                </Badge>
                              )}
                            </td>
                            <td className="p-2">{day.is_working_day ? formatTime(day.start_time) : "-"}</td>
                            <td className="p-2">{day.is_working_day ? formatTime(day.end_time) : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center border rounded-md p-4">
                    لا توجد بيانات أيام عمل مسجلة
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-md p-4 text-center">
                <p className="text-muted-foreground">لم يتم تعيين جدول عمل لهذا الموظف</p>
                <p className="text-xs mt-2">يمكنك تعيين جدول عمل من خلال خيار "إدارة جدول العمل" في قائمة الإجراءات</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
