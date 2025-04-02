
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EmployeeFormData {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  contract_type: string;
  employee_number: string;
  schedule_id?: string;
  gender?: string;
}

export function AddEmployeeDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeDialogProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<string | undefined>();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EmployeeFormData>();
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const { error } = await supabase
        .from("employees")
        .insert({
          ...data,
          schedule_id: selectedSchedule,
          status: "active",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة الموظف",
        description: "تم إضافة الموظف بنجاح",
      });
      onSuccess();
      reset();
      setSelectedSchedule(undefined);
    },
    onError: (error) => {
      console.error("Error creating employee:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة الموظف",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: EmployeeFormData) => {
    createEmployeeMutation.mutate(data);
  };

  const handleDialogClose = () => {
    if (!createEmployeeMutation.isPending) {
      reset();
      setSelectedSchedule(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة موظف جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                placeholder="أدخل الاسم الكامل"
                {...register("full_name", { required: "الاسم الكامل مطلوب" })}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="أدخل رقم الهاتف"
                {...register("phone")}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input
                id="department"
                placeholder="أدخل القسم"
                {...register("department")}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">نوع العقد</Label>
              <Select
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GenderField
              value={undefined}
              onChange={(value) => setValue("gender", value)}
            />
            
            <EmployeeScheduleField
              value={selectedSchedule}
              onChange={setSelectedSchedule}
            />
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={createEmployeeMutation.isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={createEmployeeMutation.isPending}>
              {createEmployeeMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
