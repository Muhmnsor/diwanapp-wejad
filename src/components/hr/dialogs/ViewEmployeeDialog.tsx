import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  User, 
  Building2, 
  Calendar, 
  Phone, 
  Mail, 
  FileText,
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleInfoDetail } from "../attendance/ScheduleInfoDetail";

interface ViewEmployeeDialogProps {
  employeeId: string;
  trigger: React.ReactNode;
}

export function ViewEmployeeDialog({ employeeId, trigger }: ViewEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployeeDetails();
    }
  }, [open, employeeId]);

  const fetchEmployeeDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          schedule:schedule_id (
            id,
            name,
            work_days_per_week,
            work_hours_per_day
          )
        `)
        .eq("id", employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error: any) {
      console.error("Error fetching employee details:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الموظف");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {React.cloneElement(trigger as React.ReactElement, {
          onClick: () => setOpen(true)
        })}
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الموظف</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center p-4">جاري تحميل البيانات...</div>
          ) : employee ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">المعلومات الأساسية</TabsTrigger>
                <TabsTrigger value="schedule">جدول العمل</TabsTrigger>
                <TabsTrigger value="contracts">العقود</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">الاسم الكامل</h3>
                        <p>{employee.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">البريد الإلكتروني</h3>
                        <p>{employee.email || "غير متوفر"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">رقم الهاتف</h3>
                        <p>{employee.phone || "غير متوفر"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">المسمى الوظيفي</h3>
                        <p>{employee.position}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">القسم</h3>
                        <p>{employee.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">تاريخ التعيين</h3>
                        <p>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("ar-SA") : "غير متوفر"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">الحالة</h3>
                        <Badge
                          variant={employee.status === "active" ? "outline" : "secondary"}
                          className={
                            employee.status === "active"
                              ? "bg-green-50 text-green-700 hover:bg-green-50"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {employee.status === "active" ? "يعمل" : "منتهي"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {employee.notes && (
                  <div className="mt-4">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <h3 className="font-medium">ملاحظات</h3>
                        <p className="whitespace-pre-wrap">{employee.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4 pt-4">
                {employee.schedule ? (
                  <Card>
                    <CardContent className="pt-6">
                      <ScheduleInfoDetail scheduleId={employee.schedule.id} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mb-2 opacity-50" />
                    <h3 className="text-lg font-medium">لم يتم تعيين جدول عمل</h3>
                    <p className="max-w-md mt-1">
                      لم يتم تعيين جدول عمل لهذا الموظف بعد. يمكنك تعيين جدول عمل من خلال تعديل بيانات الموظف.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="contracts" className="space-y-4 pt-4">
                <ContractsTab employeeId={employeeId} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center p-4">لم يتم العثور على بيانات الموظف</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Component for displaying employee contracts
function ContractsTab({ employeeId }: { employeeId: string }) {
  // This will be implemented later, for now just a placeholder
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
      <FileText className="h-12 w-12 mb-2 opacity-50" />
      <h3 className="text-lg font-medium">العقود غير متوفرة حالياً</h3>
      <p className="max-w-md mt-1">
        سيتم إضافة إدارة العقود في التحديث القادم للنظام.
      </p>
    </div>
  );
}
