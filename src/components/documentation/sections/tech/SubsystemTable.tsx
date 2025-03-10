
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SubsystemTableProps {
  title: string;
  description: string;
  items: {
    component: string;
    details: string[];
  }[];
  path: string;
}

export const SubsystemTable = ({ title, description, items, path }: SubsystemTableProps) => {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="bg-card p-3 rounded-md mb-3">
        <p className="text-sm">{description}</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">المكون</TableHead>
            <TableHead className="w-3/4">التفاصيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.component}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {item.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-2 text-sm text-muted-foreground">
        المسار: <code>{path}</code>
      </div>
    </div>
  );
};
