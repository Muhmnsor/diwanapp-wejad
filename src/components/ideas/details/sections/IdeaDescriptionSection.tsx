
import { FC } from "react";
interface IdeaDescriptionSectionProps {
  description: string;
}
export const IdeaDescriptionSection: FC<IdeaDescriptionSectionProps> = ({
  description
}) => {
  return <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">وصف الفكرة</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </section>;
};
