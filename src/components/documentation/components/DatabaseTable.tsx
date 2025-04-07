
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableInfo {
  name: string;
  description: string;
}

interface DatabaseTableProps {
  title: string;
  tables: TableInfo[];
}

export const DatabaseTable = ({ title, tables }: DatabaseTableProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={title.replace(/\s/g, "-")}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الجدول</TableHead>
                <TableHead>الوصف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{table.name}</TableCell>
                  <TableCell>{table.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
