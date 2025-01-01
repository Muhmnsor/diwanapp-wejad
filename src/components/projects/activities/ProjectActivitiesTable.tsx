import { ProjectActivity } from "@/types/activity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectActivityReportsTab } from "../reports/ProjectActivityReportsTab";

interface ProjectActivitiesTableProps {
  activities: ProjectActivity[];
  onEdit: (activity: ProjectActivity) => void;
  onDelete: (activity: ProjectActivity) => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivitiesTable = ({
  activities,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivitiesTableProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  if (!activities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedActivity ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedActivity(null)}
          >
            العودة إلى قائمة الأنشطة
          </Button>
          <ProjectActivityReportsTab
            projectId={activities[0].project_id}
            activityId={selectedActivity}
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان النشاط</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الوقت</TableHead>
              <TableHead className="text-right">المكان</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.title}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell>{activity.time}</TableCell>
                <TableCell>{activity.location}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedActivity(activity.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(activity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(activity)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};