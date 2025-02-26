
import { FC } from "react";

interface IdeaTypeSectionProps {
  ideaType: string;
}

export const IdeaTypeSection: FC<IdeaTypeSectionProps> = ({ ideaType }) => {
  return (
    <section className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">نوع الفكرة</h3>
      <p className="text-gray-700">{ideaType}</p>
    </section>
  );
};
