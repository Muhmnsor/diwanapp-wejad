
import { FC } from "react";

interface IdeaBenefitsSectionProps {
  benefits: string;
}

export const IdeaBenefitsSection: FC<IdeaBenefitsSectionProps> = ({ benefits }) => {
  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">الفوائد المتوقعة</h3>
      <p className="text-gray-700 leading-relaxed">{benefits}</p>
    </section>
  );
};
