
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdeaDownloadButton } from "./components/IdeaDownloadButton";

import { IdeaTypeSection } from "./sections/IdeaTypeSection";
import { IdeaProblemSection } from "./sections/IdeaProblemSection";
import { IdeaBenefitsSection } from "./sections/IdeaBenefitsSection";
import { IdeaOpportunitySection } from "./sections/IdeaOpportunitySection";
import { IdeaDescriptionSection } from "./sections/IdeaDescriptionSection";
import { IdeaResourcesSection } from "./sections/IdeaResourcesSection";
import { IdeaExecutionSection } from "./sections/IdeaExecutionSection";
import { IdeaDepartmentsSection } from "./sections/IdeaDepartmentsSection";
import { IdeaPartnersSection } from "./sections/IdeaPartnersSection";
import { IdeaCostsSection } from "./sections/IdeaCostsSection";
import { IdeaSupportingFilesSection } from "./sections/IdeaSupportingFilesSection";
import { IdeaSimilarIdeasSection } from "./sections/IdeaSimilarIdeasSection";

interface IdeaDetailsProps {
  idea: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const IdeaDetails = ({ idea, isOpen, onOpenChange }: IdeaDetailsProps) => {
  const handleToggle = () => {
    onOpenChange(!isOpen);
  };

  // تحويل البيانات من الشكل المخزن في قاعدة البيانات إلى الشكل المطلوب للمكونات
  const departments = idea.contributing_departments?.map((dept: string) => ({
    name: dept,
    contribution: "" // يمكن إضافة المساهمة لاحقاً إذا كانت متوفرة
  })) || [];

  const partners = (idea.expected_partners || []).map((partner: any) => ({
    name: partner.name || "",
    contribution: partner.contribution || ""
  }));

  const costs = (idea.expected_costs || []).map((cost: any) => ({
    item: cost.item || "",
    quantity: cost.quantity || 0,
    total_cost: cost.total_cost || 0
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Button
          variant="ghost"
          onClick={handleToggle}
          className="flex items-center gap-2 p-0 hover:bg-transparent focus:bg-transparent"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen ? "-rotate-180" : ""
            )}
          />
          <span className="text-muted-foreground">تفاصيل الفكرة</span>
        </Button>

        <IdeaDownloadButton ideaId={idea.id} ideaTitle={idea.title} />
      </div>

      {isOpen && (
        <div className="w-full text-right bg-white rounded-lg shadow-sm p-4 mt-2 space-y-4">
          <div className="space-y-4">
            <IdeaTypeSection ideaType={idea.idea_type} />
            <IdeaDescriptionSection description={idea.description} />
            <IdeaProblemSection problem={idea.problem} />
            <IdeaOpportunitySection opportunity={idea.opportunity} />
            <IdeaBenefitsSection benefits={idea.benefits} />
            <IdeaResourcesSection resources={idea.resources} />
            <IdeaExecutionSection
              proposedExecutionDate={idea.proposed_execution_date}
              duration={idea.duration}
            />
            <IdeaDepartmentsSection departments={departments} />
            <IdeaPartnersSection partners={partners} />
            <IdeaCostsSection costs={costs} />
            <IdeaSupportingFilesSection files={idea.supporting_files} />
            <IdeaSimilarIdeasSection similarIdeas={idea.similar_ideas} />
          </div>
        </div>
      )}
    </div>
  );
};
