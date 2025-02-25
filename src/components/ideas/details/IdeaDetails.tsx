
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface IdeaDetailsProps {
  idea: {
    description: string;
    opportunity: string;
    problem: string;
    benefits: string;
    required_resources: string;
    contributing_departments: { name: string; contribution: string }[];
    expected_costs: { item: string; quantity: number; total_cost: number }[];
    expected_partners: { name: string; contribution: string }[];
  };
}

export const IdeaDetails = ({ idea }: IdeaDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">تفاصيل الفكرة</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <>
                <EyeOff className="ml-2 h-4 w-4" />
                إخفاء التفاصيل
              </>
            ) : (
              <>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">وصف الفكرة</h3>
          <p className="text-muted-foreground">{idea.description}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">المشكلة</h3>
          <p className="text-muted-foreground">{idea.problem}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الفرصة</h3>
          <p className="text-muted-foreground">{idea.opportunity}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الفوائد المتوقعة</h3>
          <p className="text-muted-foreground">{idea.benefits}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">الموارد المطلوبة</h3>
          <p className="text-muted-foreground">{idea.required_resources}</p>
        </section>

        {idea.contributing_departments?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الإدارات المساهمة</h3>
            <div className="space-y-3">
              {idea.contributing_departments.map((dept, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{dept.name}</h4>
                  <p className="text-sm text-muted-foreground">{dept.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {idea.expected_costs?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">التكاليف المتوقعة</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-right">البند</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-center">التكلفة الإجمالية</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.expected_costs.map((cost, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{cost.item}</td>
                      <td className="p-2 text-center">{cost.quantity}</td>
                      <td className="p-2 text-center">{cost.total_cost} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {idea.expected_partners?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-2">الشركاء المتوقعون</h3>
            <div className="space-y-3">
              {idea.expected_partners.map((partner, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{partner.name}</h4>
                  <p className="text-sm text-muted-foreground">{partner.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
