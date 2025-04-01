
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Plus, Trash, Edit } from "lucide-react";
import { TimeInput } from "@/components/ui/time-input";

interface WorkSchedule {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  work_hours_per_day: number;
  work_days_per_week: number;
  created_at: string;
}

interface WorkDay {
  id: string;
  schedule_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_working_day: boolean;
}

export function WorkScheduleManagement() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [workHours, setWorkHours] = useState(8);
  const [workDays, setWorkDays] = useState(5);
  const [workDaySettings, setWorkDaySettings] = useState<WorkDay[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch work schedules
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["work-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WorkSchedule[];
    },
  });

  // Fetch work days for a specific schedule
  const fetchWorkDays = async (scheduleId: string) => {
    const { data, error } = await supabase
      .from("hr_work_days")
      .select("*")
      .eq("schedule_id", scheduleId)
      .order("day_of_week", { ascending: true });

    if (error) throw error;
    return data as WorkDay[];
  };

  // Create or update work schedule
  const mutation = useMutation({
    mutationFn: async () => {
      // Validate form
      if (!name.trim()) {
        toast.error("يرجى إدخال اسم الجدول");
        return;
      }

      if (workHours <= 0 || workDays <= 0) {
        toast.error("يجب أن تكون ساعات وأيام العمل أكبر من الصفر");
        return;
      }

      // First, create or update the schedule
      let scheduleId: string;
      if (editingSchedule) {
        const { data, error } = await supabase
          .from("hr_work_schedules")
          .update({
            name,
            description,
            is_default: isDefault,
            work_hours_per_day: workHours,
            work_days_per_week: workDays,
          })
          .eq("id", editingSchedule.id)
          .select()
          .single();

        if (error) throw error;
        scheduleId = data.id;

        // If marked as default, unmark other schedules
        if (isDefault) {
          await supabase
            .from("hr_work_schedules")
            .update({ is_default: false })
            .neq("id", scheduleId);
        }
      } else {
        const { data, error } = await supabase
          .from("hr_work_schedules")
          .insert({
            name,
            description,
            is_default: isDefault,
            work_hours_per_day: workHours,
            work_days_per_week: workDays,
          })
          .select()
          .single();

        if (error) throw error;
        scheduleId = data.id;

        // If marked as default, unmark other schedules
        if (isDefault) {
          await supabase
            .from("hr_work_schedules")
            .update({ is_default: false })
            .neq("id", scheduleId);
        }
      }

      // Now save the work days
      if (workDaySettings.length > 0) {
        // Delete existing work days for this schedule
        await supabase
          .from("hr_work_days")
          .delete()
          .eq("schedule_id", scheduleId);

        // Insert new work days
        const { error } = await supabase
          .from("hr_work_days")
          .insert(workDaySettings.map(day => ({
            ...day,
            schedule_id: scheduleId
          })));

        if (error) throw error;
      }

      return scheduleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
      toast.success(
        editingSchedule
          ? "تم تحديث جدول العمل بنجاح"
          : "تم إنشاء جدول العمل بنجاح"
      );
      resetForm();
    },
    onError: (error) => {
      console.error("Error saving work schedule:", error);
      toast.error("حدث خطأ أثناء حفظ جدول العمل");
    },
  });

  // Delete work schedule
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First check if any employees are using this schedule
      const { data: employees, error: checkError } = await supabase
        .from("employees")
        .select("id")
        .eq("schedule_id", id);

      if (checkError) throw checkError;

      if (employees && employees.length > 0) {
        throw new Error(`هناك ${employees.length} موظف يستخدم هذا الجدول. قم بتغيير جداولهم أولاً.`);
      }

      // Delete work days first
      const { error: daysError } = await supabase
        .from("hr_work_days")
        .delete()
        .eq("schedule_id", id);

      if (daysError) throw daysError;

      // Then delete the schedule
      const { error } = await supabase
        .from("hr_work_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
      toast.success("تم حذف جدول العمل بنجاح");
      setIsDeleting(null);
    },
    onError: (error) => {
      console.error("Error deleting work schedule:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حذف جدول العمل");
      setIsDeleting(null);
    },
  });

  // Initialize work days when creating a new schedule
  useEffect(() => {
    if (!editingSchedule && workDaySettings.length === 0) {
      const days = [
        { day_of_week: 0, name: "الأحد" },
        { day_of_week: 1, name: "الإثنين" },
        { day_of_week: 2, name: "الثلاثاء" },
        { day_of_week: 3, name: "الأربعاء" },
        { day_of_week: 4, name: "الخميس" },
        { day_of_week: 5, name: "الجمعة" },
        { day_of_week: 6, name: "السبت" },
      ];

      const initialWorkDays = days.map(day => ({
        id: `temp-${day.day_of_week}`,
        schedule_id: "temp",
        day_of_week: day.day_of_week,
        start_time: day.day_of_week < 5 ? "08:00:00" : null,
        end_time: day.day_of_week < 5 ? "16:00:00" : null,
        is_working_day: day.day_of_week < 5, // Default: Sunday to Thursday are working days
      }));

      setWorkDaySettings(initialWorkDays);
    }
  }, [editingSchedule, workDaySettings.length]);

  // Load work day settings when editing a schedule
  useEffect(() => {
    if (editingSchedule) {
      const loadWorkDays = async () => {
        try {
          const workDays = await fetchWorkDays(editingSchedule.id);
          
          // If no work days are found, initialize them
          if (workDays.length === 0) {
            const days = [
              { day_of_week: 0, name: "الأحد" },
              { day_of_week: 1, name: "الإثنين" },
              { day_of_week: 2, name: "الثلاثاء" },
              { day_of_week: 3, name: "الأربعاء" },
              { day_of_week: 4, name: "الخميس" },
              { day_of_week: 5, name: "الجمعة" },
              { day_of_week: 6, name: "السبت" },
            ];

            const initialWorkDays = days.map(day => ({
              id: `temp-${day.day_of_week}`,
              schedule_id: editingSchedule.id,
              day_of_week: day.day_of_week,
              start_time: day.day_of_week < 5 ? "08:00:00" : null,
              end_time: day.day_of_week < 5 ? "16:00:00" : null,
              is_working_day: day.day_of_week < 5,
            }));

            setWorkDaySettings(initialWorkDays);
          } else {
            setWorkDaySettings(workDays);
          }
        } catch (error) {
          console.error("Error loading work days:", error);
          toast.error("حدث خطأ أثناء تحميل تفاصيل أيام العمل");
        }
      };

      loadWorkDays();
    }
  }, [editingSchedule]);

  const handleEditSchedule = async (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setDescription(schedule.description || "");
    setIsDefault(schedule.is_default);
    setWorkHours(schedule.work_hours_per_day);
    setWorkDays(schedule.work_days_per_week);
    setIsFormOpen(true);

    // Work days will be loaded in the useEffect
  };

  const handleDeleteSchedule = (id: string) => {
    setIsDeleting(id);
    deleteMutation.mutate(id);
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingSchedule(null);
    setName("");
    setDescription("");
    setIsDefault(false);
    setWorkHours(8);
    setWorkDays(5);
    setWorkDaySettings([]);
  };

  const handleWorkDayChange = (dayOfWeek: number, field: string, value: any) => {
    setWorkDaySettings(prev => 
      prev.map(day => 
        day.day_of_week === dayOfWeek 
          ? { ...day, [field]: value } 
          : day
      )
    );
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayOfWeek];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <p>جاري تحميل جداول العمل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          جداول العمل
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }} 
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              إضافة جدول عمل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "تعديل جدول العمل" : "إضافة جدول عمل جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الجدول</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: دوام كامل، دوام جزئي، عن بعد"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للجدول"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workHours">ساعات العمل اليومية</Label>
                  <Input
                    id="workHours"
                    type="number"
                    min="1"
                    max="24"
                    value={workHours}
                    onChange={(e) => setWorkHours(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workDays">أيام العمل الأسبوعية</Label>
                  <Input
                    id="workDays"
                    type="number"
                    min="1"
                    max="7"
                    value={workDays}
                    onChange={(e) => setWorkDays(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>جدول الأسبوع</Label>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اليوم</TableHead>
                        <TableHead>يوم عمل</TableHead>
                        <TableHead>وقت البدء</TableHead>
                        <TableHead>وقت الانتهاء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workDaySettings.map((day) => (
                        <TableRow key={day.day_of_week}>
                          <TableCell>{getDayName(day.day_of_week)}</TableCell>
                          <TableCell>
                            <Select
                              value={day.is_working_day ? "true" : "false"}
                              onValueChange={(value) =>
                                handleWorkDayChange(
                                  day.day_of_week,
                                  "is_working_day",
                                  value === "true"
                                )
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">نعم</SelectItem>
                                <SelectItem value="false">لا</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <TimeInput
                              value={day.start_time || ""}
                              onChange={(value) =>
                                handleWorkDayChange(day.day_of_week, "start_time", value)
                              }
                              disabled={!day.is_working_day}
                            />
                          </TableCell>
                          <TableCell>
                            <TimeInput
                              value={day.end_time || ""}
                              onChange={(value) =>
                                handleWorkDayChange(day.day_of_week, "end_time", value)
                              }
                              disabled={!day.is_working_day}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isDefault">تعيين كجدول افتراضي</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
              <Button 
                type="button" 
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جداول العمل المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules?.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">لا توجد جداول عمل محددة.</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setIsFormOpen(true)}
              >
                إضافة جدول عمل
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>ساعات العمل</TableHead>
                    <TableHead>أيام العمل</TableHead>
                    <TableHead>افتراضي</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules?.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.description || "-"}</TableCell>
                      <TableCell>{schedule.work_hours_per_day} ساعة</TableCell>
                      <TableCell>{schedule.work_days_per_week} أيام</TableCell>
                      <TableCell>
                        {schedule.is_default ? (
                          <span className="text-green-600">نعم</span>
                        ) : (
                          <span className="text-muted-foreground">لا</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            disabled={isDeleting === schedule.id}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
