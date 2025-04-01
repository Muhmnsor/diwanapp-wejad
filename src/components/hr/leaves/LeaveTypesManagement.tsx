import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  is_paid: boolean;
  max_days_per_year: number | null;
  requires_approval: boolean;
  color: string | null;
  is_active: boolean;
  created_at?: string;
}

export function LeaveTypesManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [maxDaysPerYear, setMaxDaysPerYear] = useState<number | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [color, setColor] = useState("#4f46e5");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hr_leave_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setLeaveTypes(data || []);

      // If no leave types exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultLeaveTypes();
        fetchLeaveTypes();
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      toast({
        title: "خطأ في جلب أنواع الإجازات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultLeaveTypes = async () => {
    const defaultLeaveTypes = [
      {
        name: "إجازة سنوية",
        description: "الإجازة السنوية المدفوعة",
        is_paid: true,
        max_days_per_year: 30,
        requires_approval: true,
        color: "#4f46e5",
        is_active: true,
      },
      {
        name: "إجازة مرضية",
        description: "إجازة للمرض أو الإصابة",
        is_paid: true,
        max_days_per_year: 14,
        requires_approval: true,
        color: "#ef4444",
        is_active: true,
      },
      {
        name: "إجازة طارئة",
        description: "إجازة قصيرة للأمور الطارئة",
        is_paid: true,
        max_days_per_year: 5,
        requires_approval: true,
        color: "#f59e0b",
        is_active: true,
      },
      {
        name: "إجازة بدون راتب",
        description: "إجازة غير مدفوعة",
        is_paid: false,
        max_days_per_year: null,
        requires_approval: true,
        color: "#6b7280",
        is_active: true,
      },
    ];

    await supabase.from("hr_leave_types").insert(defaultLeaveTypes);
  };

  const handleAddLeaveType = async () => {
    try {
      if (!name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم نوع الإجازة",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("hr_leave_types")
        .insert({
          name,
          description: description || null,
          is_paid: isPaid,
          max_days_per_year: maxDaysPerYear,
          requires_approval: requiresApproval,
          color,
          is_active: isActive,
        });

      if (error) throw error;

      toast({
        title: "تم إضافة نوع الإجازة بنجاح",
      });

      resetForm();
      setShowAddDialog(false);
      fetchLeaveTypes();
    } catch (error) {
      console.error("Error adding leave type:", error);
      toast({
        title: "خطأ في إضافة نوع الإجازة",
        variant: "destructive",
      });
    }
  };

  const handleEditLeaveType = async () => {
    try {
      if (!selectedLeaveType) return;

      if (!name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم نوع الإجازة",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("hr_leave_types")
        .update({
          name,
          description: description || null,
          is_paid: isPaid,
          max_days_per_year: maxDaysPerYear,
          requires_approval: requiresApproval,
          color,
          is_active: isActive,
        })
        .eq("id", selectedLeaveType.id);

      if (error) throw error;

      toast({
        title: "تم تحديث نوع الإجازة بنجاح",
      });

      resetForm();
      setShowEditDialog(false);
      fetchLeaveTypes();
    } catch (error) {
      console.error("Error updating leave type:", error);
      toast({
        title: "خطأ في تحديث نوع الإجازة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLeaveType = async (id: string) => {
    try {
      // Check if this leave type is being used
      const { data: leaveRequests, error: checkError } = await supabase
        .from("hr_leave_requests")
        .select("id")
        .eq("leave_type", leaveTypes.find(lt => lt.id === id)?.name || "")
        .limit(1);

      if (checkError) throw checkError;

      if (leaveRequests && leaveRequests.length > 0) {
        toast({
          title: "لا يمكن حذف نوع الإجازة",
          description: "هذا النوع مستخدم في طلبات إجازة موجودة",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("hr_leave_types")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم حذف نوع الإجازة بنجاح",
      });

      fetchLeaveTypes();
    } catch (error) {
      console.error("Error deleting leave type:", error);
      toast({
        title: "خطأ في حذف نوع الإجازة",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setName(leaveType.name);
    setDescription(leaveType.description || "");
    setIsPaid(leaveType.is_paid);
    setMaxDaysPerYear(leaveType.max_days_per_year);
    setRequiresApproval(leaveType.requires_approval);
    setColor(leaveType.color || "#4f46e5");
    setIsActive(leaveType.is_active);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsPaid(true);
    setMaxDaysPerYear(null);
    setRequiresApproval(true);
    setColor("#4f46e5");
    setIsActive(true);
    setSelectedLeaveType(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">أنواع الإجازات</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              إضافة نوع إجازة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة نوع إجازة جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم نوع الإجازة</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: إجازة سنوية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر لنوع الإجازة"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxDays">الحد الأقصى للأيام سنوياً</Label>
                <Input
                  id="maxDays"
                  type="number"
                  value={maxDaysPerYear !== null ? maxDaysPerYear : ""}
                  onChange={(e) => setMaxDaysPerYear(e.target.value ? Number(e.target.value) : null)}
                  placeholder="اترك فارغاً للأيام غير المحدودة"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">اللون</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Label htmlFor="isPaid">مدفوعة الأجر</Label>
                  <Switch
                    id="isPaid"
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Label htmlFor="requiresApproval">تتطلب موافقة</Label>
                  <Switch
                    id="requiresApproval"
                    checked={requiresApproval}
                    onCheckedChange={setRequiresApproval}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Label htmlFor="isActive">فعّال</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddLeaveType}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-4">جاري التحميل...</div>
      ) : leaveTypes.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          لا توجد أنواع إجازات. أضف نوع الإجازة الأول.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>مدفوعة الأجر</TableHead>
                  <TableHead>الحد الأقصى للأيام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: leaveType.color || '#4f46e5' }}
                        />
                        <span>{leaveType.name}</span>
                      </div>
                      {leaveType.description && (
                        <p className="text-xs text-muted-foreground">{leaveType.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {leaveType.is_paid ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          مدفوعة
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          غير مدفوعة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {leaveType.max_days_per_year !== null ? (
                        `${leaveType.max_days_per_year} يوم`
                      ) : (
                        "غير محدود"
                      )}
                    </TableCell>
                    <TableCell>
                      {leaveType.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          فعّال
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          غير فعّال
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(leaveType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLeaveType(leaveType.id)}
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
            <DialogTitle>تعديل نوع الإجازة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم نوع الإجازة</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="edit-maxDays">الحد الأقصى للأيام سنوياً</Label>
              <Input
                id="edit-maxDays"
                type="number"
                value={maxDaysPerYear !== null ? maxDaysPerYear : ""}
                onChange={(e) => setMaxDaysPerYear(e.target.value ? Number(e.target.value) : null)}
                placeholder="اترك فارغاً للأيام غير المحدودة"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-color">اللون</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Label htmlFor="edit-isPaid">مدفوعة الأجر</Label>
                <Switch
                  id="edit-isPaid"
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Label htmlFor="edit-requiresApproval">تتطلب موافقة</Label>
                <Switch
                  id="edit-requiresApproval"
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Label htmlFor="edit-isActive">فعّال</Label>
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditLeaveType}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
