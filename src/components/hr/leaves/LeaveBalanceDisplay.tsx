
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useLeaveBalance } from "@/hooks/hr/useLeaveBalance";

interface LeaveBalanceDisplayProps {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
}

export function LeaveBalanceDisplay({
  employeeId,
  leaveTypeId,
  startDate,
  endDate
}: LeaveBalanceDisplayProps) {
  const { balance, isLoading, checkLeaveBalance } = useLeaveBalance(employeeId, leaveTypeId);
  const [balanceCheck, setBalanceCheck] = useState<{
    hasBalance: boolean;
    available: number;
    required: number;
  } | null>(null);

  useEffect(() => {
    if (employeeId && leaveTypeId && startDate && endDate) {
      const checkBalance = async () => {
        try {
          const result = await checkLeaveBalance(employeeId, leaveTypeId, startDate, endDate);
          setBalanceCheck(result);
        } catch (error) {
          console.error("Error checking balance:", error);
        }
      };
      
      checkBalance();
    }
  }, [employeeId, leaveTypeId, startDate, endDate]);

  if (isLoading) {
    return <div className="text-sm text-gray-500">جاري التحقق من الرصيد...</div>;
  }

  if (!balance) {
    return (
      <div className="text-sm text-gray-500">
        لا يوجد رصيد محدد لهذا النوع من الإجازات
      </div>
    );
  }

  if (balanceCheck) {
    return (
      <div className={`text-sm ${balanceCheck.hasBalance ? 'text-green-600' : 'text-red-600'} flex items-center`}>
        <div>
          الرصيد المتاح: {balanceCheck.available} يوم، المطلوب: {balanceCheck.required} يوم
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 mr-1 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {balanceCheck.hasBalance 
                  ? `يمكن الموافقة على هذا الطلب. سيتبقى ${balanceCheck.available - balanceCheck.required} يوم بعد الموافقة.` 
                  : 'لا يمكن الموافقة على هذا الطلب لعدم كفاية الرصيد.'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500">
      الرصيد المتاح: {balance.available} يوم
    </div>
  );
}
