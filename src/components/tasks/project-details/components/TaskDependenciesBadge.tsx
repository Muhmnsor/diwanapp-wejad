
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Lock, AlertTriangle, Check, ArrowRight, ArrowLeft, Link } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTaskDependencies } from "../hooks/useTaskDependencies";

interface TaskDependenciesBadgeProps {
  taskId: string;
  showDetails?: boolean;
  className?: string;
}

export const TaskDependenciesBadge = ({ 
  taskId, 
  showDetails = false,
  className = ""
}: TaskDependenciesBadgeProps) => {
  const { 
    isLoading, 
    isBlockedByDependencies,
    blockedByDependencies,
    blockingDependencies,
    relatedDependencies,
    dependencyCounts
  } = useTaskDependencies(taskId);

  if (isLoading) {
    return <Badge variant="outline" className={`text-gray-500 ${className}`}>جاري التحميل...</Badge>;
  }

  // Simplified badge when no dependencies
  if (dependencyCounts.total === 0) {
    return showDetails ? (
      <div className="text-muted-foreground">لا توجد تبعيات لهذه المهمة</div>
    ) : null;
  }

  // Simple badge when not showing details and not blocked
  if (!showDetails && !isBlockedByDependencies && dependencyCounts.total > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`cursor-help ${className}`}>
              <Link className="h-3 w-3 mr-1" />
              تبعيات ({dependencyCounts.total})
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>هذه المهمة لديها {dependencyCounts.total} تبعيات</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Warning badge when blocked and not showing details
  if (!showDetails && isBlockedByDependencies) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className={`cursor-help ${className}`}>
              <Lock className="h-3 w-3 mr-1" />
              معلقة على تبعيات
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>هذه المهمة معلقة على {blockedByDependencies.length} مهام أخرى غير مكتملة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed view for dependency information
  if (showDetails) {
    return (
      <div className="space-y-2">
        {isBlockedByDependencies && (
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>هذه المهمة معلقة على مهام أخرى غير مكتملة</span>
          </div>
        )}

        {blockedByDependencies.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">تعتمد على ({blockedByDependencies.length}):</h4>
            <ul className="ml-5 space-y-1">
              {blockedByDependencies.map(dep => (
                <li key={dep.id} className="flex items-center gap-2 text-sm">
                  <Badge variant={dep.status === 'completed' ? 'success' : 'warning'} className="h-2 w-2 p-0 rounded-full" />
                  <span>{dep.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {dep.dependency_type === 'finish-to-start' ? 'يجب اكتمالها قبل البدء' :
                     dep.dependency_type === 'start-to-start' ? 'يجب بدؤها قبل البدء' :
                     dep.dependency_type === 'finish-to-finish' ? 'يجب اكتمالها قبل الاكتمال' :
                     dep.dependency_type === 'blocks' ? 'تمنع' :
                     dep.dependency_type === 'blocked_by' ? 'ممنوعة بواسطة' :
                     'مرتبطة بـ'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {blockingDependencies.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">تمنع ({blockingDependencies.length}):</h4>
            <ul className="ml-5 space-y-1">
              {blockingDependencies.map(dep => (
                <li key={dep.id} className="flex items-center gap-2 text-sm">
                  <Badge variant={dep.status === 'completed' ? 'success' : 'warning'} className="h-2 w-2 p-0 rounded-full" />
                  <span>{dep.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {dep.dependency_type === 'finish-to-start' ? 'تبدأ بعد اكتمال هذه المهمة' :
                     dep.dependency_type === 'start-to-start' ? 'تبدأ بعد بدء هذه المهمة' :
                     dep.dependency_type === 'finish-to-finish' ? 'تكتمل بعد اكتمال هذه المهمة' :
                     dep.dependency_type === 'blocks' ? 'ممنوعة بواسطة' :
                     dep.dependency_type === 'blocked_by' ? 'تمنع' :
                     'مرتبطة بـ'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedDependencies.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">مرتبطة بـ ({relatedDependencies.length}):</h4>
            <ul className="ml-5 space-y-1">
              {relatedDependencies.map(dep => (
                <li key={dep.id} className="flex items-center gap-2 text-sm">
                  <Badge variant={dep.status === 'completed' ? 'success' : 'warning'} className="h-2 w-2 p-0 rounded-full" />
                  <span>{dep.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback badge
  return (
    <Badge variant="outline" className={className}>
      <Link className="h-3 w-3 mr-1" />
      تبعيات ({dependencyCounts.total})
    </Badge>
  );
};
