// Fix for the EmployeeContractsTabs.tsx file
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddContractDialog } from "@/components/hr/dialogs/AddContractDialog";
import { EditContractDialog } from "@/components/hr/dialogs/EditContractDialog";
import { useContracts } from "@/hooks/hr/useContracts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns";

// Update the EditContractDialog component props to include a contract
export function EmployeeContractsTabs({ employeeId }: { employeeId: string }) {
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isEditContractOpen, setIsEditContractOpen] = useState(false);
  
  // Assuming there's a selectedContract state or similar
  const [selectedContract, setSelectedContract] = useState<any>(null);
  
  const { contracts, isLoading, refreshContracts } = useContracts(employeeId);
  
  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setIsEditContractOpen(true);
  };
  
  // Update the EditContractDialog component
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>عقود الموظف</CardTitle>
          <Button onClick={() => setIsAddContractOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة عقد
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>جاري التحميل...</div>
          ) : contracts.length === 0 ? (
            <div>لا يوجد عقود لهذا الموظف.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نوع العقد</TableHead>
                    <TableHead className="text-right">تاريخ البداية</TableHead>
                    <TableHead className="text-right">تاريخ النهاية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium text-right">{contract.contract_type}</TableCell>
                      <TableCell className="text-right">{format(new Date(contract.start_date), "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">{format(new Date(contract.end_date), "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">{contract.status}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handleEditContract(contract)}>
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isAddContractOpen && (
        <AddContractDialog 
          isOpen={isAddContractOpen} 
          onClose={() => setIsAddContractOpen(false)} 
          employeeId={employeeId} 
          onSuccess={refreshContracts} 
        />
      )}
      
      {isEditContractOpen && (
        <EditContractDialog 
          isOpen={isEditContractOpen} 
          onClose={() => setIsEditContractOpen(false)} 
          employeeId={employeeId} 
          contract={selectedContract} // Add the contract prop
          onSuccess={refreshContracts} 
        />
      )}
    </div>
  );
}
