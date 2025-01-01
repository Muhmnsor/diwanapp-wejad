import { ProjectActivity } from "@/types/activity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  console.log("ProjectActivitiesList - activities:", projectActivities);

  if (!projectActivities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  return (
    <Card className="p-4">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>عنوان النشاط</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الوقت</TableHead>
            <TableHead>المكان</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">{activity.title}</TableCell>
              <TableCell>
                {format(new Date(activity.date), 'dd MMMM yyyy', { locale: ar })}
              </TableCell>
              <TableCell>{activity.time}</TableCell>
              <TableCell>{activity.location}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(activity)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(activity)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={`/activities/${activity.id}/report`} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};