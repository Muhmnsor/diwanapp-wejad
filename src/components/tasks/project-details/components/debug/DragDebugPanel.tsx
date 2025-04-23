
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DragDebugInfo {
  activeTaskId: string | null;
  overTaskId: string | null;
  isDragging: boolean;
  currentStageId: string | null;
  targetStageId: string | null;
  reorderStatus: 'idle' | 'loading' | 'success' | 'error';
  lastError: string | null;
}

interface DragDebugPanelProps {
  debugInfo: DragDebugInfo;
}

export const DragDebugPanel = ({ debugInfo }: DragDebugPanelProps) => {
  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white/90 backdrop-blur shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Drag & Drop Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <div className="font-semibold">Active Task:</div>
          <div>{debugInfo.activeTaskId || 'None'}</div>
          
          <div className="font-semibold">Over Task:</div>
          <div>{debugInfo.overTaskId || 'None'}</div>
          
          <div className="font-semibold">Is Dragging:</div>
          <div>{debugInfo.isDragging ? 'Yes' : 'No'}</div>
          
          <div className="font-semibold">Current Stage:</div>
          <div>{debugInfo.currentStageId || 'None'}</div>
          
          <div className="font-semibold">Target Stage:</div>
          <div>{debugInfo.targetStageId || 'None'}</div>
          
          <div className="font-semibold">Reorder Status:</div>
          <div className={
            debugInfo.reorderStatus === 'error' ? 'text-red-500' :
            debugInfo.reorderStatus === 'success' ? 'text-green-500' :
            debugInfo.reorderStatus === 'loading' ? 'text-blue-500' :
            'text-gray-500'
          }>
            {debugInfo.reorderStatus}
          </div>
        </div>
        
        {debugInfo.lastError && (
          <div className="mt-2 p-2 bg-red-50 rounded text-red-600 break-words">
            Error: {debugInfo.lastError}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
