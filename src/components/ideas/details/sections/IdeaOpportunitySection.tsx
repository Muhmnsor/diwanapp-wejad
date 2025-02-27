
import { FC } from "react";
interface IdeaOpportunitySectionProps {
  opportunity: string;
}
export const IdeaOpportunitySection: FC<IdeaOpportunitySectionProps> = ({
  opportunity
}) => {
  return <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">الفرصة</h3>
      <p className="text-gray-700 leading-relaxed">{opportunity}</p>
    </section>;
};
