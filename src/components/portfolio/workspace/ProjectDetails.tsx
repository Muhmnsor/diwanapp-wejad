import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users } from "lucide-react";

interface ProjectDetailsProps {
  description: string;
  taskProgress: number;
  project?: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    max_attendees: number;
  } | null;
}

export const ProjectDetails = ({ description, taskProgress, project }: ProjectDetailsProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">تفاصيل المشروع</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          {description || project?.description || 'لا يوجد وصف'}
        </p>

        {project && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>تاريخ البداية: {new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>تاريخ النهاية: {new Date(project.end_date).toLocaleDateString('ar-SA')}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>عدد المشاركين: {project.max_attendees}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>تقدم المهام</span>
            <span>{taskProgress}%</span>
          </div>
          <Progress value={taskProgress} className="h-2" />
        </div>
      </div>
    </Card>
  );
};