
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
import { FileText, Plus, AlertCircle, Loader2, User, Link } from "lucide-react";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { AddContractDialog } from "./AddContractDialog";
import { ContractsList } from "../contracts/ContractsList";
import { UserEmployeeLink } from "../user-management/UserEmployeeLink";

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
  const [userLinkOpen, setUserLinkOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("contracts");
  const { contracts, isLoading, error } = useEmployeeContracts(employee?.id);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>معلومات الموظف: {employee?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="contracts" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                العقود
              </TabsTrigger>
              <TabsTrigger value="user-link" className="flex items-center gap-1">
                <Link className="h-4 w-4" />
                ربط المستخدم
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="contracts" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="user-link" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">ربط الموظف بحساب المستخدم</h3>
                <Button 
                  onClick={() => setUserLinkOpen(true)}
                  size="sm"
                  className="gap-1"
                >
                  <Link className="h-4 w-4" />
                  ربط حساب
                </Button>
              </div>
              
              <div className="bg-muted/20 rounded-md p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ربط الموظف بحساب مستخدم يتيح له استخدام ميزات التسجيل الذاتي للحضور والانصراف
                  </p>
                  
                  {employee?.user_id ? (
                    <div className="flex items-center justify-between mt-4 p-3 border rounded-md bg-card">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <span>الموظف مرتبط بحساب مستخدم</span>
                      </div>
                      <Button 
                        onClick={() => setUserLinkOpen(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        تغيير
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-4 p-3 border rounded-md bg-card">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">الموظف غير مرتبط بحساب مستخدم</span>
                      </div>
                      <Button 
                        onClick={() => setUserLinkOpen(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        ربط حساب
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {employee && (
        <>
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
          
          <UserEmployeeLink
            isOpen={userLinkOpen}
            onClose={() => setUserLinkOpen(false)}
            employeeId={employee.id}
            employeeName={employee.full_name}
            currentUserId={employee.user_id}
            onSuccess={() => {
              setUserLinkOpen(false);
              if (onSuccess) onSuccess();
            }}
          />
        </>
      )}
    </>
  );
}
