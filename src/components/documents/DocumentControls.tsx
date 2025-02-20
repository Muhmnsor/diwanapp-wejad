
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocumentControlsProps {
  onSearch: (query: string) => void;
  onFilterStatusChange: (statuses: string[]) => void;
}

const statuses = [
  { name: 'ساري', color: 'text-green-500' },
  { name: 'منتهي', color: 'text-red-500' },
  { name: 'قريب من الانتهاء', color: 'text-yellow-500' },
];

export const DocumentControls = ({
  onSearch,
  onFilterStatusChange,
}: DocumentControlsProps) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleStatusToggle = (status: string) => {
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newSelectedStatuses);
    onFilterStatusChange(newSelectedStatuses);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Input
          placeholder="بحث في المستندات..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full"
          dir="rtl"
        />
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger>تصفية حسب الحالة</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="flex flex-wrap gap-2 p-2">
                {statuses.map((status) => (
                  <Button
                    key={status.name}
                    variant={selectedStatuses.includes(status.name) ? "default" : "outline"}
                    className="border rounded-full"
                    onClick={() => handleStatusToggle(status.name)}
                  >
                    <Badge variant="outline" className={`${status.color} border-0`}>●</Badge>
                    <span className="mr-2">{status.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
