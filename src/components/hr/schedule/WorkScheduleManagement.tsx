
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WorkDaysEditor } from "./WorkDaysEditor";

interface WorkSchedule {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  work_hours_per_day: number;
  work_days_per_week: number;
  created_at?: string;
}

interface WorkDay {
  id: string;
  schedule_id: string;
  day_of_week: number;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

export function WorkScheduleManagement() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [showWorkDaysDialog, setShowWorkDaysDialog] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workHoursPerDay, setWorkHoursPerDay] = useState(8);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hr_work_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      toast({
        title: "خطأ في جلب جداول العمل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    try {
      if (!name || workHoursPerDay <= 0 || workDaysPerWeek <= 0) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      // If setting as default, update all other schedules
      if (isDefault) {
        await supabase
          .from("hr_work_schedules")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const { data, error } = await supabase
        .from("hr_work_schedules")
        .insert({
          name,
          description: description || null,
          work_hours_per_day: workHoursPerDay,
          work_days_per_week: workDaysPerWeek,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم إنشاء جدول العمل بنجاح",
      });

      // Create default work days for this schedule
      if (data) {
        const defaultWorkDays = [];
        for (let i = 0; i < 7; i++) {
          // Default work days are Sunday to Thursday (0-4)
          const isWorkingDay = i < workDaysPerWeek;
          defaultWorkDays.push({
            schedule_id: data.id,
            day_of_week: i,
            is_working_day: isWorkingDay,
            start_time: isWorkingDay ? "08:00:00" : null,
            end_time: isWorkingDay ? "16:00:00" : null,
          });
        }

        await supabase.from("hr_work_days").insert(defaultWorkDays);
      }

      // Reset form and refetch
      resetForm();
      setShowAddDialog(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error adding work schedule:", error);
      toast({
        title: "خطأ في إنشاء جدول العمل",
        variant: "destructive",
      });
    }
  };

  const handleEditSchedule = async () => {
    try {
      if (!selectedSchedule) return;

      if (!name || workHoursPerDay <= 0 || workDaysPerWeek <= 0) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      // If setting as default, update all other schedules
      if (isDefault && !selectedSchedule.is_default) {
        await supabase
          .from("hr_work_schedules")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const { error } = await supabase
        .from("hr_work_schedules")
        .update({
          name,
          description: description || null,
          work_hours_per_day: workHoursPerDay,
          work_days_per_week: workDaysPerWeek,
          is_default: isDefault,
        })
        .eq("id", selectedSchedule.id);

      if (error) throw error;

      toast({
        title: "تم تحديث جدول العمل بنجاح",
      });

      resetForm();
      setShowEditDialog(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error updating work schedule:", error);
      toast({
        title: "خطأ في تحديث جدول العمل",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      // Check if this is the default schedule
      const scheduleToDelete = schedules.find(s => s.id === id);
      
      if (scheduleToDelete?.is_default) {
        toast({
          title: "لا يمكن حذف الجدول الافتراضي",
          description: "يرجى تعيين جدول آخر كافتراضي أولاً",
          variant: "destructive",
        });
        return;
      }

      // Check if schedule is assigned to any employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("schedule_id", id);

      if (empError) throw empError;

      if (employees && employees.length > 0) {
        toast({
          title: "لا يمكن حذف الجدول",
          description: `هذا الجدول مُعين لـ ${employees.length} موظف`,
          variant: "destructive",
        });
        return;
      }

      // Delete the schedule (work days will be cascade deleted)
      const { error } = await supabase
        .from("hr_work_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم حذف جدول العمل بنجاح",
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error deleting work schedule:", error);
      toast({
        title: "خطأ في حذف جدول العمل",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setName(schedule.name);
    setDescription(schedule.description || "");
    setWorkHoursPerDay(schedule.work_hours_per_day);
    setWorkDaysPerWeek(schedule.work_days_per_week);
    setIsDefault(schedule.is_default);
    setShowEditDialog(true);
  };

  const openWorkDaysDialog = async (schedule: WorkSchedule) => {
    try {
      setSelectedSchedule(schedule);
      
      // Fetch work days for this schedule
      const { data, error } = await supabase
        .from("hr_work_days")
        .select("*")
        .eq("schedule_id", schedule.id)
        .order("day_of_week", { ascending: true });
        
      if (error) throw error;
      
      setWorkDays(data || []);
      setShowWorkDaysDialog(true);
    } catch (error) {
      console.error("Error fetching work days:", error);
      toast({
        title: "خطأ في جلب أيام العمل",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setWorkHoursPerDay(8);
    setWorkDaysPerWeek(5);
    setIsDefault(false);
    setSelectedSchedule(null);
  };

  const handleWorkDaysChange = (updatedWorkDays: WorkDay[]) => {
    setWorkDays(updatedWorkDays);
  };

  const saveWorkDays = async () => {
    try {
      if (!selectedSchedule) return;
      
      // Update all work days at once
      const { error } = await supabase
        .from("hr_work_days")
        .upsert(workDays);
        
      if (error) throw error;
      
      toast({
        title: "تم حفظ أيام العمل بنجاح",
      });
      
      setShowWorkDaysDialog(false);
    } catch (error) {
      console.error("Error saving work days:", error);
      toast({
        title: "خطأ في حفظ أيام العمل",
        variant: "destructive",
      });
    }
  };

  const getDayString = (day: number): string => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[day];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">جداول العمل</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              إضافة جدول عمل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة جدول عمل جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم الجدول</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: دوام كامل"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للجدول"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="workHours">ساعات العمل / يوم</Label>
                  <Input
                    id="workHours"
                    type="number"
                    min="1"
                    max="24"
                    value={workHoursPerDay}
                    onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workDays">أيام العمل / أسبوع</Label>
                  <Input
                    id="workDays"
                    type="number"
                    min="1"
                    max="7"
                    value={workDaysPerWeek}
                    onChange={(e) => setWorkDaysPerWeek(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                />
                <Label htmlFor="isDefault">
                  تعيين كجدول افتراضي
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddSchedule}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-4">جاري التحميل...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          لا توجد جداول عمل. أضف جدولك الأول.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الجدول</TableHead>
                  <TableHead>ساعات/أيام العمل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.name}
                      {schedule.description && (
                        <p className="text-xs text-muted-foreground">{schedule.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {schedule.work_hours_per_day} ساعة / {schedule.work_days_per_week} أيام
                    </TableCell>
                    <TableCell>
                      {schedule.is_default && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          افتراضي
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openWorkDaysDialog(schedule)}
                        >
                          أيام العمل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(schedule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={schedule.is_default}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل جدول العمل</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم الجدول</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-workHours">ساعات العمل / يوم</Label>
                <Input
                  id="edit-workHours"
                  type="number"
                  min="1"
                  max="24"
                  value={workHoursPerDay}
                  onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-workDays">أيام العمل / أسبوع</Label>
                <Input
                  id="edit-workDays"
                  type="number"
                  min="1"
                  max="7"
                  value={workDaysPerWeek}
                  onChange={(e) => setWorkDaysPerWeek(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="edit-isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
              />
              <Label htmlFor="edit-isDefault">
                تعيين كجدول افتراضي
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditSchedule}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Days Dialog */}
      <Dialog open={showWorkDaysDialog} onOpenChange={setShowWorkDaysDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              أيام العمل - {selectedSchedule?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedSchedule && (
              <WorkDaysEditor 
                workDays={workDays} 
                onChange={handleWorkDaysChange} 
              />
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={saveWorkDays}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

