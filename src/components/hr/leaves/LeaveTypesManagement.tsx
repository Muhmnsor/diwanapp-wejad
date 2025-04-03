import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarCheck, Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Textarea } from "@/components/ui/textarea";

interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_paid: boolean;
  max_days_per_year: number | null;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  gender_eligibility: 'male' | 'female' | 'both' | null;
}

export function LeaveTypesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLeaveType, setCurrentLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4CAF50",
    is_paid: true,
    max_days_per_year: 0,
    requires_approval: true,
    is_active: true,
    gender_eligibility: "both" as 'male' | 'female' | 'both',
  });

  // Fetch leave types
  const { data: leaveTypes, isLoading, error } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_leave_types")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as LeaveType[];
    },
  });

  // Add leave type mutation
  const addLeaveTypeMutation = useMutation({
    mutationFn: async (data: Omit<LeaveType, "id" | "created_at" | "created_by">) => {
      const { data: result, error } = await supabase
        .from("hr_leave_types")
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة نوع الإجازة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update leave type mutation
  const updateLeaveTypeMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeaveType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("hr_leave_types")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث نوع الإجازة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete leave type mutation
  const deleteLeaveTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hr_leave_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      setIsDeleteDialogOpen(false);
      setCurrentLeaveType(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف نوع الإجازة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeaveTypeMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLeaveType) {
      updateLeaveTypeMutation.mutate({
        id: currentLeaveType.id,
        ...formData,
      });
    }
  };

  const handleEditClick = (leaveType: LeaveType) => {
    setCurrentLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description || "",
      color: leaveType.color || "#4CAF50",
      is_paid: leaveType.is_paid,
      max_days_per_year: leaveType.max_days_per_year || 0,
      requires_approval: leaveType.requires_approval,
      is_active: leaveType.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (leaveType: LeaveType) => {
    setCurrentLeaveType(leaveType);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#4CAF50",
      is_paid: true,
      max_days_per_year: 0,
      requires_approval: true,
      is_active: true,
    });
    setCurrentLeaveType(null);
  };

  return (
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          أنواع الإجازات
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> إضافة نوع إجازة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة أنواع الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">حدث خطأ أثناء تحميل البيانات</div>
          ) : leaveTypes && leaveTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>مدفوعة</TableHead>
                  <TableHead>الحد الأقصى</TableHead>
                  <TableHead>تتطلب موافقة</TableHead>
                  <TableHead>نشطة</TableHead>
                  <TableHead>متاح لـ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: leaveType.color || "#4CAF50" }}
                        ></div>
                        {leaveType.name}
                      </div>
                    </TableCell>
                    <TableCell>{leaveType.description}</TableCell>
                    <TableCell>{leaveType.is_paid ? "نعم" : "لا"}</TableCell>
                    <TableCell>{leaveType.max_days_per_year || "-"}</TableCell>
                    <TableCell>{leaveType.requires_approval ? "نعم" : "لا"}</TableCell>
                    <TableCell>{leaveType.is_active ? "نعم" : "لا"}</TableCell>
                    <TableCell>{getGenderEligibilityText(leaveType.gender_eligibility)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(leaveType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(leaveType)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">لا توجد أنواع إجازات مضافة</div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة نوع إجازة جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل نوع الإجازة الجديد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم نوع الإجازة</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">اللون</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-8 p-1"
                  />
                  <span>{formData.color}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_days_per_year">الحد الأقصى للأيام سنويا</Label>
                <Input
                  id="max_days_per_year"
                  name="max_days_per_year"
                  type="number"
                  min="0"
                  value={formData.max_days_per_year}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>متاح لـ</Label>
                <RadioGroup 
                  value={formData.gender_eligibility} 
                  onValueChange={handleRadioChange}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">كلاهما</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">ذكور فقط</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">إناث فقط</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => handleCheckboxChange("is_paid", checked as boolean)}
                />
                <Label htmlFor="is_paid">إجازة مدفوعة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_approval"
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => handleCheckboxChange("requires_approval", checked as boolean)}
                />
                <Label htmlFor="requires_approval">تتطلب موافقة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleCheckboxChange("is_active", checked as boolean)}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={addLeaveTypeMutation.isPending}>
                {addLeaveTypeMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل نوع إجازة</DialogTitle>
            <DialogDescription>
              عدل تفاصيل نوع الإجازة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">اسم نوع الإجازة</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">اللون</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-8 p-1"
                  />
                  <span>{formData.color}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-max_days_per_year">الحد الأقصى للأيام سنويا</Label>
                <Input
                  id="edit-max_days_per_year"
                  name="max_days_per_year"
                  type="number"
                  min="0"
                  value={formData.max_days_per_year}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>متاح لـ</Label>
                <RadioGroup 
                  value={formData.gender_eligibility} 
                  onValueChange={handleRadioChange}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="both" id="edit-both" />
                    <Label htmlFor="edit-both">كلاهما</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="male" id="edit-male" />
                    <Label htmlFor="edit-male">ذكور فقط</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="female" id="edit-female" />
                    <Label htmlFor="edit-female">إناث فقط</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => handleCheckboxChange("is_paid", checked as boolean)}
                />
                <Label htmlFor="edit-is_paid">إجازة مدفوعة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-requires_approval"
                  checked={formData.requires_approval}
                  onCheckedChange={(checked) => handleCheckboxChange("requires_approval", checked as boolean)}
                />
                <Label htmlFor="edit-requires_approval">تتطلب موافقة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleCheckboxChange("is_active", checked as boolean)}
                />
                <Label htmlFor="edit-is_active">نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={updateLeaveTypeMutation.isPending}>
                {updateLeaveTypeMutation.isPending ? "جاري التحديث..." : "تحديث"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="حذف نوع إجازة"
        description={`هل أنت متأكد من حذف نوع الإجازة "${currentLeaveType?.name}"؟`}
        onDelete={() => currentLeaveType && deleteLeaveTypeMutation.mutate(currentLeaveType.id)}
        isDeleting={deleteLeaveTypeMutation.isPending}
      />
    </div>
  );
}