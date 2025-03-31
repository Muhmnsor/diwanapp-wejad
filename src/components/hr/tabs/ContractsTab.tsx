
import { useState } from "react";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, PencilLine, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ContractDialog } from "@/components/hr/dialogs/ContractDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContractsTabProps {
  employeeId: string;
}

export function ContractsTab({ employeeId }: ContractsTabProps) {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { 
    contracts, 
    isLoading, 
    createContract, 
    updateContract, 
    deleteContract,
    uploadContractDocument 
  } = useEmployeeContracts(employeeId);
  
  const handleSaveContract = async (contractData: any, file?: File) => {
    let documentUrl = contractData.document_url || null;
    
    // If there's a file to upload
    if (file) {
      const contractId = selectedContract?.id || 'new';
      documentUrl = await uploadContractDocument(file, contractId);
    }
    
    // Save with the document URL if we have one
    if (contractData.id) {
      await updateContract({
        ...contractData,
        document_url: documentUrl
      });
    } else {
      await createContract({
        ...contractData,
        document_url: documentUrl
      });
    }
  };
  
  const handleDeleteContract = async () => {
    if (selectedContract?.id) {
      await deleteContract(selectedContract.id);
      setIsDeleteDialogOpen(false);
      setSelectedContract(null);
    }
  };
  
  const getStatusBadge = (status: string, endDate: string | null) => {
    // Check if contract is expired based on end date
    const isExpired = endDate && new Date(endDate) < new Date();
    
    switch (status) {
      case 'active':
        if (isExpired) {
          return <Badge variant="destructive">منتهي</Badge>;
        }
        return <Badge variant="success" className="bg-green-500">ساري</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'terminated':
        return <Badge variant="outline" className="border-red-500 text-red-500">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatContractType = (type: string) => {
    switch (type) {
      case 'permanent': return 'دائم';
      case 'temporary': return 'مؤقت';
      case 'contract': return 'تعاقد';
      default: return type;
    }
  };
  
  const CheckProbation = ({ date }: { date: string | null }) => {
    if (!date) return null;
    
    const probationDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((probationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    
    if (diffDays <= 14) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>فترة التجربة تنتهي قريباً ({diffDays} يوم)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">العقود</h2>
        <Button onClick={() => {
          setSelectedContract(null);
          setIsAddDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة عقد
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">سجل العقود</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center space-x-4 space-x-reverse">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : contracts && contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاريخ البداية</TableHead>
                  <TableHead className="text-right">تاريخ النهاية</TableHead>
                  <TableHead className="text-right">فترة التجربة</TableHead>
                  <TableHead className="text-right">نوع العقد</TableHead>
                  <TableHead className="text-right">الراتب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">العقد</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      {format(new Date(contract.start_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {contract.end_date 
                        ? format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar }) 
                        : 'غير محدد'}
                    </TableCell>
                    <TableCell className="flex items-center">
                      {contract.probation_end_date 
                        ? format(new Date(contract.probation_end_date), 'yyyy/MM/dd', { locale: ar }) 
                        : 'غير محدد'}
                      <CheckProbation date={contract.probation_end_date} />
                    </TableCell>
                    <TableCell>{formatContractType(contract.contract_type)}</TableCell>
                    <TableCell>{contract.salary.toLocaleString('ar-SA')}</TableCell>
                    <TableCell>{getStatusBadge(contract.status, contract.end_date)}</TableCell>
                    <TableCell>
                      {contract.document_url ? (
                        <a 
                          href={contract.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <FileText className="h-4 w-4 ml-1" />
                          عرض
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">غير متوفر</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsDeleteDialogOpen(true);
                          }}
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
            <div className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لا يوجد عقود مسجلة لهذا الموظف</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedContract(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة عقد جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Contract Dialog */}
      {isAddDialogOpen && (
        <ContractDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          employeeId={employeeId}
          onSave={handleSaveContract}
        />
      )}
      
      {/* Edit Contract Dialog */}
      {isEditDialogOpen && selectedContract && (
        <ContractDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          employeeId={employeeId}
          contract={selectedContract}
          onSave={handleSaveContract}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العقد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف بيانات هذا العقد نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContract} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

