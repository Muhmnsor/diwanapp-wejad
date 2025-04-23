
import { useEffect, useState } from 'react';
import { Task } from "../../types/task";
import { Card } from "@/components/ui/card";

interface DragDebugInfo {
  draggedTask: Task | null;
  sourcePosition: number | null;
  targetPosition: number | null;
  status: string;
  error: string | null;
  stageId?: string | null;
}

export const DragDebugOverlay = () => {
  const [debugInfo, setDebugInfo] = useState<DragDebugInfo>({
    draggedTask: null,
    sourcePosition: null,
    targetPosition: null,
    status: 'idle',
    error: null,
    stageId: null
  });

  // Listen to custom debug events
  useEffect(() => {
    const handleDebugEvent = (e: CustomEvent<DragDebugInfo>) => {
      console.log("Debug event received:", e.detail);
      setDebugInfo(e.detail);
    };

    window.addEventListener('dragDebugUpdate' as any, handleDebugEvent);
    return () => {
      window.removeEventListener('dragDebugUpdate' as any, handleDebugEvent);
    };
  }, []);

  // Only hide if truly idle with no recent activity
  if (debugInfo.status === 'idle' && !debugInfo.draggedTask && !debugInfo.error) return null;

  // Color coding for status
  const getStatusColor = () => {
    switch (debugInfo.status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'reordering': return 'text-blue-600';
      case 'updating': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 w-96 bg-background/95 backdrop-blur shadow-lg border-2 border-primary z-50 text-sm space-y-2">
      <h3 className="font-medium text-primary">Drag & Drop Debug Info</h3>
      <div className="space-y-2 text-foreground">
        <p className={`font-medium ${getStatusColor()}`}>Status: {debugInfo.status}</p>
        
        {debugInfo.stageId && (
          <div className="bg-muted/50 p-2 rounded">
            <p className="text-xs text-muted-foreground">Stage ID:</p>
            <p className="font-medium text-xs text-primary/80">{debugInfo.stageId}</p>
          </div>
        )}
        
        {debugInfo.draggedTask && (
          <div className="border-l-2 border-primary pl-2 my-2">
            <p className="font-semibold">Dragged Task:</p>
            <p>Title: <span className="font-medium">{debugInfo.draggedTask.title}</span></p>
            <p>ID: <span className="text-xs text-muted-foreground">{debugInfo.draggedTask.id}</span></p>
            <p>Current Position: <span className="font-medium">{debugInfo.draggedTask.order_position}</span></p>
            {debugInfo.draggedTask.stage_id && (
              <p>Stage ID: <span className="text-xs text-primary/80">{debugInfo.draggedTask.stage_id}</span></p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {debugInfo.sourcePosition !== null && (
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Source Position:</p>
              <p className="font-medium">{debugInfo.sourcePosition}</p>
            </div>
          )}
          
          {debugInfo.targetPosition !== null && (
            <div className="bg-muted/50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Target Position:</p>
              <p className="font-medium">{debugInfo.targetPosition}</p>
            </div>
          )}
        </div>
        
        {debugInfo.error && (
          <div className="border-l-2 border-destructive p-2 bg-destructive/10 rounded">
            <p className="text-destructive font-medium">Error:</p>
            <p className="text-xs break-words">{debugInfo.error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
