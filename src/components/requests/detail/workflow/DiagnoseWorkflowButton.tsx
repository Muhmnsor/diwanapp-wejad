
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wrench } from 'lucide-react'; // Changed from 'Tool' to 'Wrench'

interface DiagnoseWorkflowButtonProps {
  onClick: () => void;
}

export const DiagnoseWorkflowButton = ({ onClick }: DiagnoseWorkflowButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="ml-2"
          >
            <Wrench className="h-4 w-4 mr-2" />
            تشخيص سير العمل
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>تشخيص مشاكل سير العمل وإصلاحها</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
