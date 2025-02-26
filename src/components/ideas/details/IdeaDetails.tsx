
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { IdeaTypeSection } from "./sections/IdeaTypeSection";
import { IdeaProblemSection } from "./sections/IdeaProblemSection";
import { IdeaBenefitsSection } from "./sections/IdeaBenefitsSection";
import { IdeaOpportunitySection } from "./sections/IdeaOpportunitySection";
import { IdeaResourcesSection } from "./sections/IdeaResourcesSection";
import { IdeaExecutionSection } from "./sections/IdeaExecutionSection";
import { IdeaDescriptionSection } from "./sections/IdeaDescriptionSection";
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

  return (
    <div>
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

      {isOpen && (
        <div className="w-full space-y-2 text-right bg-white rounded-lg shadow-sm p-4 my-0 py-0">
          <div className="grid gap-2">
            <IdeaTypeSection ideaType={idea.idea_type} />
            <IdeaProblemSection problem={idea.problem} />
            <IdeaBenefitsSection benefits={idea.benefits} />
            <IdeaOpportunitySection opportunity={idea.opportunity} />
            <IdeaResourcesSection resources={idea.resources} />
            <IdeaExecutionSection
              proposedExecutionDate={idea.proposed_execution_date}
              duration={idea.duration}
            />
            <IdeaDescriptionSection description={idea.description} />
            <IdeaDepartmentsSection departments={idea.departments} />
            <IdeaPartnersSection partners={idea.partners} />
            <IdeaCostsSection costs={idea.costs} />
            <IdeaSupportingFilesSection files={idea.supporting_files} />
            <IdeaSimilarIdeasSection similarIdeas={idea.similar_ideas} />
          </div>
        </div>
      )}
    </div>
  );
};
