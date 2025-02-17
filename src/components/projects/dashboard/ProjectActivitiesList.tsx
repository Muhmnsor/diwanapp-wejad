
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
import { Edit2, Trash2, Link, Star } from "lucide-react";
import { EditActivityDialog } from "../activities/dialogs/EditActivityDialog";
import { DeleteActivityDialog } from "../activities/dialogs/DeleteActivityDialog";
import { useState } from "react";
import { handleActivityDelete } from "../activities/card/ActivityDeleteHandler";
import { Badge } from "@/components/ui/badge";

interface ProjectActivitiesListProps {
  projectActivities: ProjectActivity[];
  onEdit: (activity: ProjectActivity) => void;
  onDelete: (activity: ProjectActivity) => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivitiesListProps) => {
  const [selectedActivity, setSelectedActivity] = useState<ProjectActivity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivitiesList - activities:", projectActivities);

  if (!projectActivities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  const handleEditClick = (activity: ProjectActivity) => {
    setSelectedActivity(activity);
    setIsEditDialogOpen(true);
    onEdit(activity);
  };

  const handleDeleteClick = (activity: ProjectActivity) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    const success = await handleActivityDelete(selectedActivity.id);
    if (success) {
      onDelete(selectedActivity);
      setIsDeleteDialogOpen(false);
    }
    setIsLoading(false);
  };

  const calculateAverageRating = (feedback: ProjectActivity['activity_feedback']) => {
    if (!feedback || feedback.length === 0) return null;
    
    const sum = feedback.reduce((acc, curr) => acc + (curr.overall_rating || 0), 0);
    return (sum / feedback.length).toFixed(1);
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold text-primary text-center">النشاط</TableHead>
            <TableHead className="font-bold text-primary text-center">التاريخ</TableHead>
            <TableHead className="font-bold text-primary text-center">الوقت</TableHead>
            <TableHead className="font-bold text-primary text-center">المكان</TableHead>
            <TableHead className="font-bold text-primary text-center">رابط الموقع</TableHead>
            <TableHead className="font-bold text-primary text-center">الاحتياجات الخاصة</TableHead>
            <TableHead className="font-bold text-primary text-center">ساعات النشاط</TableHead>
            <TableHead className="font-bold text-primary text-center">التقييمات</TableHead>
            <TableHead className="font-bold text-primary text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectActivities.map((activity) => {
            const averageRating = calculateAverageRating(activity.activity_feedback);
            const feedbackCount = activity.activity_feedback?.length || 0;
            
            return (
              <TableRow 
                key={activity.id}
                className="transition-colors hover:bg-muted/30"
              >
                <TableCell className="font-medium text-primary/80 text-center">{activity.title}</TableCell>
                <TableCell className="text-gray-600 text-center">{activity.date}</TableCell>
                <TableCell className="text-gray-600 text-center">{activity.time}</TableCell>
                <TableCell className="text-gray-600 text-center">{activity.location}</TableCell>
                <TableCell className="text-gray-600 text-center">
                  {activity.location_url ? (
                    <a
                      href={activity.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline justify-center"
                    >
                      <Link className="h-4 w-4" />
                      رابط الموقع
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-gray-600 text-center">
                  {activity.special_requirements || "-"}
                </TableCell>
                <TableCell className="text-gray-600 text-center">{activity.activity_duration}</TableCell>
                <TableCell className="text-center">
                  {feedbackCount > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {averageRating}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        ({feedbackCount} تقييم)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(activity)}
                      disabled={isLoading}
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(activity)}
                      disabled={isLoading}
                      className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedActivity && isEditDialogOpen && (
        <EditActivityDialog
          activity={selectedActivity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onEditSuccess}
          projectId={selectedActivity.project_id}
        />
      )}

      <DeleteActivityDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
