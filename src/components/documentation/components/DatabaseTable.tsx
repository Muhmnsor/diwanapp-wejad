
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column {
  name: string;
  type: string;
  description: string;
}

interface DatabaseTableProps {
  name: string;
  description: string;
  columns: Column[];
}

export const DatabaseTable: React.FC<DatabaseTableProps> = ({
  name,
  description,
  columns
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-primary">{name}</span>
          <span className="text-sm text-muted-foreground">({description})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table className="w-full">
            <TableHeader className="bg-secondary/5">
              <TableRow>
                <TableHead className="w-[200px]">اسم الحقل</TableHead>
                <TableHead className="w-[150px]">النوع</TableHead>
                <TableHead>الوصف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-primary">
                    {column.name}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {column.type}
                  </TableCell>
                  <TableCell className="text-sm">
                    {column.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
