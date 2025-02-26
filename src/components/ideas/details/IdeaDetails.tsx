
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IdeaTypeSection } from "./sections/IdeaTypeSection";
import { IdeaDescriptionSection } from "./sections/IdeaDescriptionSection";
import { IdeaProblemSection } from "./sections/IdeaProblemSection";
import { IdeaOpportunitySection } from "./sections/IdeaOpportunitySection";
import { IdeaBenefitsSection } from "./sections/IdeaBenefitsSection";
import { IdeaResourcesSection } from "./sections/IdeaResourcesSection";
import { IdeaExecutionSection } from "./sections/IdeaExecutionSection";
import { IdeaDepartmentsSection } from "./sections/IdeaDepartmentsSection";
import { IdeaCostsSection } from "./sections/IdeaCostsSection";
import { IdeaPartnersSection } from "./sections/IdeaPartnersSection";
import { IdeaSimilarIdeasSection } from "./sections/IdeaSimilarIdeasSection";
import { IdeaSupportingFilesSection } from "./sections/IdeaSupportingFilesSection";

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
    discussion_period: string;
    similar_ideas: { title: string; link: string }[];
    supporting_files: { name: string; file_path: string }[];
    proposed_execution_date: string;
    duration: string;
    idea_type: string;
    created_at: string;
  };
}

export const IdeaDetails = ({ idea }: IdeaDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-4 text-right bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-purple-50">
            {isOpen ? (
              <>
                <EyeOff className="ml-2 h-4 w-4 text-purple-600" />
                <span className="text-purple-600">إخفاء التفاصيل</span>
              </>
            ) : (
              <>
                <Eye className="ml-2 h-4 w-4 text-purple-600" />
                <span className="text-purple-600">عرض التفاصيل</span>
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        <h2 className="text-2xl font-semibold text-purple-700">تفاصيل الفكرة</h2>
      </div>

      <CollapsibleContent className="space-y-8">
        <IdeaTypeSection ideaType={idea.idea_type} />
        <IdeaDescriptionSection description={idea.description} />
        <IdeaProblemSection problem={idea.problem} />
        <IdeaOpportunitySection opportunity={idea.opportunity} />
        <IdeaBenefitsSection benefits={idea.benefits} />
        <IdeaResourcesSection resources={idea.required_resources} />
        <IdeaExecutionSection 
          proposedExecutionDate={idea.proposed_execution_date}
          duration={idea.duration}
        />
        <IdeaDepartmentsSection departments={idea.contributing_departments} />
        <IdeaCostsSection costs={idea.expected_costs} />
        <IdeaPartnersSection partners={idea.expected_partners} />
        <IdeaSimilarIdeasSection similarIdeas={idea.similar_ideas} />
        <IdeaSupportingFilesSection files={idea.supporting_files} />
      </CollapsibleContent>
    </Collapsible>
  );
};
