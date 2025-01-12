import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PortfolioWorkspaceCardProps {
  item: {
    gid: string;
    name: string;
    notes?: string;
    status?: string;
  };
  progress: number;
  onClick: (workspaceId: string) => void;
}

export const PortfolioWorkspaceCard = ({
  item,
  progress,
  onClick
}: PortfolioWorkspaceCardProps) => {
  const getPortfolioStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card 
      key={item.gid} 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(item.gid)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{item.name}</h3>
        {getPortfolioStatusIcon(item.status || 'not_started')}
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {item.notes || 'لا يوجد وصف'}
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>تقدم المشروع</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
};