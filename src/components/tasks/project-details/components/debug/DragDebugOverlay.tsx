
import { useEffect, useState } from 'react';
import { Task } from "../../types/task";
import { Card } from "@/components/ui/card";

interface DragDebugInfo {
  draggedTask: Task | null;
  sourcePosition: number | null;
  targetPosition: number | null;
  status: string;
  error: string | null;
}

export const DragDebugOverlay = () => {
  const [debugInfo, setDebugInfo] = useState<DragDebugInfo>({
    draggedTask: null,
    sourcePosition: null,
    targetPosition: null,
    status: 'idle',
    error: null
  });

  // Listen to custom debug events
  useEffect(() => {
    const handleDebugEvent = (e: CustomEvent<DragDebugInfo>) => {
      setDebugInfo(e.detail);
    };

    window.addEventListener('dragDebugUpdate' as any, handleDebugEvent);
    return () => {
      window.removeEventListener('dragDebugUpdate' as any, handleDebugEvent);
    };
  }, []);

  if (!debugInfo.draggedTask && debugInfo.status === 'idle') return null;

  return (
    <Card className="fixed bottom-4 right-4 p-4 w-96 bg-background/95 backdrop-blur shadow-lg border z-50 text-sm space-y-2">
      <h3 className="font-medium text-primary">Drag & Drop Debug Info</h3>
      <div className="space-y-1 text-muted-foreground">
        <p>Status: <span className="text-foreground">{debugInfo.status}</span></p>
        {debugInfo.draggedTask && (
          <>
            <p>Task: <span className="text-foreground">{debugInfo.draggedTask.title}</span></p>
            <p>Task ID: <span className="text-foreground">{debugInfo.draggedTask.id}</span></p>
          </>
        )}
        {debugInfo.sourcePosition !== null && (
          <p>Source Position: <span className="text-foreground">{debugInfo.sourcePosition}</span></p>
        )}
        {debugInfo.targetPosition !== null && (
          <p>Target Position: <span className="text-foreground">{debugInfo.targetPosition}</span></p>
        )}
        {debugInfo.error && (
          <p className="text-destructive">Error: {debugInfo.error}</p>
        )}
      </div>
    </Card>
  );
};
