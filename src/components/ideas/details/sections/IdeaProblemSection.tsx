
import { FC } from "react";

interface IdeaProblemSectionProps {
  problem: string;
}

export const IdeaProblemSection: FC<IdeaProblemSectionProps> = ({ problem }) => {
  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">المشكلة</h3>
      <p className="text-gray-700 leading-relaxed">{problem}</p>
    </section>
  );
};
