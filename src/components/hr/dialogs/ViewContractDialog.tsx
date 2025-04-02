
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ViewContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
}

export function ViewContractDialog({ isOpen, onClose, contract }: ViewContractDialogProps) {
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
  
  // Format contract type
  const formatContractType = (type: string) => {
    switch (type) {
      case "permanent":
        return "دائم";
      case "temporary":
        return "مؤقت";
      case "contract":
        return "تعاقد";
      default:
        return type;
    }
  };

  const status = formatContractStatus(contract?.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>تفاصيل العقد</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">نوع العقد:</span>
              <span>{formatContractType(contract?.contract_type)}</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">تاريخ البدء:</span>
              <span>{new Date(contract?.start_date).toLocaleDateString("ar-SA")}</span>
            </div>
            
            {contract?.end_date && (
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">تاريخ الانتهاء:</span>
                <span>{new Date(contract?.end_date).toLocaleDateString("ar-SA")}</span>
              </div>
            )}
            
            {contract?.probation_end_date && (
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">نهاية فترة التجربة:</span>
                <span>{new Date(contract?.probation_end_date).toLocaleDateString("ar-SA")}</span>
              </div>
            )}
            
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">الراتب:</span>
              <span>{contract?.salary?.toLocaleString("ar-SA")} ريال</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">الحالة:</span>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">تاريخ الإنشاء:</span>
              <span>{new Date(contract?.created_at).toLocaleDateString("ar-SA")}</span>
            </div>
            
            {contract?.document_url && (
              <div className="pt-2">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(contract.document_url, "_blank")}
                >
                  <Download className="h-4 w-4 ml-2" />
                  فتح مستند العقد
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
