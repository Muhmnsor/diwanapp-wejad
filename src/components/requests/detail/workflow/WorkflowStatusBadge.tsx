
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MessageSquareQuote, CheckCircle2, AlertCircle } from "lucide-react";

interface WorkflowStatusBadgeProps {
  status: string;
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ status }) => {
  if (status === 'opinion') {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <MessageSquareQuote className="h-3.5 w-3.5 mr-1" />
        رأي
      </Badge>
    );
  }
  
  if (status === 'decision') {
    return (
      <Badge variant="outline">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        قرار
      </Badge>
    );
  }
  
  if (status === 'notification') {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <AlertCircle className="h-3.5 w-3.5 mr-1" />
        تنبيه
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline">
      {status}
    </Badge>
  );
};
