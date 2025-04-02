
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractsList } from "@/components/hr/contracts/ContractsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditContractDialog } from "@/components/hr/dialogs/EditContractDialog";
import { UserEmployeeLink } from "@/components/hr/user-management/UserEmployeeLink";

interface EmployeeContractsTabsProps {
  employeeId: string;
  employeeName: string;
  contracts: any[];
  currentUserId: string | null;
  onContractUpdated?: () => void;
}

export function EmployeeContractsTabs({
  employeeId,
  employeeName,
  contracts,
  currentUserId,
  onContractUpdated
}: EmployeeContractsTabsProps) {
  const [addContractOpen, setAddContractOpen] = useState(false);
  const [userLinkOpen, setUserLinkOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="contracts">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="user-link">حساب المستخدم</TabsTrigger>
          </TabsList>
          
          <div>
            {/* Show Add Contract button only on contracts tab */}
            <TabsContent value="contracts" className="mt-0 p-0">
              <Button onClick={() => setAddContractOpen(true)} size="sm">
                <Plus className="h-4 w-4 ml-1" />
                إضافة عقد
              </Button>
            </TabsContent>
            
            {/* Show Link User button only on user-link tab */}
            <TabsContent value="user-link" className="mt-0 p-0">
              <Button onClick={() => setUserLinkOpen(true)} size="sm">
                <Plus className="h-4 w-4 ml-1" />
                {currentUserId ? "تغيير ربط المستخدم" : "ربط مستخدم"}
              </Button>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="contracts" className="pt-2">
          <ContractsList 
            contracts={contracts}
            employeeId={employeeId}
            onContractUpdated={onContractUpdated}
          />
        </TabsContent>
        
        <TabsContent value="user-link" className="pt-2">
          <div className="border rounded-lg p-4 bg-muted/10">
            <h3 className="text-lg font-medium mb-3">حالة ربط المستخدم</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">الموظف:</span>
                <span>{employeeName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">حساب المستخدم:</span>
                <span>{currentUserId ? "مرتبط بحساب مستخدم" : "غير مرتبط بحساب مستخدم"}</span>
              </div>
              <div className="mt-4">
                <Button onClick={() => setUserLinkOpen(true)} variant="outline" className="w-full">
                  {currentUserId ? "تغيير ربط المستخدم" : "ربط بحساب مستخدم"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Contract Dialog */}
      <EditContractDialog
        isOpen={addContractOpen}
        onClose={() => setAddContractOpen(false)}
        employeeId={employeeId}
        onSuccess={() => {
          setAddContractOpen(false);
          if (onContractUpdated) onContractUpdated();
        }}
      />
      
      {/* User-Employee Link Dialog */}
      <UserEmployeeLink
        isOpen={userLinkOpen}
        onClose={() => setUserLinkOpen(false)}
        employeeId={employeeId}
        employeeName={employeeName}
        currentUserId={currentUserId}
        onSuccess={() => {
          setUserLinkOpen(false);
          if (onContractUpdated) onContractUpdated();
        }}
      />
    </div>
  );
}
