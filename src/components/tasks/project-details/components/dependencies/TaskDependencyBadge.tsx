
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link2, Check, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskDependencyBadgeProps {
  count: number;
  completedCount: number;
  type: 'dependencies' | 'dependents';
}

export const TaskDependencyBadge = ({ 
  count, 
  completedCount, 
  type 
}: TaskDependencyBadgeProps) => {
  if (count === 0) return null;
  
  const isComplete = completedCount === count;
  const label = type === 'dependencies' ? 'اعتماديات' : 'مهام معتمدة';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${isComplete ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'}`}
          >
            <Link2 className="h-3 w-3" />
            <span>{`${completedCount}/${count} ${label}`}</span>
            {isComplete ? (
              <Check className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isComplete 
            ? `جميع ${label} المهمة مكتملة` 
            : `${count - completedCount} من ${label} المهمة غير مكتملة`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
