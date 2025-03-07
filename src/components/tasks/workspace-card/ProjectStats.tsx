
import { CheckCircle2, Clock, PauseCircle, AlertTriangle } from "lucide-react";

interface ProjectStatsProps {
  projectCounts: {
    completed: number;
    pending: number;
    stopped: number;
    stalled: number;
    total: number;
  };
}

export const ProjectStats = ({ projectCounts }: ProjectStatsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{projectCounts.completed} مكتملة</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>{projectCounts.pending} جارية</span>
        </div>
        <div className="flex items-center gap-1">
          <PauseCircle className="h-4 w-4 text-orange-500" />
          <span>{projectCounts.stopped} متوقفة</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>{projectCounts.stalled} متعثرة</span>
        </div>
      </div>
    </div>
  );
};
