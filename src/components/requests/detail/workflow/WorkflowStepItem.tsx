
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepItemProps {
  step: any;
  status: 'pending' | 'current' | 'completed' | 'rejected';
  isCurrent: boolean;
}

export const WorkflowStepItem = ({ step, status, isCurrent }: WorkflowStepItemProps) => {
  // Helper function to get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'current':
        return <AlarmClock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Get initials from approver
  const getApproverInitials = () => {
    const name = step.approver?.display_name || step.approver?.email || 'مستخدم';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Get step type label
  const getStepTypeLabel = () => {
    switch (step.step_type) {
      case 'opinion':
        return 'رأي';
      case 'decision':
        return 'قرار';
      case 'notification':
        return 'إشعار';
      default:
        return 'قرار';
    }
  };
  
  // Get color for step type
  const getStepTypeBadgeClass = () => {
    switch (step.step_type) {
      case 'opinion':
        return 'bg-blue-100 text-blue-700';
      case 'decision':
        return 'bg-amber-100 text-amber-700';
      case 'notification':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn(
      "flex items-center p-2 rounded-lg", 
      isCurrent ? "bg-blue-50 border border-blue-100" : "bg-gray-50",
      status === 'completed' && "bg-green-50/50",
      status === 'rejected' && "bg-red-50/50"
    )}>
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className={cn(
            status === 'completed' ? "bg-green-100 text-green-700" : 
            status === 'rejected' ? "bg-red-100 text-red-700" :
            status === 'current' ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-700"
          )}>
            {getApproverInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-grow mr-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium text-sm">
              {step.step_name || 'خطوة غير مسماة'}
            </div>
            <div className="text-xs text-muted-foreground">
              {step.approver?.display_name || step.approver?.email || 'غير محدد'}
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={cn(
              "text-xs py-0.5 px-1.5 rounded-full mr-1",
              getStepTypeBadgeClass()
            )}>
              {getStepTypeLabel()}
            </span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
