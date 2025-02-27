
import { FC } from "react";

interface IdeaProblemSectionProps {
  problem: string;
}

export const IdeaProblemSection: FC<IdeaProblemSectionProps> = ({ problem }) => {
  return (
    <section className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">المشكلة</h3>
      <p className="text-gray-700 leading-relaxed">{problem}</p>
    </section>
  );
};
