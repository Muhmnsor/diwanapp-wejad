
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DependencyIcon } from '../../../components/dependencies/DependencyIcon';

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
  const hasPendingDependencies = !isComplete && type === 'dependencies';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${isComplete 
              ? 'border-green-500 text-green-600 bg-green-50'
              : type === 'dependencies'
                ? 'border-amber-500 text-amber-600 bg-amber-50'
                : 'border-blue-500 text-blue-600 bg-blue-50'
            }`}
          >
            <DependencyIcon 
              hasDependencies={type === 'dependencies'} 
              hasPendingDependencies={hasPendingDependencies}
              hasDependents={type === 'dependents'}
              size={12}
            />
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
