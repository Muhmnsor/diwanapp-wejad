
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { AddContractDialog } from "./AddContractDialog";
import { ContractsList } from "../contracts/ContractsList";

interface EmployeeContractsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess?: () => void;
}

export function EmployeeContractsDialog({ 
  isOpen, 
  onClose, 
  employee,
  onSuccess
}: EmployeeContractsDialogProps) {
  const [addContractOpen, setAddContractOpen] = useState(false);
  const { contracts, isLoading, error } = useEmployeeContracts(employee?.id);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>عقود الموظف: {employee?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">العقود</h3>
              <Button 
                onClick={() => setAddContractOpen(true)}
                size="sm"
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                إضافة عقد
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  حدث خطأ أثناء تحميل العقود: {error.message}
                </AlertDescription>
              </Alert>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contracts && contracts.length > 0 ? (
              <ContractsList contracts={contracts} employeeId={employee?.id} onContractUpdated={onSuccess} />
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-md">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">لا يوجد عقود للموظف</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-1"
                  onClick={() => setAddContractOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  إضافة عقد جديد
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {employee && (
        <AddContractDialog
          isOpen={addContractOpen}
          onClose={() => setAddContractOpen(false)}
          employeeId={employee.id}
          employeeName={employee.full_name}
          onSuccess={() => {
            setAddContractOpen(false);
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </>
  );
}
