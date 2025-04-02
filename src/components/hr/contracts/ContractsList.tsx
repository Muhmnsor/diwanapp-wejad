
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Eye, Download, Calendar } from "lucide-react";
import { EditContractDialog } from "../dialogs/EditContractDialog";
import { DeleteContractDialog } from "../dialogs/DeleteContractDialog";
import { ViewContractDialog } from "../dialogs/ViewContractDialog";
import { toast } from "sonner";

interface ContractsListProps {
  contracts: any[];
  employeeId: string;
  onContractUpdated?: () => void;
}

export function ContractsList({ contracts, employeeId, onContractUpdated }: ContractsListProps) {
  const [viewContractOpen, setViewContractOpen] = useState(false);
  const [editContractOpen, setEditContractOpen] = useState(false);
  const [deleteContractOpen, setDeleteContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setViewContractOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setEditContractOpen(true);
  };

  const handleDeleteContract = (contract: any) => {
    setSelectedContract(contract);
    setDeleteContractOpen(true);
  };

  const handleDownloadDocument = (contract: any) => {
    if (!contract.document_url) {
      toast.error("لا يوجد مستند مرفق لهذا العقد");
      return;
    }
    
    // Open document in new tab
    window.open(contract.document_url, "_blank");
  };

  // Format contract status
  const formatContractStatus = (status: string) => {
    switch (status) {
      case "active":
        return { label: "ساري", color: "bg-green-50 text-green-700 hover:bg-green-50" };
      case "expired":
        return { label: "منتهي", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50" };
      case "terminated":
        return { label: "ملغي", color: "bg-red-50 text-red-700 hover:bg-red-50" };
      default:
        return { label: status, color: "bg-gray-50 text-gray-700 hover:bg-gray-50" };
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نوع العقد</TableHead>
            <TableHead>تاريخ البدء</TableHead>
            <TableHead>تاريخ الانتهاء</TableHead>
            <TableHead>الراتب</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const status = formatContractStatus(contract.status);
            return (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">
                  {contract.contract_type === "permanent" 
                    ? "دائم" 
                    : contract.contract_type === "temporary" 
                      ? "مؤقت" 
                      : "تعاقد"}
                </TableCell>
                <TableCell>{new Date(contract.start_date).toLocaleDateString("ar-SA")}</TableCell>
                <TableCell>
                  {contract.end_date 
                    ? new Date(contract.end_date).toLocaleDateString("ar-SA") 
                    : "غير محدد"}
                </TableCell>
                <TableCell>{contract.salary.toLocaleString("ar-SA")}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={status.color}
                  >
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewContract(contract)}
                      title="عرض"
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContract(contract)}
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(contract)}
                      title="تنزيل المستند"
                      disabled={!contract.document_url}
                    >
                      <Download className="h-4 w-4 text-green-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContract(contract)}
                      title="حذف"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedContract && (
        <>
          <ViewContractDialog
            isOpen={viewContractOpen}
            onClose={() => setViewContractOpen(false)}
            contract={selectedContract}
          />
          
          <EditContractDialog
            isOpen={editContractOpen}
            onClose={() => setEditContractOpen(false)}
            contract={selectedContract}
            employeeId={employeeId}
            onSuccess={() => {
              setEditContractOpen(false);
              if (onContractUpdated) onContractUpdated();
            }}
          />
          
          <DeleteContractDialog
            isOpen={deleteContractOpen}
            onClose={() => setDeleteContractOpen(false)}
            contract={selectedContract}
            onSuccess={() => {
              setDeleteContractOpen(false);
              if (onContractUpdated) onContractUpdated();
            }}
          />
        </>
      )}
    </>
  );
}
