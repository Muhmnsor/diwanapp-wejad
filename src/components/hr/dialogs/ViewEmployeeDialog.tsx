
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Employee } from "@/types/hr";
import { UserCircle, Briefcase, CalendarClock, FileText } from "lucide-react";
import { EmployeeBasicInfo } from "../employee/EmployeeBasicInfo";
import { EmployeeContractInfo } from "../employee/EmployeeContractInfo";
import { EmployeeAttendanceInfo } from "../employee/EmployeeAttendanceInfo";
import { EmployeeDocumentsInfo } from "../employee/EmployeeDocumentsInfo";

interface ViewEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 mb-2">
            <UserCircle className="h-6 w-6" />
            تفاصيل الموظف: {employee.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="documents" className="flex items-center gap-1 justify-center">
              <FileText className="h-4 w-4 ml-1" />
              المستندات
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-1 justify-center">
              <CalendarClock className="h-4 w-4 ml-1" />
              الحضور
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center gap-1 justify-center">
              <Briefcase className="h-4 w-4 ml-1" />
              العقد
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-1 justify-center">
              <UserCircle className="h-4 w-4 ml-1" />
              المعلومات الأساسية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <EmployeeBasicInfo employee={employee} />
          </TabsContent>
          
          <TabsContent value="contract" className="space-y-4">
            <EmployeeContractInfo employee={employee} />
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <EmployeeAttendanceInfo employee={employee} />
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <EmployeeDocumentsInfo employee={employee} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
