
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { EmployeeScheduleField } from "../employees/EmployeeScheduleField";
import { GenderField } from "../fields/GenderField";

interface Employee {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  contract_type: string | null;
  schedule_id: string | null;
  employee_number: string | null;
  status: string;
  gender: string | null;
}

interface ViewEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function ViewEmployeeDialog({
  employee,
  isOpen,
  onClose,
  onDelete,
}: ViewEmployeeDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | undefined>();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Employee>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (employee) {
      reset(employee);
      setSelectedSchedule(employee.schedule_id || undefined);
    }
  }, [employee, reset]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: Employee) => {
      const { error } = await supabase
        .from("employees")
        .update({
          ...data,
          schedule_id: selectedSchedule,
        })
        .eq("id", employee?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الموظف",
        description: "تم تحديث بيانات الموظف بنجاح",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث بيانات الموظف",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: Employee) => {
    updateEmployeeMutation.mutate(data);
  };

  const handleDialogClose = () => {
    if (!updateEmployeeMutation.isPending) {
      setIsEditing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? "تعديل بيانات الموظف" : "عرض بيانات الموظف"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                placeholder="أدخل الاسم الكامل"
                {...register("full_name", { required: "الاسم الكامل مطلوب" })}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_number">الرقم الوظيفي</Label>
              <Input
                id="employee_number"
                placeholder="أدخل الرقم الوظيفي"
                {...register("employee_number")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                placeholder="أدخل البريد الإلكتروني"
                type="email"
                {...register("email")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="أدخل رقم الهاتف"
                {...register("phone")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">المنصب الوظيفي</Label>
              <Input
                id="position"
                placeholder="أدخل المنصب الوظيفي"
                {...register("position")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input
                id="department"
                placeholder="أدخل القسم"
                {...register("department")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">تاريخ التعيين</Label>
              <Input
                id="hire_date"
                type="date"
                {...register("hire_date")}
                readOnly={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">نوع العقد</Label>
              {isEditing ? (
                <Select
                  defaultValue={employee?.contract_type || ""}
                  onValueChange={(value) => setValue("contract_type", value)}
                >
                  <SelectTrigger id="contract_type">
                    <SelectValue placeholder="اختر نوع العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">دوام كامل</SelectItem>
                    <SelectItem value="part_time">دوام جزئي</SelectItem>
                    <SelectItem value="contractor">متعاقد</SelectItem>
                    <SelectItem value="temporary">مؤقت</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="contract_type"
                  value={
                    employee?.contract_type === "full_time"
                      ? "دوام كامل"
                      : employee?.contract_type === "part_time"
                      ? "دوام جزئي"
                      : employee?.contract_type === "contractor"
                      ? "متعاقد"
                      : employee?.contract_type === "temporary"
                      ? "مؤقت"
                      : employee?.contract_type || ""
                  }
                  readOnly
                  className="bg-muted"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <GenderField
                  value={employee?.gender || ""}
                  onChange={(value) => setValue("gender", value)}
                />
                
                <EmployeeScheduleField
                  value={selectedSchedule}
                  onChange={setSelectedSchedule}
                />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس</Label>
                  <Input
                    id="gender"
                    value={
                      employee?.gender === "male"
                        ? "ذكر"
                        : employee?.gender === "female"
                        ? "أنثى"
                        : ""
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule">جدول العمل</Label>
                  <ScheduleInfoDetail scheduleId={employee?.schedule_id} />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            {!isEditing ? (
              <>
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => employee && onDelete(employee.id)}
                  >
                    حذف
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  تعديل
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  إغلاق
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    employee && reset(employee);
                  }}
                  disabled={updateEmployeeMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateEmployeeMutation.isPending}>
                  {updateEmployeeMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper component to display schedule information
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

function ScheduleInfoDetail({ scheduleId }: { scheduleId: string | null | undefined }) {
  const { data, isLoading } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return null;
      
      const { data, error } = await supabase
        .from("hr_work_schedule_types")
        .select("name, description")
        .eq("id", scheduleId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!scheduleId,
  });
  
  if (!scheduleId) return <Input value="غير محدد" readOnly className="bg-muted" />;
  
  if (isLoading) return <Skeleton className="h-9 w-full" />;
  
  return <Input value={data?.name || "غير محدد"} readOnly className="bg-muted" />;
}
