
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wrench, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess: () => Promise<any>;
  isDiagnosing?: boolean;
  diagnosticResult?: any;
  className?: string;
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing = false,
  diagnosticResult,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDiagnose = async () => {
    try {
      await onDiagnose();
      setIsOpen(false);
    } catch (error) {
      toast.error("فشل تشخيص مسار العمل");
      console.error("Error diagnosing workflow:", error);
    }
  };

  const handleFix = async () => {
    try {
      await onFix();
      setIsOpen(false);
      toast.success("تم إصلاح مسار العمل بنجاح");
      await onSuccess();
    } catch (error) {
      toast.error("فشل إصلاح مسار العمل");
      console.error("Error fixing workflow:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await onSuccess();
      setIsOpen(false);
      toast.success("تم تحديث بيانات مسار العمل");
    } catch (error) {
      toast.error("فشل تحديث بيانات مسار العمل");
      console.error("Error refreshing workflow:", error);
    }
  };

  // Only show this button to users with appropriate permissions
  return (
    <PermissionGuard app="requests" permission="manage_workflows">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={className}
            disabled={isDiagnosing}
          >
            {isDiagnosing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                تشخيص...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                أدوات مسار العمل
                <ChevronDown className="h-4 w-4 mr-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDiagnose}>
            تشخيص مسار العمل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFix}>
            إصلاح مسار العمل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRefresh}>
            تحديث البيانات
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGuard>
  );
};
