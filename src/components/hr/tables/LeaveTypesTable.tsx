
import { useState } from "react";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { AddLeaveTypeDialog } from "../dialogs/AddLeaveTypeDialog";
import { EditLeaveTypeDialog } from "../dialogs/EditLeaveTypeDialog";
import { DeleteLeaveTypeDialog } from "../dialogs/DeleteLeaveTypeDialog";

export function LeaveTypesTable() {
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [deletingLeaveType, setDeletingLeaveType] = useState(null);
  const { data: leaveTypes, isLoading, refetch } = useLeaveTypes();

  const handleEditSuccess = () => {
    setEditingLeaveType(null);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setDeletingLeaveType(null);
    refetch();
  };

  const getGenderText = (gender) => {
    switch(gender) {
      case 'male': return 'ذكور';
      case 'female': return 'إناث';
      default: return 'الجميع';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddLeaveTypeDialog onSuccess={refetch} />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الرمز</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>مدفوعة</TableHead>
              <TableHead>متاحة للنوع</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!leaveTypes || leaveTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  لا توجد أنواع إجازات
                </TableCell>
              </TableRow>
            ) : (
              leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>{leaveType.name}</TableCell>
                  <TableCell>{leaveType.code}</TableCell>
                  <TableCell>{leaveType.description || "—"}</TableCell>
                  <TableCell>
                    {leaveType.is_paid ? (
                      <Badge variant="success">نعم</Badge>
                    ) : (
                      <Badge variant="destructive">لا</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getGenderText(leaveType.eligible_gender)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingLeaveType(leaveType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingLeaveType(leaveType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingLeaveType && (
        <EditLeaveTypeDialog
          leaveType={editingLeaveType}
          open={!!editingLeaveType}
          onClose={() => setEditingLeaveType(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingLeaveType && (
        <DeleteLeaveTypeDialog
          leaveType={deletingLeaveType}
          open={!!deletingLeaveType}
          onClose={() => setDeletingLeaveType(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
