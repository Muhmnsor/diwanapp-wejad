
import { FC } from "react";
interface IdeaResourcesSectionProps {
  resources: string;
}
export const IdeaResourcesSection: FC<IdeaResourcesSectionProps> = ({
  resources
}) => {
  return <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">الموارد المطلوبة</h3>
      <p className="text-gray-700 leading-relaxed">{resources}</p>
    </section>;
};
