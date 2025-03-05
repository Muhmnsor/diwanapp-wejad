
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ContentItem {
  title: string;
  description: string;
}

interface DocumentationSectionProps {
  title: string;
  content: ContentItem[];
}

export const DocumentationSection = ({ title, content }: DocumentationSectionProps) => {
  return (
    <AccordionItem value={title.replace(/\s/g, "-")}>
      <AccordionTrigger className="text-lg font-semibold">{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 py-2">
          {content.map((item, index) => (
            <div key={index} className="border-r-2 border-primary pr-4">
              <h4 className="font-medium text-md">{item.title}</h4>
              <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
