import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectActivity } from "@/types/activity";
import { ProjectActivityActions } from "./ProjectActivityActions";

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
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>العنوان</TableHead>
          <TableHead>التاريخ والوقت</TableHead>
          <TableHead>الموقع</TableHead>
          <TableHead>الوصف</TableHead>
          <TableHead>متطلبات خاصة</TableHead>
          <TableHead>رابط الموقع</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell>{activity.title}</TableCell>
            <TableCell>{activity.date} - {activity.time}</TableCell>
            <TableCell>{activity.location}</TableCell>
            <TableCell>{activity.description || '-'}</TableCell>
            <TableCell>{activity.special_requirements || '-'}</TableCell>
            <TableCell>
              {activity.location_url ? (
                <a
                  href={activity.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  رابط الموقع
                </a>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              <ProjectActivityActions
                activity={activity}
                onEdit={() => onEdit(activity)}
                onDelete={() => onDelete(activity)}
                onEditSuccess={onEditSuccess}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};