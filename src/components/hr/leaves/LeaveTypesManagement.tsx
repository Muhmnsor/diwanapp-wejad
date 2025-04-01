
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Pencil } from "lucide-react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type LeaveType = {
  id: string;
  name: string;
  daysAllowed: number;
  isPaid: boolean;
  description?: string;
};

export function LeaveTypesManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    {
      id: "1",
      name: "إجازة سنوية",
      daysAllowed: 21,
      isPaid: true,
      description: "إجازة سنوية مدفوعة الأجر",
    },
    {
      id: "2",
      name: "إجازة مرضية",
      daysAllowed: 14,
      isPaid: true,
      description: "إجازة مرضية بموجب تقرير طبي",
    },
    {
      id: "3",
      name: "إجازة بدون راتب",
      daysAllowed: 30,
      isPaid: false,
      description: "إجازة غير مدفوعة الأجر",
    },
  ]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  
  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    daysAllowed: 0,
    isPaid: true,
    description: "",
  });

  const handleAddLeaveType = () => {
    const id = Math.random().toString(36).substring(2, 9);
    setLeaveTypes([...leaveTypes, { id, ...newLeaveType }]);
    setNewLeaveType({
      name: "",
      daysAllowed: 0,
      isPaid: true,
      description: "",
    });
    setOpenAddDialog(false);
    toast.success("تم إضافة نوع الإجازة بنجاح");
  };

  const handleEditLeaveType = () => {
    if (!selectedLeaveType) return;
    
    const updatedLeaveTypes = leaveTypes.map((type) =>
      type.id === selectedLeaveType.id ? selectedLeaveType : type
    );
    
    setLeaveTypes(updatedLeaveTypes);
    setOpenEditDialog(false);
    toast.success("تم تعديل نوع الإجازة بنجاح");
  };

  const handleDeleteLeaveType = (id: string) => {
    const updatedLeaveTypes = leaveTypes.filter((type) => type.id !== id);
    setLeaveTypes(updatedLeaveTypes);
    toast.success("تم حذف نوع الإجازة بنجاح");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">أنواع الإجازات</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة نوع إجازة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة نوع إجازة جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right col-span-1">
                  الاسم
                </Label>
                <Input
                  id="name"
                  value={newLeaveType.name}
                  onChange={(e) =>
                    setNewLeaveType({ ...newLeaveType, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="daysAllowed" className="text-right col-span-1">
                  عدد الأيام
                </Label>
                <Input
                  id="daysAllowed"
                  type="number"
                  value={newLeaveType.daysAllowed}
                  onChange={(e) =>
                    setNewLeaveType({
                      ...newLeaveType,
                      daysAllowed: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPaid" className="text-right col-span-1">
                  مدفوعة الأجر
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="isPaid"
                    type="checkbox"
                    checked={newLeaveType.isPaid}
                    onChange={(e) =>
                      setNewLeaveType({
                        ...newLeaveType,
                        isPaid: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right col-span-1">
                  الوصف
                </Label>
                <Input
                  id="description"
                  value={newLeaveType.description}
                  onChange={(e) =>
                    setNewLeaveType({
                      ...newLeaveType,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleAddLeaveType}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تعديل نوع الإجازة</DialogTitle>
            </DialogHeader>
            {selectedLeaveType && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right col-span-1">
                    الاسم
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedLeaveType.name}
                    onChange={(e) =>
                      setSelectedLeaveType({
                        ...selectedLeaveType,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-daysAllowed" className="text-right col-span-1">
                    عدد الأيام
                  </Label>
                  <Input
                    id="edit-daysAllowed"
                    type="number"
                    value={selectedLeaveType.daysAllowed}
                    onChange={(e) =>
                      setSelectedLeaveType({
                        ...selectedLeaveType,
                        daysAllowed: parseInt(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-isPaid" className="text-right col-span-1">
                    مدفوعة الأجر
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <input
                      id="edit-isPaid"
                      type="checkbox"
                      checked={selectedLeaveType.isPaid}
                      onChange={(e) =>
                        setSelectedLeaveType({
                          ...selectedLeaveType,
                          isPaid: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right col-span-1">
                    الوصف
                  </Label>
                  <Input
                    id="edit-description"
                    value={selectedLeaveType.description || ""}
                    onChange={(e) =>
                      setSelectedLeaveType({
                        ...selectedLeaveType,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleEditLeaveType}>حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة أنواع الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">عدد الأيام</TableHead>
                <TableHead className="text-right">مدفوعة الأجر</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.daysAllowed}</TableCell>
                  <TableCell>
                    {type.isPaid ? "نعم" : "لا"}
                  </TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLeaveType(type);
                          setOpenEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteLeaveType(type.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

