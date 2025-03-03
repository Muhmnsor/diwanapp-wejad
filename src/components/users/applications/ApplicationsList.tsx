
import { Application } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ApplicationsListProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
}

export const ApplicationsList = ({ applications, onEdit, onDelete }: ApplicationsListProps) => {
  if (applications.length === 0) {
    return <p className="text-center text-muted-foreground py-8">لا توجد تطبيقات متاحة حالياً</p>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم التطبيق</TableHead>
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">الرمز</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.name}</TableCell>
              <TableCell>{app.description || "-"}</TableCell>
              <TableCell className="font-mono text-sm">{app.code}</TableCell>
              <TableCell>{formatDate(app.created_at)}</TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(app)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(app)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch (error) {
    return dateString;
  }
}
