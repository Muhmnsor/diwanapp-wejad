import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectDetailsProps {
  description: string;
  taskProgress: number;
}

export const ProjectDetails = ({ description, taskProgress }: ProjectDetailsProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">تفاصيل المشروع</h2>
      <p className="text-gray-600 mb-4">
        {description || 'لا يوجد وصف'}
      </p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>تقدم المهام</span>
          <span>{taskProgress}%</span>
        </div>
        <Progress value={taskProgress} className="h-2" />
      </div>
    </Card>
  );
};