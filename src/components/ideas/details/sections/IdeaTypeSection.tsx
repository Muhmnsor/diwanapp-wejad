
import { FC } from "react";

interface IdeaTypeSectionProps {
  ideaType: string;
}

export const IdeaTypeSection: FC<IdeaTypeSectionProps> = ({ ideaType }) => {
  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">نوع الفكرة</h3>
      <p className="text-gray-700">{ideaType}</p>
    </section>
  );
};
